/* eslint-disable */
// Data worker for fetching/decoding GTFS-RT, computing stats and trails
self.importScripts('https://unpkg.com/protobufjs@7.2.3/dist/protobuf.min.js');

let CONFIG = { 
  PROXY_FEED_URL: '', 
  PROTO_URL: '', 
  REFRESH_INTERVAL_MS: 10000,
  GTFS_BASE_URL: '',
  DECIMAL_RADIX: 10
};
let root = null, feedMessageType = null;
let autoTimer = null;

// GTFS static data structures (loaded in worker)
let allShapes = {};      // shape_id -> { geometry: { coordinates: [...] } }
let tripToShape = {};    // trip_id -> shape_id
let routeTypes = {};     // route_id -> route_type
let allStops = {};       // stop_id -> { id, name, lat, lon }
let tripStopTimes = {};  // trip_id -> [{stop_id, arrival_time, departure_time, stop_sequence}]
let routeStops = {};     // route_id -> Set(stop_id)
let routeToShapes = {};  // route_id -> Set(shape_id)
let options = { snapToRoute: true };
let gtfsLoaded = false;

// History for trails and speed
const vehicleHistory = {}; // vehicle_id -> [{coords, timestamp, speed, route_id, trip_id, label}]
const prevPositions = new Map(); // id -> [lon,lat]

const METERS_PER_DEGREE_LAT = 111320;
const RADIANS_PER_DEGREE = Math.PI / 180;
const MAX_SEGMENT_DIFF = 200;
const MAX_REASONABLE_DISTANCE = 2000;
const SNAP_THRESHOLD_M = 100;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

// GTFS Loading Functions

/**
 * Fetch and decompress a GTFS file
 * Uses brotli for WebKit browsers, gzip for everything else
 */
async function fetchAndDecompress(filename) {
  const isWebKit = /WebKit/.test(self.navigator.userAgent) && !/Chrome/.test(self.navigator.userAgent);
  const compressionFormat = isWebKit ? 'brotli' : 'gzip';
  const fileExtension = isWebKit ? '.br' : '.gz';
  const compressedUrl = `${CONFIG.GTFS_BASE_URL}${filename}${fileExtension}`;
  
  try {
    const compressedRes = await fetch(compressedUrl);
    if (compressedRes.ok) {
      const ds = new DecompressionStream(compressionFormat);
      const decompressedStream = compressedRes.body.pipeThrough(ds);
      const decompressed = await new Response(decompressedStream).arrayBuffer();
      const text = new TextDecoder().decode(decompressed);
      return text;
    }
  } catch (e) {
    // Fall through to uncompressed
  }
  
  // Fallback to uncompressed file
  const uncompressedUrl = `${CONFIG.GTFS_BASE_URL}${filename}`;
  const uncompressedRes = await fetch(uncompressedUrl);
  if (!uncompressedRes.ok) {
    throw new Error(`Failed to fetch ${filename}: HTTP ${uncompressedRes.status}`);
  }
  return await uncompressedRes.text();
}

/**
 * Parse a CSV line properly handling quoted fields with commas
 */
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField);
  return fields;
}

/**
 * Parse GTFS time string (HH:MM:SS) to seconds since midnight
 */
function parseGtfsTime(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return null;
  const hours = parseInt(parts[0], CONFIG.DECIMAL_RADIX);
  const minutes = parseInt(parts[1], CONFIG.DECIMAL_RADIX);
  const seconds = parseInt(parts[2], CONFIG.DECIMAL_RADIX);
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}

/**
 * Load and parse shapes data
 * Optimized: stores only coordinate arrays
 */
async function loadAndParseShapes() {
  const shapesTxt = await fetchAndDecompress('shapes.txt');
  
  const lines = shapesTxt.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines.shift());
  const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
  const tmp = {};
  
  for (const line of lines) {
    const parts = parseCSVLine(line);
    const sid = parts[idx["shape_id"]];
    const lat = parseFloat(parts[idx["shape_pt_lat"]]);
    const lon = parseFloat(parts[idx["shape_pt_lon"]]);
    const seq = parseInt(parts[idx["shape_pt_sequence"]], CONFIG.DECIMAL_RADIX);
    if (!tmp[sid]) tmp[sid] = [];
    tmp[sid].push({seq, coord:[lon,lat]});
  }
  
  // Sort and create final structure
  for (const sid in tmp) {
    tmp[sid].sort((a,b)=>a.seq-b.seq);
    const coords = new Array(tmp[sid].length);
    for (let i = 0; i < tmp[sid].length; i++) {
      coords[i] = tmp[sid][i].coord;
    }
    allShapes[sid] = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: coords },
      properties: { shape_id: sid }
    };
    delete tmp[sid];
  }
}

/**
 * Load and parse routes data to extract route_type information
 */
async function loadAndParseRoutes() {
  const routesTxt = await fetchAndDecompress('routes.txt');
  
  let firstLine = true;
  let ridx = {};
  const lines = routesTxt.split(/\r?\n/);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    if (firstLine) {
      const rheaders = parseCSVLine(line);
      ridx = Object.fromEntries(rheaders.map((h,i)=>[h,i]));
      firstLine = false;
      continue;
    }
    
    const parts = parseCSVLine(line);
    const routeId = parts[ridx["route_id"]];
    const routeType = parts[ridx["route_type"]];
    if (routeId && routeType !== undefined) {
      routeTypes[routeId] = parseInt(routeType, CONFIG.DECIMAL_RADIX);
    }
  }
}

/**
 * Load and parse trips data
 */
async function loadAndParseTrips() {
  const tripsTxt = await fetchAndDecompress('trips.txt');
  
  let firstLine = true;
  let tidx = {};
  const tripToRoute = {};
  const lines = tripsTxt.split(/\r?\n/);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    if (firstLine) {
      const theaders = parseCSVLine(line);
      tidx = Object.fromEntries(theaders.map((h,i)=>[h,i]));
      firstLine = false;
      continue;
    }
    
    const parts = parseCSVLine(line);
    const rid = parts[tidx["route_id"]];
    const sid = parts[tidx["shape_id"]];
    const tripId = parts[tidx["trip_id"]];
    if (!rid || !sid) continue;
    if (!routeToShapes[rid]) routeToShapes[rid] = new Set();
    routeToShapes[rid].add(sid);
    if (tripId) {
      tripToRoute[tripId] = rid;
      tripToShape[tripId] = sid;
    }
  }
  return tripToRoute;
}

/**
 * Load and parse stops data
 */
async function loadAndParseStops() {
  const stopsTxt = await fetchAndDecompress('stops.txt');
  
  let firstLine = true;
  let stopIdx = {};
  const lines = stopsTxt.split(/\r?\n/);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    if (firstLine) {
      const stopHeaders = parseCSVLine(line);
      stopIdx = Object.fromEntries(stopHeaders.map((h,i)=>[h,i]));
      firstLine = false;
      continue;
    }
    
    const parts = parseCSVLine(line);
    const stopId = parts[stopIdx["stop_id"]];
    const stopName = parts[stopIdx["stop_name"]] || '';
    const stopLat = parseFloat(parts[stopIdx["stop_lat"]]);
    const stopLon = parseFloat(parts[stopIdx["stop_lon"]]);
    if (stopId && !isNaN(stopLat) && !isNaN(stopLon)) {
      allStops[stopId] = {
        id: stopId,
        name: stopName,
        lat: stopLat,
        lon: stopLon
      };
    }
  }
}

/**
 * Load and parse stop times data
 */
async function loadAndParseStopTimes(tripToRoute) {
  const stopTimesTxt = await fetchAndDecompress('stop_times.txt');
  
  let firstLine = true;
  let stopTimeIdx = {};
  const lines = stopTimesTxt.split(/\r?\n/);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    if (firstLine) {
      const stopTimeHeaders = parseCSVLine(line);
      stopTimeIdx = Object.fromEntries(stopTimeHeaders.map((h,i)=>[h,i]));
      firstLine = false;
      continue;
    }
    
    const parts = parseCSVLine(line);
    const tripId = parts[stopTimeIdx["trip_id"]];
    const stopId = parts[stopTimeIdx["stop_id"]];
    const arrivalTimeStr = parts[stopTimeIdx["arrival_time"]];
    const departureTimeStr = parts[stopTimeIdx["departure_time"]];
    const stopSequence = parseInt(parts[stopTimeIdx["stop_sequence"]], CONFIG.DECIMAL_RADIX);
    
    if (tripId && stopId && arrivalTimeStr) {
      const arrivalTimeSeconds = parseGtfsTime(arrivalTimeStr);
      const departureTimeSeconds = departureTimeStr ? parseGtfsTime(departureTimeStr) : arrivalTimeSeconds;
      
      if (!tripStopTimes[tripId]) tripStopTimes[tripId] = [];
      tripStopTimes[tripId].push({
        stop_id: stopId,
        arrival_time: arrivalTimeSeconds,
        departure_time: departureTimeSeconds,
        stop_sequence: stopSequence
      });
      
      const routeId = tripToRoute[tripId];
      if (routeId) {
        if (!routeStops[routeId]) routeStops[routeId] = new Set();
        routeStops[routeId].add(stopId);
      }
    }
  }
}

/**
 * Load all GTFS static data
 */
async function loadGTFS() {
  const [, , tripToRoute] = await Promise.all([
    loadAndParseShapes(),
    loadAndParseRoutes(),
    loadAndParseTrips(),
    loadAndParseStops()
  ]);
  
  await loadAndParseStopTimes(tripToRoute);
  gtfsLoaded = true;
  
  // Send compact data to main thread
  sendGTFSDataToMain();
}

/**
 * Send only necessary GTFS data to main thread in compact format
 * Only sends counts and summary info, not the full datasets
 */
function sendGTFSDataToMain() {
  self.postMessage({
    type: 'gtfsLoaded',
    data: {
      shapeCount: Object.keys(allShapes).length,
      stopCount: Object.keys(allStops).length,
      routeCount: Object.keys(routeTypes).length,
      tripCount: Object.keys(tripToShape).length
    }
  });
}

// Constants used for snapping and distances

function feedToGeoJSON(feedObj) {
  if (!feedObj?.entity) return { type: 'FeatureCollection', features: [] };
  const feats = [];
  for (const e of feedObj.entity) {
    const vp = e.vehicle?.position;
    if (!vp || vp.latitude == null || vp.longitude == null) continue;
    const vehicleId = e.id || e.vehicle?.vehicle?.id || null;
    const routeId = e.vehicle?.trip?.routeId || null;
    const rtype = routeId ? (routeTypes[routeId] ?? 3) : 3;
    const props = {
      id: vehicleId,
      label: e.vehicle?.trip?.routeId?.split('-')[0] || null,
      human_readable_id: e.vehicle?.vehicle?.label || null,
      route_id: routeId,
      trip_id: e.vehicle?.trip?.tripId || null,
      bearing: vp.bearing || null,
      speed: vp.speed || 0,
      current_stop_sequence: e.vehicle?.currentStopSequence || null,
      timestamp: e.vehicle?.timestamp || null,
      route_type: rtype
    };
    feats.push({ type: 'Feature', id: vehicleId, geometry: { type: 'Point', coordinates: [vp.longitude, vp.latitude] }, properties: props });
  }
  return { type: 'FeatureCollection', features: feats };
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * RADIANS_PER_DEGREE;
  const dLon = (lon2 - lon1) * RADIANS_PER_DEGREE;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*RADIANS_PER_DEGREE)*Math.cos(lat2*RADIANS_PER_DEGREE)*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function nearestPointOnSegment(coord, segStart, segEnd) {
  const [lon, lat] = coord;
  const [lon1, lat1] = segStart;
  const [lon2, lat2] = segEnd;
  if (lon1 === lon2 && lat1 === lat2) {
    const dist = haversineDistance(lat, lon, lat1, lon1);
    return { point: [lon1, lat1], distance: dist };
  }
  const latMid = (lat1 + lat2) / 2;
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos(latMid * RADIANS_PER_DEGREE);
  const px = (lon - lon1) * metersPerDegreeLon;
  const py = (lat - lat1) * METERS_PER_DEGREE_LAT;
  const dx = (lon2 - lon1) * metersPerDegreeLon;
  const dy = (lat2 - lat1) * METERS_PER_DEGREE_LAT;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
  const nearestLon = lon1 + t * (lon2 - lon1);
  const nearestLat = lat1 + t * (lat2 - lat1);
  const dist = haversineDistance(lat, lon, nearestLat, nearestLon);
  return { point: [nearestLon, nearestLat], distance: dist };
}

function findNearestPointOnShape(coord, shapeCoords) {
  let minDist = Infinity;
  let nearestPoint = null;
  let nearestSegmentIndex = -1;
  for (let i = 0; i < shapeCoords.length - 1; i++) {
    const res = nearestPointOnSegment(coord, shapeCoords[i], shapeCoords[i+1]);
    if (res.distance < minDist) {
      minDist = res.distance;
      nearestPoint = res.point;
      nearestSegmentIndex = i;
      if (minDist < 5) break; // early exit
    }
  }
  return { point: nearestPoint, segmentIndex: nearestSegmentIndex, distance: minDist };
}

function getPathAlongShape(shapeCoords, startPoint, startSegIdx, endPoint, endSegIdx) {
  const path = [];
  const segmentDiff = Math.abs(endSegIdx - startSegIdx);
  if (segmentDiff > MAX_SEGMENT_DIFF) {
    let totalDist = 0;
    const forward = endSegIdx > startSegIdx;
    if (forward) {
      for (let i = startSegIdx; i < endSegIdx && i < shapeCoords.length - 1; i++) {
        totalDist += haversineDistance(shapeCoords[i][1], shapeCoords[i][0], shapeCoords[i+1][1], shapeCoords[i+1][0]);
      }
    } else {
      for (let i = startSegIdx; i > endSegIdx && i > 0; i--) {
        totalDist += haversineDistance(shapeCoords[i][1], shapeCoords[i][0], shapeCoords[i-1][1], shapeCoords[i-1][0]);
      }
    }
    if (totalDist > MAX_REASONABLE_DISTANCE) return null;
  }
  path.push(startPoint);
  if (startSegIdx === endSegIdx) { path.push(endPoint); return path; }
  const forward = endSegIdx > startSegIdx;
  if (forward) {
    for (let i = startSegIdx + 1; i <= endSegIdx; i++) path.push(shapeCoords[i]);
  } else {
    for (let i = startSegIdx; i >= endSegIdx + 1; i--) path.push(shapeCoords[i]);
  }
  path.push(endPoint);
  return path;
}

function createLineFeature(coordinates, properties) {
  return { type: 'Feature', geometry: { type: 'LineString', coordinates }, properties };
}
function createFeatureCollection(features = []) { return { type: 'FeatureCollection', features }; }

/**
 * Generate route shapes GeoJSON for requested route IDs
 */
function generateRouteShapesGeoJSON(routeIds) {
  const features = [];
  const routeIdSet = new Set(routeIds);
  
  for (const rid of routeIdSet) {
    const shapeIds = routeToShapes[rid];
    if (shapeIds) {
      for (const sid of shapeIds) {
        const shape = allShapes[sid];
        if (shape) {
          features.push(shape);
        }
      }
    }
  }
  
  return createFeatureCollection(features);
}

/**
 * Generate stops GeoJSON for requested route IDs or all stops
 */
function generateStopsGeoJSON(routeIds) {
  const features = [];
  let stopIdsToShow = new Set();
  
  if (routeIds && routeIds.length > 0) {
    // Get stops for specific routes
    for (const rid of routeIds) {
      const stops = routeStops[rid];
      if (stops) {
        stops.forEach(sid => stopIdsToShow.add(sid));
      }
    }
  } else {
    // All stops
    stopIdsToShow = new Set(Object.keys(allStops));
  }
  
  for (const stopId of stopIdsToShow) {
    const stop = allStops[stopId];
    if (stop) {
      features.push({
        type: 'Feature',
        id: stopId,
        geometry: {
          type: 'Point',
          coordinates: [stop.lon, stop.lat]
        },
        properties: {
          id: stopId,
          name: stop.name
        }
      });
    }
  }
  
  return createFeatureCollection(features);
}

/**
 * Get upcoming arrivals for a specific stop
 */
function getStopArrivals(stopId, currentTimeSeconds) {
  const arrivals = [];
  
  for (const tripId in tripStopTimes) {
    const stopTimes = tripStopTimes[tripId];
    for (const st of stopTimes) {
      if (st.stop_id === stopId && st.arrival_time >= currentTimeSeconds) {
        const timeDiff = st.arrival_time - currentTimeSeconds;
        if (timeDiff <= 30 * 60) { // Next 30 minutes
          arrivals.push({
            trip_id: tripId,
            arrival_time: st.arrival_time,
            minutes_until: Math.floor(timeDiff / 60)
          });
        }
      }
    }
  }
  
  arrivals.sort((a, b) => a.arrival_time - b.arrival_time);
  return arrivals;
}

/**
 * Get stop times for a specific trip (for vehicle detail popup)
 */
function getTripStopTimes(tripId) {
  const stopTimes = tripStopTimes[tripId];
  if (!stopTimes) return [];
  
  return stopTimes.map(st => ({
    stop_id: st.stop_id,
    stop_name: allStops[st.stop_id]?.name || st.stop_id,
    arrival_time: st.arrival_time,
    departure_time: st.departure_time,
    stop_sequence: st.stop_sequence
  }));
}

/**
 * Get route type for a route ID (for emoji display)
 */
function getRouteType(routeId) {
  return routeTypes[routeId] ?? 3;
}

function updateHistory(currentGeoJSON) {
  const now = Date.now();
  const activeVehicleIds = new Set();
  for (const { properties, geometry } of currentGeoJSON.features) {
    const { timestamp, id: vehicleId, speed, route_id, trip_id, label } = properties;
    if (timestamp && vehicleId) {
      activeVehicleIds.add(vehicleId);
      const tsMs = Number(timestamp) * 1000;
      vehicleHistory[vehicleId] ??= [];
      const history = vehicleHistory[vehicleId];
      const isDuplicate = history.length > 0 && history[history.length - 1].timestamp === tsMs;
      if (!isDuplicate) {
        history.push({ coords: geometry.coordinates, timestamp: tsMs, speed: speed || 0, route_id, trip_id, label });
      }
      if (history.length > 1) {
        const cutoffTime = now - 10 * 60 * 1000; // 10 minutes
        let firstValidIndex = 0;
        while (firstValidIndex < history.length && history[firstValidIndex].timestamp < cutoffTime) firstValidIndex++;
        if (firstValidIndex > 0) history.splice(0, firstValidIndex);
      }
    }
  }
  const cutoffTime = now - 5 * 60 * 1000;
  for (const vehicleId in vehicleHistory) {
    const history = vehicleHistory[vehicleId];
    const isInactive = !activeVehicleIds.has(vehicleId) && history.length > 0 && history[history.length - 1].timestamp < cutoffTime;
    if (isInactive || history.length === 0) delete vehicleHistory[vehicleId];
  }
}

function calculateAverageSpeed(history) {
  if (!history || history.length < 2) return 0;
  const reportedSpeeds = history.map(h => h.speed).filter(s => s > 0);
  if (reportedSpeeds.length > 0) return reportedSpeeds.reduce((a,b)=>a+b,0)/reportedSpeeds.length;
  let totalDistance = 0, totalTime = 0;
  for (let i = 1; i < history.length; i++) {
    const a = history[i-1], b = history[i];
    const dt = (b.timestamp - a.timestamp) / 1000;
    if (dt > 0) {
      totalDistance += haversineDistance(a.coords[1], a.coords[0], b.coords[1], b.coords[0]);
      totalTime += dt;
    }
  }
  return totalTime > 0 ? totalDistance / totalTime : 0;
}

function buildTrailsGeoJSON() {
  const features = [];
  for (const vehicleId in vehicleHistory) {
    const history = vehicleHistory[vehicleId];
    if (history.length < 2) continue;
    const avgSpeed = calculateAverageSpeed(history);
    const last = history[history.length - 1];
    const shapeId = last.trip_id ? tripToShape[last.trip_id] : null;
    const shape = shapeId ? allShapes[shapeId] : null;
    const shapeCoords = shape ? shape.geometry.coordinates : null;
    let coords = [];
    if (options.snapToRoute && shapeCoords && shapeCoords.length >= 2) {
      const nearestResults = new Array(history.length);
      for (let i = 0; i < history.length; i++) nearestResults[i] = findNearestPointOnShape(history[i].coords, shapeCoords);
      let currentSegment = [];
      const segments = [];
      for (let i = 0; i < history.length; i++) {
        const pos = history[i];
        const nr = nearestResults[i];
        const sameTrip = !pos.trip_id || pos.trip_id === last.trip_id;
        if (sameTrip && nr.distance <= SNAP_THRESHOLD_M) {
          if (currentSegment.length === 0) {
            currentSegment.push(nr.point);
          } else {
            const prevNearest = nearestResults[i-1];
            const prevSameTrip = !history[i-1].trip_id || history[i-1].trip_id === last.trip_id;
            if (prevSameTrip && prevNearest.distance <= SNAP_THRESHOLD_M) {
              const seg = getPathAlongShape(shapeCoords, currentSegment[currentSegment.length-1], prevNearest.segmentIndex, nr.point, nr.segmentIndex);
              if (seg !== null) {
                for (let j=1;j<seg.length;j++) currentSegment.push(seg[j]);
              } else {
                if (currentSegment.length >= 2) segments.push([...currentSegment]);
                currentSegment = [nr.point];
              }
            } else {
              if (currentSegment.length >= 2) segments.push([...currentSegment]);
              currentSegment = [nr.point];
            }
          }
        } else {
          if (currentSegment.length >= 2) segments.push([...currentSegment]);
          currentSegment = [];
        }
      }
      if (currentSegment.length >= 2) segments.push([...currentSegment]);
      for (const segmentCoords of segments) features.push(createLineFeature(segmentCoords, { vehicle_id: vehicleId, speed: avgSpeed }));
      continue;
    } else {
      coords = history.map(h => h.coords);
    }
    if (coords.length >= 2) features.push(createLineFeature(coords, { vehicle_id: vehicleId, speed: avgSpeed }));
  }
  return createFeatureCollection(features);
}

function computeStats(geojson) {
  const features = geojson.features || [];
  const activeIds = new Set(features.map(f => f.properties.id));
  
  // Clean up inactive vehicles from prevPositions
  for (const id of prevPositions.keys()) {
    if (!activeIds.has(id)) {
      prevPositions.delete(id);
    }
  }
  
  const routeCounts = new Map();
  let movingCount = 0; let speedSum = 0; let fastest = null; let slowest = null;
  for (const f of features) {
    const rid = f.properties.route_id;
    if (rid) routeCounts.set(rid, (routeCounts.get(rid)||0)+1);
    const id = f.properties.id;
    const prev = prevPositions.get(id);
    if (prev) {
      let sp = f.properties.speed || 0;
      if (sp>0) { movingCount++; speedSum += sp; }
      if (sp>0 && (!fastest || sp>fastest.speed)) fastest = {label: f.properties.label||rid, speed: sp};
      if (sp>0 && (!slowest || sp<slowest.speed)) slowest = {label: f.properties.label||rid, speed: sp};
    }
    prevPositions.set(id, f.geometry.coordinates);
  }
  const avg = movingCount>0 ? (speedSum/movingCount*3.6).toFixed(1) : null; // km/h
  return {
    totalVehicles: features.length,
    uniqueRoutes: routeCounts.size,
    stationary: features.length - movingCount,
    avgSpeedKmh: avg,
    fastest: fastest ? { label: fastest.label, kmh: (fastest.speed*3.6).toFixed(1) } : null,
    slowest: slowest ? { label: slowest.label, kmh: (slowest.speed*3.6).toFixed(1) } : null
  };
}

async function ensureProto() {
  if (feedMessageType) return;
  const res = await fetch(CONFIG.PROTO_URL);
  const text = await res.text();
  const parsed = protobuf.parse(text);
  root = parsed.root;
  feedMessageType = root.lookupType('transit_realtime.FeedMessage');
}

function buildAnimationPaths(geojson) {
  const paths = {};
  for (const f of geojson.features) {
    const id = f.properties.id;
    const tripId = f.properties.trip_id;
    if (!id || !tripId) continue;
    const shapeId = tripToShape[tripId];
    const shape = shapeId ? allShapes[shapeId] : null;
    const shapeCoords = shape ? shape.geometry.coordinates : null;
    const prev = prevPositions.get(id);
    const target = f.geometry.coordinates;
    if (!prev || !shapeCoords || shapeCoords.length < 2) continue;
    const prevNearest = findNearestPointOnShape(prev, shapeCoords);
    const targetNearest = findNearestPointOnShape(target, shapeCoords);
    if (prevNearest.distance <= SNAP_THRESHOLD_M && targetNearest.distance <= SNAP_THRESHOLD_M) {
      const path = getPathAlongShape(shapeCoords, prevNearest.point, prevNearest.segmentIndex, targetNearest.point, targetNearest.segmentIndex);
      if (path && path.length >= 2) paths[id] = path;
    }
  }
  return paths;
}

async function fetchOnce() {
  try {
    await ensureProto();
    const res = await fetch(CONFIG.PROXY_FEED_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP '+res.status);
    const buffer = await res.arrayBuffer();
    const msg = feedMessageType.decode(new Uint8Array(buffer));
    const obj = feedMessageType.toObject(msg, { longs: String, enums: String, bytes: String });
    const geojson = feedToGeoJSON(obj);
    const paths = options.snapToRoute ? buildAnimationPaths(geojson) : {};
    updateHistory(geojson);
    const stats = computeStats(geojson);
    let trails = null;
    try { 
      trails = buildTrailsGeoJSON(); 
    } catch (e) {
      console.error('Failed to build trails:', e);
      trails = null;
    }
    self.postMessage({ type: 'update', geojson, stats, trails, paths, ts: Date.now() });
  } catch (e) {
    self.postMessage({ type: 'error', error: String(e) });
  }
}

function startAuto() { stopAuto(); autoTimer = setInterval(fetchOnce, CONFIG.REFRESH_INTERVAL_MS); }
function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer=null; } }

self.onmessage = (ev) => {
  const m = ev.data || {};
  if (m.type === 'init') {
    CONFIG = { ...CONFIG, ...m.config };
    self.postMessage({ type: 'ready' });
  } else if (m.type === 'loadGTFS') {
    // Load GTFS data in worker
    loadGTFS().catch(e => {
      self.postMessage({ type: 'error', error: 'GTFS load failed: ' + String(e) });
    });
  } else if (m.type === 'refresh') {
    fetchOnce();
  } else if (m.type === 'setAutoRefresh') {
    if (m.enabled) { CONFIG.REFRESH_INTERVAL_MS = m.intervalMs || CONFIG.REFRESH_INTERVAL_MS; startAuto(); }
    else stopAuto();
  } else if (m.type === 'setOptions') {
    options = { ...options, ...m.options };
  } else if (m.type === 'getRouteShapes') {
    // Generate route shapes GeoJSON
    const geojson = generateRouteShapesGeoJSON(m.routeIds || []);
    self.postMessage({ type: 'routeShapes', geojson, requestId: m.requestId });
  } else if (m.type === 'getStops') {
    // Generate stops GeoJSON
    const geojson = generateStopsGeoJSON(m.routeIds);
    self.postMessage({ type: 'stops', geojson, requestId: m.requestId });
  } else if (m.type === 'getStopArrivals') {
    // Get upcoming arrivals for a stop
    const arrivals = getStopArrivals(m.stopId, m.currentTimeSeconds);
    self.postMessage({ type: 'stopArrivals', arrivals, stopId: m.stopId, requestId: m.requestId });
  } else if (m.type === 'getTripStopTimes') {
    // Get stop times for a trip
    const stopTimes = getTripStopTimes(m.tripId);
    self.postMessage({ type: 'tripStopTimes', stopTimes, tripId: m.tripId, requestId: m.requestId });
  } else if (m.type === 'getRouteType') {
    // Get route type
    const routeType = getRouteType(m.routeId);
    self.postMessage({ type: 'routeType', routeType, routeId: m.routeId, requestId: m.requestId });
  }
};
