// GLOBAL CONSTANTS

// Configuration constants
const PROXY_FEED_URL = 'https://api.codetabs.com/v1/proxy?quest=https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions';
// Support both GitHub Pages (/brisbus/) and local dev
const GTFS_BASE_URL = window.location.pathname.includes('/brisbus/') ? '/brisbus/data/' : '/data/';
const PROTO_URL = 'https://raw.githubusercontent.com/google/transit/master/gtfs-realtime/proto/gtfs-realtime.proto';
const REFRESH_INTERVAL_MS = 10000;
const HISTORY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes for trails
const LOCATION_UPDATE_INTERVAL_MS = 30000; // 30 seconds for user location updates

// Geographic and mathematical constants
const METERS_PER_DEGREE_LAT = 111320; // Approximate meters per degree of latitude (roughly constant)
const DEGREES_IN_CIRCLE = 360;
const RADIANS_PER_DEGREE = Math.PI / 180;

// Time conversion constants
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_HALF_DAY = 12 * 3600;
const SECONDS_PER_DAY = 24 * 3600;
const MILLISECONDS_PER_SECOND = 1000;

// Number parsing
const DECIMAL_RADIX = 10;

// Map view constants
const FOLLOW_MODE_ZOOM = 16;
const FOLLOW_MODE_PITCH = 60;
const FOLLOW_MODE_INITIAL_BEARING = 0;

// Animation and timing constants
const ANIMATION_DURATION_MS = 2000;  // 2 seconds
const SMOOTH_ANIMATION_DURATION_MS = 22500;  // 22.5 seconds - prevents overlapping animations
const SLIDESHOW_DURATION_MS = 30000; // 30 seconds per vehicle
const SLIDESHOW_INTERVAL_MIN_SECONDS = 5; // Minimum slideshow interval
const SLIDESHOW_INTERVAL_MAX_SECONDS = 300; // Maximum slideshow interval (5 minutes)
const SLIDESHOW_INTERVAL_DEFAULT_SECONDS = 30; // Default slideshow interval
const SLIDESHOW_INTERVAL_STEP_SECONDS = 5; // Step size for interval input
const ROTATION_FULL_CYCLE_SECONDS = 60; // Complete 360° rotation in 60 seconds
const ROTATION_SPEED = DEGREES_IN_CIRCLE / ROTATION_FULL_CYCLE_SECONDS; // 6° per second - slower rotation
const FOLLOW_MODE_FLY_DURATION_MS = 2000;
const FOLLOW_MODE_FLY_BUFFER_MS = 100; // Small buffer after flyTo completes
const CIRCLE_TRANSITION_DURATION_MS = 2000;
const UI_UPDATE_INTERVAL_MS = 1000; // Update UI every second

// Path calculation constants
const MAX_SEGMENT_DIFF = 200; // Allow more segments for curves
const MAX_REASONABLE_DISTANCE = 2000; // 2km - max distance for trail segments
const SNAP_THRESHOLD_M = 100; // 100m threshold for snapping to route

// Distance calculation time intervals (in seconds)
const DISTANCE_INTERVALS_SECONDS = [10, 20, 30, 60, 120, 180, 300, 600];

// Speed thresholds for color mapping (m/s)
const SPEED_STATIONARY = 0;
const SPEED_SLOW = 5;      // 5 m/s ≈ 18 km/h
const SPEED_MEDIUM = 10;   // 10 m/s ≈ 36 km/h
const SPEED_FAST = 15;     // 15 m/s ≈ 54 km/h
const SPEED_VERY_FAST = 20; // 20 m/s ≈ 72 km/h

// Speed threshold for statistics (km/h)
const SPEED_THRESHOLD_HIGH = 40;
const SPEED_THRESHOLD_LOW = 20;

// ETA color thresholds (minutes)
const ETA_IMMEDIATE = 1;
const ETA_VERY_SOON = 5;
const ETA_SOON = 10;
const ETA_MEDIUM = 15;

// Time constants for upcoming arrivals
const THIRTY_MINUTES_MS = 30 * 60 * MILLISECONDS_PER_SECOND;
const STOPS_TO_MINUTES_RATIO = 2; // Fallback: estimate 2 minutes per stop

// GTFS route_type to emoji mapping
// Based on GTFS specification: https://developers.google.com/transit/gtfs/reference#routestxt
const DEFAULT_ROUTE_TYPE = 3; // Default to bus (GTFS route_type 3) if unknown
const DEFAULT_VEHICLE_EMOJI = '🚌'; // Default to bus if route_type is unknown

// Vehicle display modes
const VEHICLE_DISPLAY_MODES = {
  DOTS: 'dots',
  EMOJI: 'emoji',
  SINGLE_CHAR: 'single-char',
  ARROW: 'arrow'
};

// GTFS route_type to single character mapping
const ROUTE_TYPE_TO_CHAR = {
  0: 'T',  // Tram
  1: 'S',  // Subway
  2: 'R',  // Rail
  3: 'B',  // Bus
  4: 'F',  // Ferry
  5: 'C',  // Cable Tram
  6: 'A',  // Aerial Lift
  7: 'N',  // Funicular
  11: 'L', // Trolleybus
  12: 'M'  // Monorail
};

// Canvas size for emoji and character rendering
const EMOJI_CANVAS_SIZE = 64;
const CHAR_CANVAS_SIZE = 64;

// Map layer paint properties
const ROUTE_LINE_COLOR = '#0077cc';
const ROUTE_LINE_WIDTH = 2;
const ROUTE_LINE_OPACITY = 0.6;

const STOP_CIRCLE_RADIUS = 3;
const STOP_CIRCLE_COLOR = '#9E9E9E';
const STOP_CIRCLE_STROKE_WIDTH = 1;
const STOP_CIRCLE_STROKE_COLOR = '#fff';
const STOP_CIRCLE_OPACITY = 0.7;

const USER_LOCATION_RADIUS = 7;
const USER_LOCATION_COLOR = '#0066ff';
const USER_LOCATION_OPACITY = 0.8;
const USER_LOCATION_STROKE_WIDTH = 2;
const USER_LOCATION_STROKE_COLOR = '#fff';

// Trail line properties
const TRAIL_LINE_WIDTH = 2;
const TRAIL_LINE_OPACITY = 0.6;

// Colors for speed visualization
const COLOR_STATIONARY = '#888888';
const COLOR_SLOW = '#F44336';
const COLOR_MEDIUM = '#FF9800';
const COLOR_FAST = '#FFC107';
const COLOR_VERY_FAST = '#4CAF50';

// ETA colors
const COLOR_ETA_IMMEDIATE = '#F44336';  // Red
const COLOR_ETA_SOON = '#FF9800';       // Orange
const COLOR_ETA_MEDIUM = '#FFC107';     // Amber
const COLOR_ETA_COMFORTABLE = '#4CAF50'; // Green

// Zoom levels
const DEFAULT_ZOOM = 11;
const USER_LOCATION_ZOOM = 14;
const STOPS_MIN_ZOOM = 13; // Hide stops below this zoom level

// Time intervals for history pruning
const HALF_INTERVAL_MS = 500; // Half of typical interval for tolerance
const INACTIVE_VEHICLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes - remove inactive vehicles

// Clustering
const STOP_CLUSTER_RADIUS = 50; // Cluster stops within 50px
const STOP_CLUSTER_MAX_ZOOM = 14; // Stop clustering at zoom 14

// Debug logging
const MAX_DEBUG_LOGS = 500; // Limit debug logs to prevent unbounded memory growth

// DOM ELEMENTS AND STATE

// Debug logging system
const debugLogs = [];
const statusBarEl = document.getElementById('statusBar');
const debugToggleEl = document.getElementById('debugToggle');
const debugPaneEl = document.getElementById('debugPane');
const debugContentEl = document.getElementById('debugContent');
const clearLogsBtnEl = document.getElementById('clearLogsBtn');
const closeDebugBtnEl = document.getElementById('closeDebugBtn');

// Stats system
const statsToggleEl = document.getElementById('statsToggle');
const statsBoxEl = document.getElementById('statsBox');
const statTotalVehiclesEl = document.getElementById('statTotalVehicles');
const statUniqueRoutesEl = document.getElementById('statUniqueRoutes');
const statAvgSpeedEl = document.getElementById('statAvgSpeed');
const statFastestVehicleEl = document.getElementById('statFastestVehicle');
const statSlowestVehicleEl = document.getElementById('statSlowestVehicle');
const statStationaryVehiclesEl = document.getElementById('statStationaryVehicles');
const statBusiestRouteEl = document.getElementById('statBusiestRoute');
const statTotalStopsEl = document.getElementById('statTotalStops');

function updateStatus(message) {
  if (statusBarEl) {
    statusBarEl.textContent = message;
  }
  logDebug(message, 'info');
}

function logDebug(message, level = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = { timestamp, message, level };
  
  // Limit array size before push to prevent unbounded growth
  if (debugLogs.length >= MAX_DEBUG_LOGS) {
    debugLogs.shift();
  }
  debugLogs.push(logEntry);
  
  // Only update DOM if debug pane is visible (performance optimization)
  if (debugPaneEl.classList.contains('visible')) {
    const entryEl = document.createElement('div');
    entryEl.className = `log-entry ${level}`;
    entryEl.innerHTML = `<span class="timestamp">${timestamp}</span><span class="message">${escapeHtml(message)}</span>`;
    debugContentEl.appendChild(entryEl);
    
    // Remove oldest DOM element if exceeding limit
    while (debugContentEl.children.length > MAX_DEBUG_LOGS) {
      debugContentEl.removeChild(debugContentEl.firstChild);
    }
    
    // Auto-scroll to bottom
    debugContentEl.scrollTop = debugContentEl.scrollHeight;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function hideStatusBar() {
  if (statusBarEl) {
    statusBarEl.classList.add('hidden');
  }
}

function lockUI() {
  // Disable all interactive UI elements during initialization
  interactiveElements.forEach(el => { if (el) el.disabled = true; });
}

function unlockUI() {
  // Enable all interactive UI elements after initialization
  interactiveElements.forEach(el => { if (el) el.disabled = false; });
}

function clearDebugLogs() {
  debugLogs.length = 0;
  debugContentEl.innerHTML = '';
}

function updateStats(vehiclesData) {
  // Skip calculations if stats panel is not visible (performance optimization)
  if (!statsBoxEl.classList.contains('visible')) {
    return;
  }
  
  try {
    // Update Total Stops (doesn't depend on vehicle data)
    statTotalStopsEl.textContent = gtfsStats.stopCount || 0;
    
    // If no vehicle data, reset vehicle-dependent stats
    if (!vehiclesData?.features?.length) {
      statTotalVehiclesEl.textContent = '0';
      statUniqueRoutesEl.textContent = '0';
      statAvgSpeedEl.textContent = '—';
      statFastestVehicleEl.textContent = '—';
      statSlowestVehicleEl.textContent = '—';
      statStationaryVehiclesEl.textContent = '0';
      statBusiestRouteEl.textContent = '—';
      return;
    }
  
  // Total vehicles
  statTotalVehiclesEl.textContent = vehiclesData.features.length;
  
  // Unique routes
  const uniqueRoutes = new Set();
  const routeCounts = {};
  
  for (const { properties } of vehiclesData.features) {
    if (properties.route_id) {
      uniqueRoutes.add(properties.route_id);
      routeCounts[properties.route_id] = (routeCounts[properties.route_id] || 0) + 1;
    }
  }
  
  statUniqueRoutesEl.textContent = uniqueRoutes.size;
  
  // Busiest route (route with most vehicles)
  const busiestEntry = Object.entries(routeCounts).reduce((max, [routeId, count]) => 
    count > max.count ? { routeId, count } : max, 
    { routeId: null, count: 0 }
  );
  
  if (busiestEntry.routeId) {
    const routeLabel = busiestEntry.routeId.split("-")[0];
    statBusiestRouteEl.textContent = `${routeLabel} (${busiestEntry.count} vehicles)`;
  } else {
    statBusiestRouteEl.textContent = '—';
  }
  
  // Speed statistics - calculate from position history if GTFS-RT doesn't provide speed
  const vehicleSpeeds = []; // Array of {id, label, route_id, speed} for vehicles with calculable speed
  
  for (const { properties } of vehiclesData.features) {
    const { id: vehicleId, speed: reportedSpeed, label, route_id } = properties;
    let speedMps = null;
    
    // First try to use reported speed from GTFS-RT
    if (reportedSpeed > 0) {
      speedMps = reportedSpeed;
    } else {
      const history = vehicleHistory[vehicleId];
      if (history?.length >= 2) {
        // Calculate speed from position history
        let totalDistance = 0;
        let totalTime = 0;
        
        for (let i = 1; i < history.length; i++) {
          const { coords: prevCoords, timestamp: prevTime } = history[i - 1];
          const { coords: currCoords, timestamp: currTime } = history[i];
          const timeDiff = (currTime - prevTime) / MILLISECONDS_PER_SECOND;
          
          if (timeDiff > 0) {
            const dist = haversineDistance(
              prevCoords[1], prevCoords[0],
              currCoords[1], currCoords[0]
            );
            totalDistance += dist;
            totalTime += timeDiff;
          }
        }
        
        if (totalTime > 0) {
          speedMps = totalDistance / totalTime; // meters per second
        }
      }
    }
    
    if (speedMps > 0) {
      vehicleSpeeds.push({
        id: vehicleId,
        label: label || route_id?.split("-")[0] || '?',
        route_id,
        speed: speedMps
      });
    }
  }
  
  // Stationary vehicles (no speed data or speed is 0)
  const stationaryCount = vehiclesData.features.length - vehicleSpeeds.length;
  statStationaryVehiclesEl.textContent = stationaryCount;
  
  if (vehicleSpeeds.length > 0) {
    // Average speed (m/s to km/h)
    const avgSpeedMps = vehicleSpeeds.reduce((sum, v) => sum + v.speed, 0) / vehicleSpeeds.length;
    const avgSpeedKmh = (avgSpeedMps * 3.6).toFixed(1);
    statAvgSpeedEl.textContent = `${avgSpeedKmh} km/h`;
    
    // Fastest vehicle
    const fastest = vehicleSpeeds.reduce((max, v) => v.speed > max.speed ? v : max);
    const fastestSpeedKmh = (fastest.speed * 3.6).toFixed(1);
    statFastestVehicleEl.textContent = `${fastest.label} (${fastestSpeedKmh} km/h)`;
    
    // Slowest vehicle (but still moving)
    const slowest = vehicleSpeeds.reduce((min, v) => v.speed < min.speed ? v : min);
    const slowestSpeedKmh = (slowest.speed * 3.6).toFixed(1);
    statSlowestVehicleEl.textContent = `${slowest.label} (${slowestSpeedKmh} km/h)`;
  } else {
    statAvgSpeedEl.textContent = '—';
    statFastestVehicleEl.textContent = '—';
    statSlowestVehicleEl.textContent = '—';
  }
  } catch (e) {
    // Silently ignore errors when called before initialization
    // This can happen if the stats panel is toggled before the app is fully loaded
  }
}

// Toggle debug pane
debugToggleEl.addEventListener('click', () => {
  const wasVisible = debugPaneEl.classList.contains('visible');
  debugPaneEl.classList.toggle('visible');
  debugToggleEl.classList.toggle('active');
  
  // Rebuild debug logs when opening (performance optimization)
  if (!wasVisible && debugPaneEl.classList.contains('visible')) {
    debugContentEl.innerHTML = '';
    for (const { timestamp, message, level } of debugLogs) {
      const entryEl = document.createElement('div');
      entryEl.className = `log-entry ${level}`;
      entryEl.innerHTML = `<span class="timestamp">${timestamp}</span><span class="message">${escapeHtml(message)}</span>`;
      debugContentEl.appendChild(entryEl);
    }
    debugContentEl.scrollTop = debugContentEl.scrollHeight;
  }
});

clearLogsBtnEl.addEventListener('click', () => {
  clearDebugLogs();
  logDebug('Debug logs cleared', 'info');
});

closeDebugBtnEl.addEventListener('click', () => {
  debugPaneEl.classList.remove('visible');
  debugToggleEl.classList.remove('active');
});

// Toggle stats box
statsToggleEl.addEventListener('click', () => {
  statsBoxEl.classList.toggle('visible');
  statsToggleEl.classList.toggle('active');
  
  // Apply stats when panel is opened (use last stats from worker)
  if (statsBoxEl.classList.contains('visible') && lastWorkerStats) {
    applyStats(lastWorkerStats);
  }
});

// Capture console.error
const originalConsoleError = console.error;
console.error = function(...args) {
  logDebug('Error: ' + args.join(' '), 'error');
  originalConsoleError.apply(console, args);
};

// Global error handlers
window.addEventListener('error', (event) => {
  logDebug(`Uncaught error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  logDebug(`Unhandled promise rejection: ${event.reason}`, 'error');
});

window.addEventListener('beforeunload', () => {
  if (dataWorker) {
    dataWorker.terminate();
  }
});

// INITIALIZATION

// Initialize
logDebug('Application starting...', 'info');
updateStatus('Initializing application...');

// Data worker: offload feed fetching/decoding and stats to external worker file
let dataWorker = null;
let workerReady = false;

function startDataWorker() {
  dataWorker = new Worker('js/data-worker.js');
  dataWorker.onmessage = (ev) => {
    const m = ev.data || {};
    if (m.type === 'ready') {
      workerReady = true;
      logDebug('Worker ready, setting options and loading GTFS', 'info');
      dataWorker.postMessage({ type: 'setOptions', options: { snapToRoute } });
      dataWorker.postMessage({ type: 'loadGTFS' });
    } else if (m.type === 'gtfsLoaded') {
      // Receive summary stats from worker
      const data = m.data;
      gtfsStats = data;
      
      logDebug(`GTFS loaded in worker: ${data.shapeCount} shapes, ${data.stopCount} stops, ${data.routeCount} routes`, 'info');
      
      // Initialize map layers now that we have data
      initializeMapLayers();
      
      // Start fetching vehicle data
      updateStatus('Fetching initial vehicle data...');
      if (dataWorker && workerReady) {
        dataWorker.postMessage({ type: 'refresh' });
      }
      
      // Start auto-refresh
      updateStatus('Starting auto-refresh...');
      startAutoRefresh();
      
      logDebug('Application initialized successfully', 'info');
      updateStatus('Ready! All systems operational.');
      
      // Unlock UI after successful initialization
      unlockUI();
      
      // Hide status bar after 2 seconds
      setTimeout(() => {
        hideStatusBar();
      }, 2000);
    } else if (m.type === 'update') {
      const geojson = m.geojson;
      vehiclesGeoJSON = geojson;
      workerTrailsGeoJSON = m.trails || workerTrailsGeoJSON;
      animationPaths = m.paths || {};
      // Update UI history (for distance display, etc.)
      updateVehicleHistoryForUI(geojson);
      if (!map.getSource('vehicles')) {
        updateMapSource();
      } else {
        startPositionAnimation(geojson);
        updateMapSourceNonAnimated();
      }
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      lastUpdateEl.textContent = timeString;
      mobileLastUpdate.textContent = timeString;
      // Store and apply stats from worker
      if (m.stats) {
        lastWorkerStats = m.stats;
        if (statsBoxEl.classList.contains('visible')) {
          applyStats(m.stats);
        }
      }
      logDebug(`Worker update: ${geojson.features.length} vehicles`, 'info');
      
      // Reset progress indicator on each update
      if (progressInterval) {
        progressStartTime = Date.now();
        autoRefreshBtn.style.setProperty('--progress-width', '0%');
      }
    } else if (m.type === 'routeShapes') {
      // Handle route shapes response
      if (m.requestId && pendingRequests.has(m.requestId)) {
        pendingRequests.get(m.requestId)(m.geojson);
        pendingRequests.delete(m.requestId);
      }
    } else if (m.type === 'stops') {
      // Handle stops response
      if (m.requestId && pendingRequests.has(m.requestId)) {
        pendingRequests.get(m.requestId)(m.geojson);
        pendingRequests.delete(m.requestId);
      }
    } else if (m.type === 'stopArrivals') {
      // Handle stop arrivals response  
      if (m.requestId && pendingRequests.has(m.requestId)) {
        pendingRequests.get(m.requestId)(m.arrivals);
        pendingRequests.delete(m.requestId);
      }
    } else if (m.type === 'tripStopTimes') {
      // Handle trip stop times response
      if (m.requestId && pendingRequests.has(m.requestId)) {
        pendingRequests.get(m.requestId)(m.stopTimes);
        pendingRequests.delete(m.requestId);
      }
    } else if (m.type === 'upcomingStops') {
      // Handle upcoming stops response
      if (m.requestId && pendingRequests.has(m.requestId)) {
        pendingRequests.get(m.requestId)(m.stops);
        pendingRequests.delete(m.requestId);
      }
    } else if (m.type === 'routeType') {
      // Handle route type response
      if (m.requestId && pendingRequests.has(m.requestId)) {
        pendingRequests.get(m.requestId)(m.routeType);
        pendingRequests.delete(m.requestId);
      }
    } else if (m.type === 'error') {
      logDebug('Worker error: ' + m.error, 'error');
      updateStatus('Error: ' + m.error);
      // Unlock UI even on error so user can try to refresh
      unlockUI();
    }
  };
  // Send configuration - worker will respond with 'ready' message
  const baseUrl = window.location.pathname.includes('/brisbus/') ? '/brisbus/data/' : '/data/';
  updateStatus('Loading GTFS data in worker...');
  dataWorker.postMessage({ 
    type: 'init', 
    config: { 
      PROXY_FEED_URL, 
      PROTO_URL, 
      REFRESH_INTERVAL_MS,
      GTFS_BASE_URL: baseUrl,
      DECIMAL_RADIX: 10
    } 
  });
};


function applyStats(s) {
  try {
    if (!s) return;
    statTotalVehiclesEl.textContent = s.totalVehicles ?? '0';
    statUniqueRoutesEl.textContent = s.uniqueRoutes ?? '0';
    statStationaryVehiclesEl.textContent = s.stationary ?? '0';
    statAvgSpeedEl.textContent = s.avgSpeedKmh ? `${s.avgSpeedKmh} km/h` : '—';
    statFastestVehicleEl.textContent = s.fastest ? `${s.fastest.label} (${s.fastest.kmh} km/h)` : '—';
    statSlowestVehicleEl.textContent = s.slowest ? `${s.slowest.label} (${s.slowest.kmh} km/h)` : '—';
    // Total stops from GTFS stats
    statTotalStopsEl.textContent = gtfsStats.stopCount || 0;
    // Busiest route from worker stats
    statBusiestRouteEl.textContent = s.busiestRoute ? `${s.busiestRoute.label} (${s.busiestRoute.count} vehicles)` : '—';
  } catch {}
}

// Get UI element references first
const lastUpdateEl = document.getElementById('lastUpdate');
const currentTimeEl = document.getElementById('currentTime');
const refreshBtn = document.getElementById('refreshBtn');
const autoRefreshBtn = document.getElementById('autoRefreshBtn');
const routeFilterEl = document.getElementById('routeFilter');
const clearBtn = document.getElementById('clearBtn');
const locateBtn = document.getElementById('locateBtn');
const toggleRoutesBtn = document.getElementById('toggleRoutesBtn');
const snapToRouteBtn = document.getElementById('snapToRouteBtn');
const smoothAnimationBtn = document.getElementById('smoothAnimationBtn');
const slideshowBtn = document.getElementById('slideshowBtn');
const followIndicator = document.getElementById('followIndicator');
const followIndicatorText = document.getElementById('followIndicatorText');
const slideshowControls = document.getElementById('slideshowControls');
const slideshowNextBtn = document.getElementById('slideshowNextBtn');
const slideshowIntervalInput = document.getElementById('slideshowInterval');

// Vehicle display mode buttons (desktop)
const displayModeDotsBtn = document.getElementById('displayModeDotsBtn');
const displayModeEmojiBtn = document.getElementById('displayModeEmojiBtn');
const displayModeCharBtn = document.getElementById('displayModeCharBtn');
const displayModeArrowBtn = document.getElementById('displayModeArrowBtn');

// Desktop settings menu
const settingsBtn = document.getElementById('settingsBtn');
const mainUI = document.getElementById('mainUI');
const desktopSettingsPanel = document.getElementById('desktopSettingsPanel');
const desktopSettingsClose = document.getElementById('desktopSettingsClose');

// Mobile UI elements
const mobileBottomBar = document.getElementById('mobileBottomBar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileFilterBtn = document.getElementById('mobileFilterBtn');
const mobileRefreshBtn = document.getElementById('mobileRefreshBtn');
const mobileLocateBtn = document.getElementById('mobileLocateBtn');
const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');

// Mobile vehicle card
const mobileVehicleCard = document.getElementById('mobileVehicleCard');
const mobileCardTitle = document.getElementById('mobileCardTitle');
const mobileCardContent = document.getElementById('mobileCardContent');
const mobileCardMinimize = document.getElementById('mobileCardMinimize');
const mobileCardClose = document.getElementById('mobileCardClose');
const mobileCardHeader = document.querySelector('.mobile-card-header');

// Mobile panels
const mobileFilterPanel = document.getElementById('mobileFilterPanel');
const mobileFilterClose = document.getElementById('mobileFilterClose');
const mobileRouteFilter = document.getElementById('mobileRouteFilter');
const mobileClearBtn = document.getElementById('mobileClearBtn');

const mobileMenuPanel = document.getElementById('mobileMenuPanel');
const mobileMenuClose = document.getElementById('mobileMenuClose');

const mobileSettingsPanel = document.getElementById('mobileSettingsPanel');
const mobileSettingsClose = document.getElementById('mobileSettingsClose');
const mobileAutoRefreshBtn = document.getElementById('mobileAutoRefreshBtn');
const mobileToggleRoutesBtn = document.getElementById('mobileToggleRoutesBtn');
const mobileSnapToRouteBtn = document.getElementById('mobileSnapToRouteBtn');
const mobileSmoothAnimationBtn = document.getElementById('mobileSmoothAnimationBtn');
const mobileSlideshowBtn = document.getElementById('mobileSlideshowBtn');
const mobileSlideshowControls = document.getElementById('mobileSlideshowControls');
const mobileSlideshowNextBtn = document.getElementById('mobileSlideshowNextBtn');
const mobileSlideshowInterval = document.getElementById('mobileSlideshowInterval');
const mobileCurrentTime = document.getElementById('mobileCurrentTime');
const mobileLastUpdate = document.getElementById('mobileLastUpdate');

// Vehicle display mode buttons (mobile)
const mobileDisplayModeDotsBtn = document.getElementById('mobileDisplayModeDotsBtn');
const mobileDisplayModeEmojiBtn = document.getElementById('mobileDisplayModeEmojiBtn');
const mobileDisplayModeCharBtn = document.getElementById('mobileDisplayModeCharBtn');
const mobileDisplayModeArrowBtn = document.getElementById('mobileDisplayModeArrowBtn');

// Initialize slideshow interval input with constants
slideshowIntervalInput.min = SLIDESHOW_INTERVAL_MIN_SECONDS;
slideshowIntervalInput.max = SLIDESHOW_INTERVAL_MAX_SECONDS;
slideshowIntervalInput.step = SLIDESHOW_INTERVAL_STEP_SECONDS;
mobileSlideshowInterval.min = SLIDESHOW_INTERVAL_MIN_SECONDS;
mobileSlideshowInterval.max = SLIDESHOW_INTERVAL_MAX_SECONDS;
mobileSlideshowInterval.step = SLIDESHOW_INTERVAL_STEP_SECONDS;

// Validate and set initial value
const initialValue = parseInt(slideshowIntervalInput.value, DECIMAL_RADIX);
if (isNaN(initialValue) || initialValue < SLIDESHOW_INTERVAL_MIN_SECONDS || initialValue > SLIDESHOW_INTERVAL_MAX_SECONDS) {
  slideshowIntervalInput.value = SLIDESHOW_INTERVAL_DEFAULT_SECONDS;
  mobileSlideshowInterval.value = SLIDESHOW_INTERVAL_DEFAULT_SECONDS;
} else {
  slideshowIntervalInput.value = initialValue;
  mobileSlideshowInterval.value = initialValue;
}

// Array of all interactive UI elements to enable/disable
const interactiveElements = [
  routeFilterEl,
  refreshBtn,
  autoRefreshBtn,
  locateBtn,
  toggleRoutesBtn,
  snapToRouteBtn,
  smoothAnimationBtn,
  slideshowBtn,
  clearBtn,
  slideshowNextBtn,
  slideshowIntervalInput,
  // Mobile elements
  mobileRouteFilter,
  mobileRefreshBtn,
  mobileAutoRefreshBtn,
  mobileLocateBtn,
  mobileToggleRoutesBtn,
  mobileSnapToRouteBtn,
  mobileSmoothAnimationBtn,
  mobileSlideshowBtn,
  mobileClearBtn,
  mobileSlideshowNextBtn,
  mobileSlideshowInterval
];

// Lock UI during initialization (before any external library calls)
lockUI();

let map = null;
try {
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [153.0251, -27.4679],
    zoom: DEFAULT_ZOOM
  });
  map.addControl(new maplibregl.NavigationControl({showCompass: false}), 'top-right');
} catch (error) {
  logDebug('MapLibre GL not available: ' + error.message, 'error');
  updateStatus('Map library unavailable');
}

// Helper function to request data from worker with promise
function requestFromWorker(type, params = {}) {
  return new Promise((resolve) => {
    const requestId = nextRequestId++;
    pendingRequests.set(requestId, resolve);
    dataWorker.postMessage({ type, ...params, requestId });
  });
}

// GTFS data structures - minimal data in main thread
let vehiclesGeoJSON = { type: 'FeatureCollection', features: [] };
let vehicleHistory = {}; // vehicle_id → array of {coords, timestamp, speed} - UI only
let gtfsStats = { shapeCount: 0, stopCount: 0, routeCount: 0, tripCount: 0 }; // Summary stats from worker
let lastWorkerStats = null; // Last vehicle statistics from worker

// Cached GeoJSON responses from worker (small, only what's needed)
let cachedRouteShapes = null;  // Cached route shapes GeoJSON
let cachedStops = null;         // Cached stops GeoJSON
let cachedRouteIds = [];        // Which routes are in cache

// Request tracking for worker responses
let nextRequestId = 1;
const pendingRequests = new Map(); // requestId → resolve function

let autoTimer = null;
let locationTrackingTimer = null;
let locationTrackingEnabled = false;
let shouldFlyToLocation = false; // Flag to fly to location on first update
let userLocation = { type: 'FeatureCollection', features: [] };
let showRoutes = true;  // Track whether to show route lines
let snapToRoute = true;  // Track whether to snap trails to routes
let smoothAnimationMode = false;  // Track whether to use smooth continuous animation
let cachedFilterText = ''; // Cache the current filter text
let vehicleDisplayMode = VEHICLE_DISPLAY_MODES.EMOJI; // Current vehicle display mode

// Progress bar state
let progressInterval = null;
let progressStartTime = null;

// Dirty flags for performance optimization
let routesDirty = true;
let stopsDirty = true;
let trailsDirty = true;

// Cache for expensive calculations
let stopsGeoJSON = null; // Cached stops GeoJSON
let interpolatedGeoJSON = { type: 'FeatureCollection', features: [] }; // Reused interpolated positions
let trailsGeoJSON = { type: 'FeatureCollection', features: [] }; // Cached trails

// Animation state
let animationStartTime = null;
let animationInProgress = false;
let previousPositions = {};  // vehicle_id → coordinates
let targetPositions = {};    // vehicle_id → coordinates
let animationPaths = {};     // vehicle_id → array of coordinates (path to follow)
let animationDataReady = false; // Flag to track if new data is ready for animation

// Slideshow/follow mode state
let slideshowActive = false;
let followModeActive = false;
let slideshowTimer = null;
let followTimeout = null; // Timeout for follow mode initialization
let rotationAnimationId = null; // Changed from rotationTimer to animationId
let currentFollowedVehicle = null;
let currentRotationAngle = 0;
let currentFollowPopup = null; // Track current popup for updates
let rotationStartTime = null; // Track when rotation started
let slideshowDurationMs = SLIDESHOW_INTERVAL_DEFAULT_SECONDS * MILLISECONDS_PER_SECOND;
let rotationDirection = 1; // 1 for clockwise, -1 for counterclockwise
// State received from worker
let workerTrailsGeoJSON = { type: 'FeatureCollection', features: [] };
// animationPaths already declared above; worker can override


// Update current time every second
function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  currentTimeEl.textContent = timeString;
  mobileCurrentTime.textContent = timeString;
}
updateCurrentTime();
setInterval(updateCurrentTime, UI_UPDATE_INTERVAL_MS);

// All GTFS loading functions moved to data-worker.js
// Data is loaded in worker and sent back via 'gtfsLoaded' message

/**
 * Load emoji images into the map
 * Creates canvas-based images for each emoji icon
 */
function loadEmojiImages() {
  updateStatus('Loading vehicle emoji icons...');
  
  // Map of emoji names to emoji characters
  const emojiMap = {
    'tram-emoji': '🚊',
    'subway-emoji': '🚇',
    'rail-emoji': '🚆',
    'bus-emoji': '🚌',
    'ferry-emoji': '⛴️',
    'cable-tram-emoji': '🚋',
    'aerial-lift-emoji': '🚡',
    'funicular-emoji': '🚞',
    'trolleybus-emoji': '🚎',
    'monorail-emoji': '🚝'
  };
  
  // Load each emoji as an image
  for (const [name, emoji] of Object.entries(emojiMap)) {
    // Create a canvas to render the emoji
    const canvas = document.createElement('canvas');
    canvas.width = EMOJI_CANVAS_SIZE;
    canvas.height = EMOJI_CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    
    // Draw emoji on canvas
    ctx.font = `${EMOJI_CANVAS_SIZE}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "EmojiOne Color", "Twemoji Mozilla", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, EMOJI_CANVAS_SIZE / 2, EMOJI_CANVAS_SIZE / 2);
    
    // Add the canvas as an image to the map
    if (!map.hasImage(name)) {
      map.addImage(name, ctx.getImageData(0, 0, EMOJI_CANVAS_SIZE, EMOJI_CANVAS_SIZE));
    }
  }
  
  logDebug('Loaded emoji images for vehicle types', 'info');
}

/**
 * Load single character images into the map
 * Creates canvas-based images for each vehicle type character
 */
function loadCharacterImages() {
  updateStatus('Loading vehicle character icons...');
  
  // Map of character names to characters
  const charMap = {
    'tram-char': 'T',
    'subway-char': 'S',
    'rail-char': 'R',
    'bus-char': 'B',
    'ferry-char': 'F',
    'cable-tram-char': 'C',
    'aerial-lift-char': 'A',
    'funicular-char': 'N',
    'trolleybus-char': 'L',
    'monorail-char': 'M'
  };
  
  // Load each character as an image
  for (const [name, char] of Object.entries(charMap)) {
    // Create a canvas to render the character
    const canvas = document.createElement('canvas');
    canvas.width = CHAR_CANVAS_SIZE;
    canvas.height = CHAR_CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    
    // Draw character on canvas with background circle
    ctx.fillStyle = '#0077cc';
    ctx.beginPath();
    ctx.arc(CHAR_CANVAS_SIZE / 2, CHAR_CANVAS_SIZE / 2, CHAR_CANVAS_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw character
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${CHAR_CANVAS_SIZE * 0.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, CHAR_CANVAS_SIZE / 2, CHAR_CANVAS_SIZE / 2);
    
    // Add the canvas as an image to the map
    if (!map.hasImage(name)) {
      map.addImage(name, ctx.getImageData(0, 0, CHAR_CANVAS_SIZE, CHAR_CANVAS_SIZE));
    }
  }
  
  logDebug('Loaded character images for vehicle types', 'info');
}

/**
 * Load arrow images into the map
 * Creates canvas-based arrow images for different speeds
 */
function loadArrowImages() {
  updateStatus('Loading vehicle arrow icons...');
  
  // Create arrows for different speed categories
  const speedColors = [
    { name: 'arrow-stationary', color: COLOR_STATIONARY },
    { name: 'arrow-slow', color: COLOR_SLOW },
    { name: 'arrow-medium', color: COLOR_MEDIUM },
    { name: 'arrow-fast', color: COLOR_FAST },
    { name: 'arrow-very-fast', color: COLOR_VERY_FAST }
  ];
  
  for (const { name, color } of speedColors) {
    // Create a canvas to render the arrow
    const canvas = document.createElement('canvas');
    const size = 48;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw arrow pointing up (will be rotated by bearing)
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    // Arrow head (triangle)
    ctx.moveTo(size / 2, size * 0.15);           // Top point
    ctx.lineTo(size * 0.3, size * 0.45);         // Left point
    ctx.lineTo(size * 0.4, size * 0.45);         // Left inner
    ctx.lineTo(size * 0.4, size * 0.85);         // Left tail
    ctx.lineTo(size * 0.6, size * 0.85);         // Right tail
    ctx.lineTo(size * 0.6, size * 0.45);         // Right inner
    ctx.lineTo(size * 0.7, size * 0.45);         // Right point
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    // Add the canvas as an image to the map
    if (!map.hasImage(name)) {
      map.addImage(name, ctx.getImageData(0, 0, size, size));
    }
  }
  
  logDebug('Loaded arrow images for vehicle types', 'info');
}

/**
 * Initialize map layers after GTFS data is loaded
 * Called when worker sends gtfsLoaded message
 */
function initializeMapLayers() {
  updateStatus('Initializing map layers...');
  const emptyCollection = createFeatureCollection();
  
  map.addSource("routes", { type: "geojson", data: emptyCollection });
  map.addLayer({
    id: "route-lines",
    type: "line",
    source: "routes",
    paint: {
      "line-color": ROUTE_LINE_COLOR,
      "line-width": ROUTE_LINE_WIDTH,
      "line-opacity": ROUTE_LINE_OPACITY
    }
  });

  // Initialize stops layer with clustering and zoom-based visibility
  map.addSource("stops", { 
    type: "geojson", 
    data: emptyCollection,
    cluster: true,
    clusterRadius: STOP_CLUSTER_RADIUS,
    clusterMaxZoom: STOP_CLUSTER_MAX_ZOOM
  });
  
  // Clustered stops
  map.addLayer({
    id: "stop-clusters",
    type: "circle",
    source: "stops",
    filter: ['has', 'point_count'],
    minzoom: STOPS_MIN_ZOOM,
    paint: {
      "circle-radius": [
        'step',
        ['get', 'point_count'],
        10,  // radius for < 10 stops
        10, 15,  // radius for 10-99 stops
        100, 20  // radius for 100+ stops
      ],
      "circle-color": [
        'step',
        ['get', 'point_count'],
        '#B0BEC5',  // color for < 10 stops
        10, '#90A4AE',  // color for 10-99 stops
        100, '#78909C'  // color for 100+ stops
      ],
      "circle-opacity": 0.6,
      "circle-stroke-width": 1,
      "circle-stroke-color": '#fff'
    }
  });
  
  // Cluster count labels
  map.addLayer({
    id: 'stop-cluster-count',
    type: 'symbol',
    source: 'stops',
    filter: ['has', 'point_count'],
    minzoom: STOPS_MIN_ZOOM,
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 11
    },
    paint: {
      'text-color': '#ffffff'
    }
  });
  
  // Individual stops (unclustered)
  map.addLayer({
    id: "stop-circles",
    type: "circle",
    source: "stops",
    filter: ['!', ['has', 'point_count']],
    minzoom: STOPS_MIN_ZOOM,
    paint: {
      "circle-radius": STOP_CIRCLE_RADIUS,
      "circle-color": STOP_CIRCLE_COLOR,
      "circle-stroke-width": STOP_CIRCLE_STROKE_WIDTH,
      "circle-stroke-color": STOP_CIRCLE_STROKE_COLOR,
      "circle-opacity": STOP_CIRCLE_OPACITY
    }
  });

  // Initialize user location layer
  map.addSource("user-location", { type: "geojson", data: userLocation });
  map.addLayer({
    id: "user-location-circle",
    type: "circle",
    source: "user-location",
    paint: {
      "circle-radius": USER_LOCATION_RADIUS,
      "circle-color": USER_LOCATION_COLOR,
      "circle-opacity": USER_LOCATION_OPACITY,
      "circle-stroke-width": USER_LOCATION_STROKE_WIDTH,
      "circle-stroke-color": USER_LOCATION_STROKE_COLOR
    }
  });
  logDebug('Map layers initialized', 'info');
}

/**
 * Get emoji icon configuration
 */
function getEmojiIconConfig() {
  return {
    type: 'symbol',
    layout: {
      'icon-image': [
        'case',
        ['==', ['get', 'route_type'], 0], 'tram-emoji',
        ['==', ['get', 'route_type'], 1], 'subway-emoji',
        ['==', ['get', 'route_type'], 2], 'rail-emoji',
        ['==', ['get', 'route_type'], 3], 'bus-emoji',
        ['==', ['get', 'route_type'], 4], 'ferry-emoji',
        ['==', ['get', 'route_type'], 5], 'cable-tram-emoji',
        ['==', ['get', 'route_type'], 6], 'aerial-lift-emoji',
        ['==', ['get', 'route_type'], 7], 'funicular-emoji',
        ['==', ['get', 'route_type'], 11], 'trolleybus-emoji',
        ['==', ['get', 'route_type'], 12], 'monorail-emoji',
        'bus-emoji'
      ],
      'icon-size': 0.3,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'viewport',
      'icon-pitch-alignment': 'viewport',
      'icon-rotate': ['coalesce', ['get', 'bearing'], 0]
    },
    paint: {}
  };
}

/**
 * Get vehicle layer configuration based on display mode
 */
function getVehicleLayerConfig() {
  switch (vehicleDisplayMode) {
    case VEHICLE_DISPLAY_MODES.DOTS:
      return {
        type: 'circle',
        layout: {},
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'speed'], 0],
            SPEED_STATIONARY, COLOR_STATIONARY,
            SPEED_SLOW, COLOR_SLOW,
            SPEED_MEDIUM, COLOR_MEDIUM,
            SPEED_FAST, COLOR_FAST,
            SPEED_VERY_FAST, COLOR_VERY_FAST
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      };
    
    case VEHICLE_DISPLAY_MODES.EMOJI:
      return getEmojiIconConfig();
    
    case VEHICLE_DISPLAY_MODES.SINGLE_CHAR:
      return {
        type: 'symbol',
        layout: {
          'icon-image': [
            'case',
            ['==', ['get', 'route_type'], 0], 'tram-char',
            ['==', ['get', 'route_type'], 1], 'subway-char',
            ['==', ['get', 'route_type'], 2], 'rail-char',
            ['==', ['get', 'route_type'], 3], 'bus-char',
            ['==', ['get', 'route_type'], 4], 'ferry-char',
            ['==', ['get', 'route_type'], 5], 'cable-tram-char',
            ['==', ['get', 'route_type'], 6], 'aerial-lift-char',
            ['==', ['get', 'route_type'], 7], 'funicular-char',
            ['==', ['get', 'route_type'], 11], 'trolleybus-char',
            ['==', ['get', 'route_type'], 12], 'monorail-char',
            'bus-char'
          ],
          'icon-size': 0.5,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-rotation-alignment': 'viewport',
          'icon-pitch-alignment': 'viewport'
        },
        paint: {}
      };
    
    case VEHICLE_DISPLAY_MODES.ARROW:
      return {
        type: 'symbol',
        layout: {
          'icon-image': [
            'step',
            ['coalesce', ['get', 'speed'], 0],
            'arrow-stationary',
            SPEED_SLOW, 'arrow-slow',
            SPEED_MEDIUM, 'arrow-medium',
            SPEED_FAST, 'arrow-fast',
            SPEED_VERY_FAST, 'arrow-very-fast'
          ],
          'icon-size': 0.7,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-rotation-alignment': 'map',
          'icon-pitch-alignment': 'map',
          'icon-rotate': ['coalesce', ['get', 'bearing'], 0]
        },
        paint: {}
      };
    
    default:
      // Default to emoji
      return getEmojiIconConfig();
  }
}

/**
 * Update vehicle layer display mode
 */
function updateVehicleDisplayMode(newMode) {
  if (!map || !map.getSource('vehicles')) {
    // Store the mode for when the map is initialized
    vehicleDisplayMode = newMode;
    return; // Layer not yet initialized
  }
  
  vehicleDisplayMode = newMode;
  
  // Remove existing vehicle layers
  if (map.getLayer('vehicle-icons')) {
    map.removeLayer('vehicle-icons');
  }
  
  // Get configuration for new mode
  const config = getVehicleLayerConfig();
  
  // Add new vehicle layer
  map.addLayer({
    id: 'vehicle-icons',
    type: config.type,
    source: 'vehicles',
    layout: config.layout,
    paint: config.paint
  }, 'vehicle-labels'); // Add below labels
  
  // Re-attach click handlers
  map.on('click', 'vehicle-icons', async (e) => {
    const vehicle = e.features[0];
    const props = vehicle.properties;
    
    // Set the route filter to the clicked vehicle's route
    if (props.route_id) {
      const routeNumber = props.route_id.split('-')[0];
      routeFilterEl.value = routeNumber;
      cachedFilterText = routeNumber.toLowerCase();
      updateClearButton();
      updateMapSource();
    }
    
    // Show popup with follow button
    await showVehiclePopup(vehicle, e.lngLat);
  });
  map.on('mouseenter', 'vehicle-icons', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'vehicle-icons', () => map.getCanvas().style.cursor = '');
  
  logDebug(`Vehicle display mode changed to: ${newMode}`, 'info');
}

// Fallback feed fetch removed - now handled entirely by data-worker.js

// Simplified history tracking for UI features (distance display, etc.)
// The worker maintains its own separate history for trail building
function updateVehicleHistoryForUI(currentGeoJSON) {
  const now = Date.now();
  const activeVehicleIds = new Set();
  
  for (const { properties, geometry } of currentGeoJSON.features) {
    const { timestamp, id: vehicleId, speed, route_id, trip_id, label } = properties;
    
    if (timestamp && vehicleId) {
      activeVehicleIds.add(vehicleId);
      const tsMs = Number(timestamp) * MILLISECONDS_PER_SECOND;
      
      vehicleHistory[vehicleId] ??= [];
      
      const history = vehicleHistory[vehicleId];
      const isDuplicate = history.length > 0 && history[history.length - 1].timestamp === tsMs;
      
      if (!isDuplicate) {
        history.push({
          coords: geometry.coordinates,
          timestamp: tsMs,
          speed: speed || 0,
          route_id,
          trip_id,
          label
        });
      }
      
      // Trim history
      if (history.length > 1) {
        const cutoffTime = now - HISTORY_WINDOW_MS;
        let firstValidIndex = 0;
        while (firstValidIndex < history.length && history[firstValidIndex].timestamp < cutoffTime) {
          firstValidIndex++;
        }
        if (firstValidIndex > 0) {
          vehicleHistory[vehicleId] = history.slice(firstValidIndex);
        }
      }
    }
  }
  
  // Remove inactive vehicles
  const cutoffTime = now - INACTIVE_VEHICLE_THRESHOLD_MS;
  for (const vehicleId in vehicleHistory) {
    const history = vehicleHistory[vehicleId];
    const isInactive = !activeVehicleIds.has(vehicleId) && 
                      history.length > 0 && 
                      history[history.length - 1].timestamp < cutoffTime;
    
    if (isInactive || history.length === 0) {
      delete vehicleHistory[vehicleId];
      delete previousPositions[vehicleId];
      delete targetPositions[vehicleId];
    }
  }
}

function applyFilter(geojson) {
  if (!cachedFilterText) return geojson;
  return {
    type: 'FeatureCollection',
    features: geojson.features.filter(f => {
      return (f.properties.route_id && f.properties.route_id.toLowerCase().includes(cachedFilterText)) ||
             (f.properties.label && f.properties.label.toLowerCase().includes(cachedFilterText));
    })
  };
}

// Filter trails to match currently visible vehicles
function filterTrails(trailsGeoJSON, filteredVehicles) {
  if (!cachedFilterText) return trailsGeoJSON;
  
  // Get set of visible vehicle IDs
  const visibleVehicleIds = new Set(
    filteredVehicles.features.map(f => f.properties.id)
  );
  
  // Filter trails to only those for visible vehicles
  return {
    type: 'FeatureCollection',
    features: trailsGeoJSON.features.filter(f => 
      visibleVehicleIds.has(f.properties.vehicle_id)
    )
  };
}

// Route snapping and trail building now handled by data-worker.js
// Kept here only for UI calculations (distance display, etc.)


/**
 * Calculate average speed from vehicle history
 * Uses reported speeds if available, otherwise calculates from position changes
 */
function calculateAverageSpeed(history) {
  if (history.length < 2) return 0;
  
  // First try to use reported speeds if available
  const reportedSpeeds = history.map(h => h.speed).filter(s => s > 0);
  if (reportedSpeeds.length > 0) {
    return reportedSpeeds.reduce((sum, s) => sum + s, 0) / reportedSpeeds.length;
  }
  
  // If no reported speeds, calculate from position changes
  let totalDistance = 0;
  let totalTime = 0;
  
  for (let i = 1; i < history.length; i++) {
    const { coords: prevCoords, timestamp: prevTime } = history[i - 1];
    const { coords: currCoords, timestamp: currTime } = history[i];
    const timeDiff = (currTime - prevTime) / MILLISECONDS_PER_SECOND;
    
    if (timeDiff > 0) {
      const dist = haversineDistance(
        prevCoords[1], prevCoords[0],
        currCoords[1], currCoords[0]
      );
      totalDistance += dist;
      totalTime += timeDiff;
    }
  }
  
  return totalTime > 0 ? totalDistance / totalTime : 0; // meters per second
}

// buildTrailsGeoJSON now handled by data-worker.js

function calculateDistances(vehicleId) {
  const history = vehicleHistory[vehicleId];
  if (!history || history.length < 2) return [];
  
  const now = Date.now();
  const distances = [];
  
  for (const interval of DISTANCE_INTERVALS_SECONDS) {
    const targetTime = now - (interval * MILLISECONDS_PER_SECOND);
    
    // Find the closest position in history to this time
    let closestPos = null;
    let minDiff = Infinity;
    
    for (const pos of history) {
      const diff = Math.abs(pos.timestamp - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestPos = pos;
      }
    }
    
    // Calculate distance if we found a position (within half the interval tolerance)
    if (closestPos && minDiff < interval * HALF_INTERVAL_MS) {
      const currentPos = history[history.length - 1];
      const distance = haversineDistance(
        closestPos.coords[1], closestPos.coords[0],
        currentPos.coords[1], currentPos.coords[0]
      );
      
      if (distance > 0) {
        const actualTimeDiff = (currentPos.timestamp - closestPos.timestamp) / MILLISECONDS_PER_SECOND;
        const speedMps = actualTimeDiff > 0 ? distance / actualTimeDiff : 0; // m/s
        const speedKmh = Math.round(speedMps * 3.6); // convert to km/h
        distances.push({ 
          interval, 
          distance: Math.round(distance),
          speedKmh 
        });
      }
    }
  }
  
  return distances;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * RADIANS_PER_DEGREE;
  const dLon = (lon2 - lon1) * RADIANS_PER_DEGREE;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * RADIANS_PER_DEGREE) * Math.cos(lat2 * RADIANS_PER_DEGREE) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get current time in seconds since midnight (handles day wraparound)
 */
function getCurrentTimeSeconds() {
  const now = new Date();
  return now.getHours() * SECONDS_PER_HOUR + now.getMinutes() * SECONDS_PER_MINUTE + now.getSeconds();
}

/**
 * Calculate the delay in seconds for a vehicle based on scheduled vs actual position
 */
function calculateVehicleDelay(stopTimes, currentStopSeq, vehicleTimestamp) {
  if (!stopTimes || !currentStopSeq || !vehicleTimestamp) return null;
  
  // Find the scheduled time for the current stop
  const currentStopTime = stopTimes.find(st => st.stop_sequence === currentStopSeq);
  if (!currentStopTime || !currentStopTime.arrival_time) return null;
  
  // arrival_time is now already in seconds (integer)
  const scheduledSeconds = currentStopTime.arrival_time;
  
  // Get actual time from vehicle timestamp
  const actualDate = new Date(Number(vehicleTimestamp) * MILLISECONDS_PER_SECOND);
  const actualSeconds = actualDate.getHours() * SECONDS_PER_HOUR + actualDate.getMinutes() * SECONDS_PER_MINUTE + actualDate.getSeconds();
  
  // Calculate delay (positive = late, negative = early)
  // Handle day wraparound for late-night services
  let delay = actualSeconds - scheduledSeconds;
  if (delay > SECONDS_PER_HALF_DAY) delay -= SECONDS_PER_DAY; // Crossed midnight forward
  if (delay < -SECONDS_PER_HALF_DAY) delay += SECONDS_PER_DAY; // Crossed midnight backward
  
  return delay;
}

// Calculate upcoming arrivals at a stop (simplified version - requests from worker)
async function getUpcomingArrivals(stopId) {
  // Simple version: show vehicles that might be heading here
  // Full ETA calculation would require trip stop times from worker
  const arrivals = [];
  
  // Show currently operating vehicles near this stop
  for (const { properties } of vehiclesGeoJSON.features) {
    const { route_id: routeId, label: vehicleLabel, id: vehicleId } = properties;
    
    if (!vehicleLabel) continue;
    
    // Basic arrival info without precise ETA
    arrivals.push({
      route_id: routeId,
      vehicle_label: vehicleLabel,
      vehicle_id: vehicleId,
      eta_minutes: null, // Would need trip stop times for precise ETA
      stops_away: null
    });
  }
  
  // Limit to first 10 to avoid cluttering popup
  return arrivals.slice(0, 10);
}

/**
 * Create a GeoJSON point feature
 */
function createPointFeature(coordinates, properties) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates
    },
    properties
  };
}

/**
 * Create a GeoJSON line feature
 */
function createLineFeature(coordinates, properties) {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates
    },
    properties
  };
}

/**
 * Create an empty GeoJSON FeatureCollection
 */
function createFeatureCollection(features = []) {
  return { type: 'FeatureCollection', features };
}

// Build stops GeoJSON based on current filters - requests from worker
async function buildStopsGeoJSON() {
  // Return cached version if stops haven't changed
  if (!stopsDirty && stopsGeoJSON) {
    return stopsGeoJSON;
  }
  
  // Determine which route IDs to request stops for
  let routeIds = [];
  
  if (cachedFilterText) {
    // For filtered routes, get all active vehicle route IDs that match filter
    const filtered = applyFilter(vehiclesGeoJSON);
    const routeIdSet = new Set();
    filtered.features.forEach(f => {
      if (f.properties.route_id) routeIdSet.add(f.properties.route_id);
    });
    routeIds = Array.from(routeIdSet).filter(rid => {
      const label = rid.split('-')[0] || '';
      return label.toLowerCase().includes(cachedFilterText);
    });
  } else {
    // Show stops for routes that have active vehicles
    const filtered = applyFilter(vehiclesGeoJSON);
    const routeIdSet = new Set();
    filtered.features.forEach(f => {
      if (f.properties.route_id) routeIdSet.add(f.properties.route_id);
    });
    routeIds = Array.from(routeIdSet);
  }
  
  // Request from worker
  stopsGeoJSON = await requestFromWorker('getStops', { routeIds });
  stopsDirty = false;
  return stopsGeoJSON;
}

// Linear interpolation between two coordinates
function lerpCoordinates(from, to, t) {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t
  ];
}

// Interpolate along a path (array of coordinates) based on progress t (0 to 1)
function lerpAlongPath(path, t) {
  if (!path || path.length === 0) return null;
  if (path.length === 1) return path[0];
  
  // Calculate total path length
  let totalLength = 0;
  const segmentLengths = [];
  for (let i = 0; i < path.length - 1; i++) {
    const dist = haversineDistance(
      path[i][1], path[i][0],
      path[i + 1][1], path[i + 1][0]
    );
    segmentLengths.push(dist);
    totalLength += dist;
  }
  
  // Handle zero-length path
  if (totalLength === 0) return path[0];
  
  // Find which segment we should be on based on progress
  const targetDistance = t * totalLength;
  let accumulatedDistance = 0;
  
  for (let i = 0; i < segmentLengths.length; i++) {
    const segmentLength = segmentLengths[i];
    if (accumulatedDistance + segmentLength >= targetDistance) {
      // We're on this segment
      const segmentProgress = (targetDistance - accumulatedDistance) / segmentLength;
      return lerpCoordinates(path[i], path[i + 1], segmentProgress);
    }
    accumulatedDistance += segmentLength;
  }
  
  // If we somehow get here, return the last point
  return path[path.length - 1];
}

/**
 * Ease-in-out function for smooth animation
 */
function easeInOut(t) {
  return t < 0.5 
    ? 2 * t * t 
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Animation frame function - optimized to reuse objects and only animate visible vehicles
function animatePositions(timestamp) {
  animationStartTime ??= timestamp;

  const elapsed = timestamp - animationStartTime;
  const duration = smoothAnimationMode ? SMOOTH_ANIMATION_DURATION_MS : ANIMATION_DURATION_MS;
  const progress = Math.min(elapsed / duration, 1);
  
  // Use linear interpolation in smooth mode for constant speed, easing in normal mode
  const eased = smoothAnimationMode ? progress : easeInOut(progress);

  // Get map bounds with padding for offscreen animation
  const bounds = map.getBounds();
  const padding = 0.1; // 10% padding
  const latRange = bounds.getNorth() - bounds.getSouth();
  const lngRange = bounds.getEast() - bounds.getWest();
  const viewBounds = {
    north: bounds.getNorth() + latRange * padding,
    south: bounds.getSouth() - latRange * padding,
    east: bounds.getEast() + lngRange * padding,
    west: bounds.getWest() - lngRange * padding
  };

  // Reuse interpolatedGeoJSON.features array - only update coordinates
  if (interpolatedGeoJSON.features.length !== vehiclesGeoJSON.features.length) {
    // Array size changed, need to rebuild
    interpolatedGeoJSON.features = new Array(vehiclesGeoJSON.features.length);
  }

  for (let i = 0; i < vehiclesGeoJSON.features.length; i++) {
    const feature = vehiclesGeoJSON.features[i];
    const vehicleId = feature.properties.id;
    
    if (vehicleId && previousPositions[vehicleId] && targetPositions[vehicleId]) {
      // Check if vehicle is in viewport
      const targetCoord = targetPositions[vehicleId];
      const inViewport = targetCoord[1] >= viewBounds.south && 
                        targetCoord[1] <= viewBounds.north &&
                        targetCoord[0] >= viewBounds.west && 
                        targetCoord[0] <= viewBounds.east;
      
      let interpolatedCoords;
      if (inViewport) {
        // Animate vehicles in viewport
        interpolatedCoords = animationPaths[vehicleId]?.length > 0
          ? lerpAlongPath(animationPaths[vehicleId], eased)
          : lerpCoordinates(previousPositions[vehicleId], targetPositions[vehicleId], eased);
      } else {
        // Jump offscreen vehicles to target immediately
        interpolatedCoords = targetPositions[vehicleId];
      }
      
      // Reuse feature object if possible
      if (!interpolatedGeoJSON.features[i] || interpolatedGeoJSON.features[i].id !== feature.id) {
        // Only create new object if needed
        interpolatedGeoJSON.features[i] = {
          type: 'Feature',
          id: feature.id,
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: feature.properties
        };
      }
      interpolatedGeoJSON.features[i].geometry.coordinates = interpolatedCoords;
    } else {
      // Reuse feature object
      if (interpolatedGeoJSON.features[i] !== feature) {
        interpolatedGeoJSON.features[i] = feature;
      }
    }
  }

  // Update map with interpolated positions
  const filteredVehicles = applyFilter(interpolatedGeoJSON);
  if (map.getSource('vehicles')) {
    map.getSource('vehicles').setData(filteredVehicles);
  }

  // Continue animation or finish
  if (progress < 1) {
    requestAnimationFrame(animatePositions);
  } else {
    animationInProgress = false;
    animationStartTime = null;
  }
}

/**
 * Calculate interpolated position for a vehicle
 */
function getInterpolatedPosition(vehicleId, eased) {
  if (!previousPositions[vehicleId] || !targetPositions[vehicleId]) return null;
  
  return animationPaths[vehicleId]?.length > 0
    ? lerpAlongPath(animationPaths[vehicleId], eased)
    : lerpCoordinates(previousPositions[vehicleId], targetPositions[vehicleId], eased);
}

// Start position animation
function startPositionAnimation(newGeoJSON) {
  // In smooth animation mode, if animation is in progress, use current interpolated positions as the "previous" positions
  // This ensures seamless transition without restarting the animation
  if (smoothAnimationMode && animationInProgress && animationStartTime) {
    const now = performance.now();
    const elapsed = now - animationStartTime;
    const duration = smoothAnimationMode ? SMOOTH_ANIMATION_DURATION_MS : ANIMATION_DURATION_MS;
    const progress = Math.min(elapsed / duration, 1);
    
    // Calculate current interpolated positions for all vehicles
    vehiclesGeoJSON.features.forEach(({ properties }) => {
      const vehicleId = properties.id;
      const interpolatedCoords = getInterpolatedPosition(vehicleId, progress);
      if (interpolatedCoords) {
        previousPositions[vehicleId] = interpolatedCoords;
      }
    });
    
    // Reset animation timing to start from the beginning with new targets
    animationStartTime = null;
  } else if (vehiclesGeoJSON.features.length > 0) {
    // Normal mode: Store previous positions from current vehiclesGeoJSON
    vehiclesGeoJSON.features.forEach(({ properties, geometry }) => {
      if (properties.id) {
        previousPositions[properties.id] = geometry.coordinates;
      }
    });
  }

  // Store target positions from new data and calculate animation paths
  newGeoJSON.features.forEach(feature => {
    const vehicleId = feature.properties.id;
    if (vehicleId) {
      targetPositions[vehicleId] = feature.geometry.coordinates;
      
      // If this is a new vehicle, set previous position to current to avoid animation from 0,0
      if (!previousPositions[vehicleId]) {
        previousPositions[vehicleId] = feature.geometry.coordinates;
      }
      
      // Animation paths are provided by worker if available
      if (!(feature.properties.id in animationPaths)) {
        delete animationPaths[vehicleId];
      }
    }
  });

  // Update vehiclesGeoJSON reference
  vehiclesGeoJSON = newGeoJSON;

  // Start animation if not already running
  if (!animationInProgress) {
    animationInProgress = true;
    animationStartTime = null;
    requestAnimationFrame(animatePositions);
  }
}

function formatInterval(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${minutes}m`;
  return `${minutes}m ${secs}s`;
}

/**
 * Get route IDs based on current filter
 * Returns a Set of route IDs to display
 */
function getFilteredRouteIds(filteredVehicles) {
  const routeIds = new Set();
  
  // Get route IDs from currently visible vehicles only
  filteredVehicles.features.forEach(({ properties }) => {
    const label = properties.label || '';
    if (cachedFilterText) {
      // Filter by label match
      if (label.toLowerCase().includes(cachedFilterText) && properties.route_id) {
        routeIds.add(properties.route_id);
      }
    } else {
      // No filter - show all vehicle routes
      if (properties.route_id) routeIds.add(properties.route_id);
    }
  });
  
  return routeIds;
}

/**
 * Build shape features from route IDs - requests from worker
 */
async function buildShapeFeatures(routeIds) {
  if (!showRoutes) return [];
  
  const routeIdArray = Array.from(routeIds);
  
  // Check if we have these routes cached
  const needsFetch = routeIdArray.length === 0 || 
                    !cachedRouteShapes || 
                    !arraysEqual(routeIdArray.sort(), cachedRouteIds.sort());
  
  if (needsFetch) {
    cachedRouteShapes = await requestFromWorker('getRouteShapes', { routeIds: routeIdArray });
    cachedRouteIds = routeIdArray;
  }
  
  return cachedRouteShapes?.features || [];
}

// Helper to compare arrays
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Update trails and routes only (not vehicle positions - those are animated separately)
async function updateMapSourceNonAnimated() {
  // Trails come from worker, filter to match visible vehicles
  const filteredVehicles = applyFilter(vehiclesGeoJSON);
  const trailsGeoJSON = filterTrails(workerTrailsGeoJSON, filteredVehicles);
  
  // Only rebuild routes when dirty
  let shapeFeatures;
  if (routesDirty) {
    const routeIds = getFilteredRouteIds(filteredVehicles);
    shapeFeatures = await buildShapeFeatures(routeIds);
    routesDirty = false;
  }
  
  // Only rebuild stops when dirty
  const stopsGeoJSON = stopsDirty || !showRoutes ? 
    (showRoutes ? await buildStopsGeoJSON() : createFeatureCollection()) : 
    null;

  if (map.getSource('vehicle-trails')) {
    map.getSource('vehicle-trails').setData(trailsGeoJSON);
  }
  if (shapeFeatures && map.getSource('routes')) {
    map.getSource('routes').setData(createFeatureCollection(shapeFeatures));
  }
  if (stopsGeoJSON && map.getSource('stops')) {
    map.getSource('stops').setData(stopsGeoJSON);
  }
}

async function updateMapSource() {
  const filteredVehicles = applyFilter(vehiclesGeoJSON);
  const trailsGeoJSON = filterTrails(workerTrailsGeoJSON, filteredVehicles);
  const routeIds = getFilteredRouteIds(filteredVehicles);
  const shapeFeatures = await buildShapeFeatures(routeIds);
  const stopsGeoJSON = showRoutes ? await buildStopsGeoJSON() : createFeatureCollection();

  if (map.getSource('vehicles')) {
    map.getSource('vehicles').setData(filteredVehicles);
    map.getSource('vehicle-trails').setData(trailsGeoJSON);
    map.getSource('routes').setData(createFeatureCollection(shapeFeatures));
    map.getSource('stops').setData(stopsGeoJSON);
  } else {
    map.addSource('vehicles', { 
      type: 'geojson', 
      data: filteredVehicles,
      generateId: false  // Use feature IDs from GeoJSON
    });
    
    // Get configuration for current display mode
    const vehicleConfig = getVehicleLayerConfig();
    
    map.addLayer({
      id: 'vehicle-icons',
      type: vehicleConfig.type,
      source: 'vehicles',
      layout: vehicleConfig.layout,
      paint: vehicleConfig.paint
    });
    map.addLayer({
      id: 'vehicle-labels',
      type: 'symbol',
      source: 'vehicles',
      layout: {
        'text-field': ['coalesce', ['get', 'label'], ['get', 'route_id'], ''],
        'text-size': 11,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
      },
      paint: {
        'text-color': '#1a1a1a',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
        'text-halo-blur': 0.5
      }
    });
    map.on('click', 'vehicle-icons', async (e) => {
      const vehicle = e.features[0];
      const props = vehicle.properties;
      
      // Set the route filter to the clicked vehicle's route
      if (props.route_id) {
        const routeNumber = props.route_id.split('-')[0];
        routeFilterEl.value = routeNumber;
        cachedFilterText = routeNumber.toLowerCase();
        updateClearButton();
        updateMapSource();
      }
      
      // Show popup with follow button
      await showVehiclePopup(vehicle, e.lngLat);
    });
    map.on('mouseenter', 'vehicle-icons', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'vehicle-icons', () => map.getCanvas().style.cursor = '');

    map.addSource('vehicle-trails', { type: 'geojson', data: trailsGeoJSON });
    map.addLayer({
      id: 'vehicle-trails-lines',
      type: 'line',
      source: 'vehicle-trails',
      paint: {
        'line-width': TRAIL_LINE_WIDTH,
        'line-color': [
          'interpolate',
          ['linear'],
          ['get', 'speed'],
          SPEED_STATIONARY, COLOR_STATIONARY,
          SPEED_SLOW, COLOR_SLOW,
          SPEED_MEDIUM, COLOR_MEDIUM,
          SPEED_FAST, COLOR_FAST,
          SPEED_VERY_FAST, COLOR_VERY_FAST
        ],
        'line-opacity': TRAIL_LINE_OPACITY
      }
    }, 'vehicle-icons'); // Add trails below vehicle icons
    map.getSource("routes").setData(createFeatureCollection(shapeFeatures));
    map.getSource("stops").setData(stopsGeoJSON);

    // Add click handler for stops
    map.on('click', 'stop-circles', async (e) => {
      const props = e.features[0].properties;
      const stopId = props.stop_id;
      const stopName = props.stop_name;
      
      // Get upcoming arrivals (now async)
      const arrivals = await getUpcomingArrivals(stopId);
      
      // Create popup HTML
      const htmlParts = [
        `<div style="font-family: inherit; min-width: 200px; max-width: 280px; padding: 4px;">`,
        `<div style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #FF5722;">${stopName}</div>`,
        `<div style="font-size: 13px; line-height: 1.6; color: #555;">`,
        `<div style="margin-bottom: 8px;"><span style="color: #888;">Stop ID:</span> <strong>${stopId}</strong></div>`
      ];
      
      // Upcoming arrivals
      if (arrivals.length > 0) {
        htmlParts.push(
          `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e8e8e8;">`,
          `<div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px;">Next arrivals (30min):</div>`,
          '<div style="font-size: 12px; color: #666; line-height: 1.8; max-height: 300px; overflow-y: auto;">'
        );
        
        for (const arrival of arrivals) {
          const etaText = arrival.eta_minutes === null ? 'Operating' : 
                         (arrival.eta_minutes < ETA_IMMEDIATE ? 'Now' : `${arrival.eta_minutes} min`);
          const routeLabel = arrival.vehicle_label || arrival.route_id;
          
          // Color scheme: Red (imminent) -> Orange (soon) -> Amber (medium) -> Green (comfortable)
          const etaColor = arrival.eta_minutes === null ? '#666' :
                           (arrival.eta_minutes < ETA_IMMEDIATE ? COLOR_ETA_IMMEDIATE :
                           arrival.eta_minutes <= ETA_VERY_SOON ? COLOR_ETA_IMMEDIATE :
                           arrival.eta_minutes <= ETA_SOON ? COLOR_ETA_SOON :
                           arrival.eta_minutes <= ETA_MEDIUM ? COLOR_ETA_MEDIUM :
                           COLOR_ETA_COMFORTABLE);
          
          const stopsText = arrival.stops_away !== null ? 
            `<div style="font-size: 11px; color: #888; margin-top: 2px;">${arrival.stops_away} ${arrival.stops_away === 1 ? 'stop' : 'stops'} away</div>` :
            '';
          
          htmlParts.push(
            `<div style="margin-bottom: 4px; padding: 4px; background: #f5f5f5; border-radius: 4px;">`,
            `<div style="display: flex; justify-content: space-between; align-items: center;">`,
            `<span style="font-weight: 600; color: #0077cc;">${routeLabel}</span>`,
            `<span style="color: ${etaColor}; font-weight: 600;">${etaText}</span>`,
            `</div>`,
            stopsText,
            `</div>`
          );
        }
        htmlParts.push('</div></div>');
      } else {
        htmlParts.push(`<div style="margin-top: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px; color: #888; font-size: 12px; text-align: center;">No arrivals in next 30 minutes</div>`);
      }
      
      htmlParts.push(`</div></div>`);
      
      new maplibregl.Popup({
        maxWidth: '300px',
        className: 'custom-popup'
      }).setLngLat(e.lngLat).setHTML(htmlParts.join('')).addTo(map);
    });
    map.on('mouseenter', 'stop-circles', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'stop-circles', () => map.getCanvas().style.cursor = '');
  }
}

// Slideshow and follow mode functions
function getRandomVehicle() {
  const filteredVehicles = applyFilter(vehiclesGeoJSON);
  const vehicles = filteredVehicles.features;
  if (vehicles.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * vehicles.length);
  return vehicles[randomIndex];
}

function stopFollowMode() {
  followModeActive = false;
  currentFollowedVehicle = null;
  
  // Clear follow timeout to prevent race condition
  if (followTimeout) {
    clearTimeout(followTimeout);
    followTimeout = null;
  }
  
  if (rotationAnimationId) {
    cancelAnimationFrame(rotationAnimationId);
    rotationAnimationId = null;
  }
  currentRotationAngle = 0;
  rotationStartTime = null;
  
  // Close popup if it exists
  if (currentFollowPopup) {
    currentFollowPopup.remove();
    currentFollowPopup = null;
  }
  
  // Hide follow indicator
  followIndicator.classList.remove('visible');
  
  // Reset camera to default view when stopping follow mode
  map.easeTo({
    pitch: 0,
    bearing: 0,
    duration: 1000
  });
}

function stopSlideshow() {
  slideshowActive = false;
  slideshowBtn.classList.remove('active');
  slideshowControls.classList.remove('slideshow-controls-visible');
  slideshowControls.classList.add('slideshow-controls-hidden');
  if (slideshowTimer) {
    clearTimeout(slideshowTimer);
    slideshowTimer = null;
  }
  stopFollowMode();
  logDebug('Slideshow stopped', 'info');
}

function followVehicle(vehicleId, coords, showPopup = false, autoAdvance = false) {
  // Clear any existing follow timeout to prevent race condition
  if (followTimeout) {
    clearTimeout(followTimeout);
    followTimeout = null;
  }
  
  stopFollowMode(); // Stop any existing follow mode
  
  currentFollowedVehicle = vehicleId;
  followModeActive = true;
  currentRotationAngle = 0;
  
  // Alternate rotation direction when in slideshow mode
  if (autoAdvance) {
    rotationDirection *= -1; // Toggle between 1 (clockwise) and -1 (counterclockwise)
  }
  
  // Get vehicle info for display
  const vehicle = vehiclesGeoJSON.features.find(f => f.properties.id === vehicleId);
  const vehicleLabel = vehicle ? (vehicle.properties.label || vehicle.properties.route_id || 'Vehicle') : 'Vehicle';
  
  // Show follow indicator
  if (autoAdvance) {
    followIndicatorText.textContent = `🎬 Slideshow: Following ${vehicleLabel}`;
  } else {
    followIndicatorText.textContent = `📹 Following ${vehicleLabel}`;
  }
  followIndicator.classList.add('visible');
  
  // Fly to vehicle with animation
  map.flyTo({
    center: coords,
    zoom: FOLLOW_MODE_ZOOM, // Closer zoom for better detail
    pitch: FOLLOW_MODE_PITCH, // Isometric-like view
    bearing: FOLLOW_MODE_INITIAL_BEARING,
    duration: FOLLOW_MODE_FLY_DURATION_MS,
    essential: true
  });
  
  // Wait for flyTo to complete before starting rotation animation
  // This prevents the rotation from interrupting the flyTo animation
  followTimeout = setTimeout(() => {
    followTimeout = null; // Clear reference after execution
    if (!followModeActive) return; // Check if mode was cancelled during flyTo
    
    // Don't show popup automatically - user can toggle it if needed
    
    // Start rotation animation using requestAnimationFrame for smooth rotation
    rotationStartTime = performance.now();
    let lastKnownCoords = null;
    
    function animateRotation(currentTime) {
      if (!followModeActive) {
        return;
      }
      
      // Calculate elapsed time since rotation started
      const elapsedSeconds = (currentTime - rotationStartTime) / MILLISECONDS_PER_SECOND;
      
      // Calculate current angle based on elapsed time, rotation speed, and direction
      // rotationDirection: 1 for clockwise, -1 for counterclockwise
      currentRotationAngle = (ROTATION_SPEED * elapsedSeconds * rotationDirection) % DEGREES_IN_CIRCLE;
      
      // Update camera bearing smoothly
      map.setBearing(currentRotationAngle);
      
      // Keep camera centered on vehicle using interpolated position for smooth following
      // Use interpolatedGeoJSON which contains smoothly animated positions between data updates
      const vehicle = interpolatedGeoJSON.features.find(f => f.properties.id === vehicleId);
      if (vehicle) {
        const newCoords = vehicle.geometry.coordinates;
        
        // Always update position for smooth camera following that matches vehicle animation
        // The interpolatedGeoJSON coordinates change smoothly via animatePositions()
        if (!lastKnownCoords || 
            lastKnownCoords[0] !== newCoords[0] || 
            lastKnownCoords[1] !== newCoords[1]) {
          // Use setCenter to update position without interrupting rotation animation
          // This prevents jitter and works in harmony with setBearing above
          map.setCenter(newCoords);
          lastKnownCoords = newCoords.slice(); // Store a copy
        }
        
        // Update popup position if it exists
        if (currentFollowPopup && currentFollowPopup.isOpen()) {
          currentFollowPopup.setLngLat(newCoords);
        }
      }
      
      // Continue animation loop
      rotationAnimationId = requestAnimationFrame(animateRotation);
    }
    
    // Start the animation loop
    rotationAnimationId = requestAnimationFrame(animateRotation);
  }, FOLLOW_MODE_FLY_DURATION_MS + FOLLOW_MODE_FLY_BUFFER_MS); // Wait for flyTo duration + small buffer
  
  // Set up auto-advance if in slideshow mode
  if (autoAdvance) {
    slideshowTimer = setTimeout(() => {
      if (slideshowActive) {
        startSlideshow(); // Move to next random vehicle
      }
    }, slideshowDurationMs); // Use customizable duration
  }
}

/**
 * Calculate current speed from recent vehicle history
 * Returns speed in km/h or null if not calculable
 */
function getCurrentSpeed(vehicleId) {
  const history = vehicleHistory[vehicleId];
  if (!history || history.length < 2) return null;
  
  const lastPos = history[history.length - 1];
  const prevPos = history[history.length - 2];
  const timeDiff = (lastPos.timestamp - prevPos.timestamp) / MILLISECONDS_PER_SECOND;
  
  if (timeDiff <= 0) return null;
  
  const distance = haversineDistance(
    prevPos.coords[1], prevPos.coords[0],
    lastPos.coords[1], lastPos.coords[0]
  );
  const speedMps = distance / timeDiff;
  return Math.round(speedMps * 3.6); // Convert to km/h
}

// Helper function to check if viewport is mobile
function isMobileViewport() {
  return window.innerWidth <= 768;
}

async function showVehiclePopup(vehicle, coords) {
  const props = vehicle.properties;
  const vehicleId = props.id;
  
  // Create content HTML
  const htmlParts = [
    `<div style="font-family: inherit; min-width: 200px; max-width: 280px; padding: 4px;">`,
    `<div style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #0077cc; word-wrap: break-word;">${props.label || props.route_id || 'Vehicle'}</div>`,
    `<div style="font-size: 13px; line-height: 1.6; color: #555;">`
  ];
  
  // Vehicle details
  if (props.human_readable_id) {
    htmlParts.push(`<div style="margin-bottom: 4px;"><span style="color: #888;">Human-readable ID:</span> <strong style="word-wrap: break-word; word-break: break-all;">${props.human_readable_id}</strong></div>`);
  }
  htmlParts.push(
    `<div style="margin-bottom: 4px;"><span style="color: #888;">Trip ID:</span> <strong style="word-wrap: break-word; word-break: break-all;">${props.trip_id || '—'}</strong></div>`,
    `<div style="margin-bottom: 4px;"><span style="color: #888;">Vehicle ID:</span> <strong style="word-wrap: break-word; word-break: break-all;">${props.id || '—'}</strong></div>`
  );
  
  // Last seen time
  if (props.timestamp) {
    const lastSeenTime = new Date(Number(props.timestamp) * MILLISECONDS_PER_SECOND);
    const timeStr = lastSeenTime.toLocaleTimeString();
    htmlParts.push(`<div style="margin-bottom: 4px;"><span style="color: #888;">Last seen:</span> <strong>${timeStr}</strong></div>`);
  }
  
  // Add current speed if available
  const currentSpeed = getCurrentSpeed(vehicleId);
  if (currentSpeed !== null) {
    htmlParts.push(`<div style="margin-bottom: 4px;"><span style="color: #888;">Current speed:</span> <strong style="color: #0077cc;">${currentSpeed} km/h</strong></div>`);
  }
  htmlParts.push(`</div>`);
  
  // Get upcoming stops if trip_id is available
  if (props.trip_id && props.current_stop_sequence !== null && vehicle.geometry?.coordinates) {
    try {
      const upcomingStops = await requestFromWorker('getUpcomingStops', {
        tripId: props.trip_id,
        currentStopSequence: props.current_stop_sequence || 0,
        vehicleCoords: vehicle.geometry.coordinates
      });
      
      if (upcomingStops && upcomingStops.length > 0) {
        htmlParts.push(
          `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e8e8e8;">`,
          `<div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px;">Upcoming stops:</div>`,
          '<div style="font-size: 12px; color: #666; line-height: 1.8; max-height: 200px; overflow-y: auto;">'
        );
        
        for (const stop of upcomingStops) {
          let etaText = '';
          let distanceText = '';
          
          if (stop.distance_meters !== null) {
            // Format distance
            if (stop.distance_meters >= 1000) {
              distanceText = `${(stop.distance_meters / 1000).toFixed(1)} km`;
            } else {
              distanceText = `${stop.distance_meters} m`;
            }
            
            // Calculate ETA based on current speed
            if (currentSpeed && currentSpeed > 0) {
              const etaMinutes = Math.round((stop.distance_meters / 1000) / (currentSpeed / 60));
              if (etaMinutes < 1) {
                etaText = ' • <1 min';
              } else {
                etaText = ` • ${etaMinutes} min`;
              }
              
              // Color code by ETA
              const etaColor = etaMinutes < ETA_IMMEDIATE ? COLOR_ETA_IMMEDIATE :
                               etaMinutes <= ETA_VERY_SOON ? COLOR_ETA_IMMEDIATE :
                               etaMinutes <= ETA_SOON ? COLOR_ETA_SOON :
                               etaMinutes <= ETA_MEDIUM ? COLOR_ETA_MEDIUM :
                               COLOR_ETA_COMFORTABLE;
              etaText = `<span style="color: ${etaColor}; font-weight: 600;">${etaText}</span>`;
            }
          } else {
            distanceText = '—';
          }
          
          htmlParts.push(
            `<div style="margin-bottom: 4px; padding: 4px; background: #f5f5f5; border-radius: 4px;">`,
            `<div style="font-weight: 600; color: #333;">${stop.stop_name}</div>`,
            `<div style="font-size: 11px; color: #888; margin-top: 2px;">`,
            `${distanceText}${etaText}`,
            `</div>`,
            `</div>`
          );
        }
        htmlParts.push('</div></div>');
      }
    } catch (e) {
      logDebug('Failed to get upcoming stops: ' + e.message, 'warn');
    }
  }
  
  // Add distance history if available
  if (vehicleId && vehicleHistory[vehicleId]) {
    const distances = calculateDistances(vehicleId);
    if (distances.length > 0) {
      htmlParts.push(
        `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e8e8e8;">`,
        `<div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px;">Distance traveled:</div>`,
        '<div style="font-size: 12px; color: #666; line-height: 1.8;">'
      );
      
      for (const d of distances) {
        const speedColor = d.speedKmh > SPEED_THRESHOLD_HIGH ? COLOR_VERY_FAST : 
                          d.speedKmh > SPEED_THRESHOLD_LOW ? COLOR_ETA_MEDIUM : 
                          COLOR_STATIONARY;
        htmlParts.push(
          `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">`,
          `<span>${formatInterval(d.interval)}:</span>`,
          `<span><strong>${d.distance}m</strong> <span style="color: ${speedColor};">(${d.speedKmh} km/h)</span></span>`,
          `</div>`
        );
      }
      htmlParts.push('</div></div>');
    }
  }
  
  // Add follow button
  htmlParts.push(
    `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e8e8e8;">`,
    `<button id="followBtn">📹 Follow this vehicle</button>`,
    `</div>`,
    '</div>'
  );
  
  // On mobile, show in card instead of popup
  if (isMobileViewport()) {
    mobileCardTitle.textContent = props.label || props.route_id || 'Vehicle';
    mobileCardContent.innerHTML = htmlParts.join('');
    mobileVehicleCard.classList.add('visible');
    mobileVehicleCard.classList.add('minimized');
    
    // Add follow button functionality for mobile
    setTimeout(() => {
      const followBtn = document.getElementById('followBtn');
      if (followBtn) {
        followBtn.addEventListener('click', () => {
          stopSlideshow();
          mobileVehicleCard.classList.remove('visible');
          followVehicle(vehicleId, coords, false, false);
          logDebug(`Started follow mode for vehicle ${vehicleId}`, 'info');
        });
      }
    }, 100);
    
    return null; // No popup on mobile
  }
  
  // Desktop: show normal popup
  const popup = new maplibregl.Popup({
    maxWidth: '300px',
    className: 'custom-popup'
  }).setLngLat(coords).setHTML(htmlParts.join('')).addTo(map);
  
  // Add event listener for follow button after popup is added to DOM
  setTimeout(() => {
    const followBtn = document.getElementById('followBtn');
    if (followBtn) {
      followBtn.addEventListener('click', () => {
        stopSlideshow(); // Stop slideshow if active
        popup.remove(); // Close popup
        followVehicle(vehicleId, coords, false, false);
        logDebug(`Started follow mode for vehicle ${vehicleId}`, 'info');
      });
      
      // Add hover effect
      followBtn.addEventListener('mouseenter', () => {
        followBtn.style.background = 'linear-gradient(to bottom, #0066b3, #00558a)';
      });
      followBtn.addEventListener('mouseleave', () => {
        followBtn.style.background = 'linear-gradient(to bottom, #0077cc, #0066b3)';
      });
    }
  }, 100);
  
  return popup;
}

function startSlideshow() {
  const vehicle = getRandomVehicle();
  if (!vehicle) {
    logDebug('No vehicles available for slideshow', 'warn');
    stopSlideshow();
    return;
  }
  
  const vehicleId = vehicle.properties.id;
  const coords = vehicle.geometry.coordinates;
  
  logDebug(`Slideshow: Following vehicle ${vehicleId} (${vehicle.properties.label || vehicle.properties.route_id})`, 'info');
  followVehicle(vehicleId, coords, false, true);
}

refreshBtn.addEventListener('click', () => {
  if (dataWorker && workerReady) {
    dataWorker.postMessage({ type: 'refresh' });
  }
});

// Show/hide clear button based on input value
function updateClearButton() {
  if (routeFilterEl.value.trim()) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }
}

routeFilterEl.addEventListener('input', () => {
  updateClearButton();
  cachedFilterText = routeFilterEl.value.trim().toLowerCase();
  // Mark routes and stops as dirty when filter changes
  routesDirty = true;
  stopsDirty = true;
  updateMapSource();
});

clearBtn.addEventListener('click', () => {
  routeFilterEl.value = '';
  cachedFilterText = '';
  updateClearButton();
  // Mark routes and stops as dirty when filter is cleared
  routesDirty = true;
  stopsDirty = true;
  updateMapSource();
  routeFilterEl.focus();
});

autoRefreshBtn.addEventListener('click', () => { 
  autoRefreshBtn.classList.toggle('active');
  if (autoRefreshBtn.classList.contains('active')) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});
locateBtn.addEventListener('click', () => {
  locateBtn.classList.toggle('active');
  if (locateBtn.classList.contains('active')) {
    startLocationTracking();
  } else {
    stopLocationTracking();
  }
});

toggleRoutesBtn.addEventListener('click', () => {
  toggleRoutesBtn.classList.toggle('active');
  showRoutes = toggleRoutesBtn.classList.contains('active');
  // Mark routes and stops as dirty when toggling visibility
  routesDirty = true;
  stopsDirty = true;
  updateMapSource();
});

snapToRouteBtn.addEventListener('click', () => {
  snapToRouteBtn.classList.toggle('active');
  snapToRoute = snapToRouteBtn.classList.contains('active');
  
  // Send updated option to worker (trails are built in worker)
  if (dataWorker && workerReady) {
    dataWorker.postMessage({ type: 'setOptions', options: { snapToRoute } });
  }
  
  // Request fresh data with new snapping option
  if (dataWorker && workerReady) {
    dataWorker.postMessage({ type: 'refresh' });
  }
  
  logDebug(`Route snapping ${snapToRoute ? 'enabled' : 'disabled'}`, 'info');
});

smoothAnimationBtn.addEventListener('click', () => {
  smoothAnimationBtn.classList.toggle('active');
  smoothAnimationMode = smoothAnimationBtn.classList.contains('active');
  logDebug(`Smooth animation mode ${smoothAnimationMode ? 'enabled' : 'disabled'}`, 'info');
});

slideshowBtn.addEventListener('click', () => {
  slideshowBtn.classList.toggle('active');
  if (slideshowBtn.classList.contains('active')) {
    slideshowActive = true;
    slideshowControls.classList.remove('slideshow-controls-hidden');
    slideshowControls.classList.add('slideshow-controls-visible');
    logDebug('Slideshow started', 'info');
    startSlideshow();
  } else {
    slideshowControls.classList.remove('slideshow-controls-visible');
    slideshowControls.classList.add('slideshow-controls-hidden');
    stopSlideshow();
  }
});

// Add event listener for slideshow Next button
slideshowNextBtn.addEventListener('click', () => {
  if (slideshowActive) {
    logDebug('Skipping to next vehicle in slideshow', 'info');
    // Clear the current timer and immediately advance to next vehicle
    if (slideshowTimer) {
      clearTimeout(slideshowTimer);
      slideshowTimer = null;
    }
    startSlideshow();
  }
});

// Add event listener for slideshow interval input
slideshowIntervalInput.addEventListener('change', () => {
  const newInterval = parseInt(slideshowIntervalInput.value, DECIMAL_RADIX);
  if (!isNaN(newInterval) && newInterval >= SLIDESHOW_INTERVAL_MIN_SECONDS && newInterval <= SLIDESHOW_INTERVAL_MAX_SECONDS) {
    slideshowDurationMs = newInterval * MILLISECONDS_PER_SECOND; // Convert seconds to milliseconds
    logDebug(`Slideshow interval updated to ${newInterval} seconds`, 'info');
  } else {
    // Reset to default if invalid
    slideshowIntervalInput.value = SLIDESHOW_INTERVAL_DEFAULT_SECONDS;
    slideshowDurationMs = SLIDESHOW_INTERVAL_DEFAULT_SECONDS * MILLISECONDS_PER_SECOND;
    logDebug('Invalid slideshow interval, reset to default', 'warn');
  }
});

// Add event listener for follow indicator close button
const followIndicatorClose = document.getElementById('followIndicatorClose');
if (followIndicatorClose) {
  followIndicatorClose.addEventListener('click', () => {
    stopSlideshow();
    logDebug('Follow/slideshow mode stopped via close button', 'info');
  });
}

// Vehicle display mode event handlers (desktop)
displayModeDotsBtn.addEventListener('click', () => {
  setVehicleDisplayMode(VEHICLE_DISPLAY_MODES.DOTS);
});

displayModeEmojiBtn.addEventListener('click', () => {
  setVehicleDisplayMode(VEHICLE_DISPLAY_MODES.EMOJI);
});

displayModeCharBtn.addEventListener('click', () => {
  setVehicleDisplayMode(VEHICLE_DISPLAY_MODES.SINGLE_CHAR);
});

displayModeArrowBtn.addEventListener('click', () => {
  setVehicleDisplayMode(VEHICLE_DISPLAY_MODES.ARROW);
});

// Helper function to set vehicle display mode and update buttons
function setVehicleDisplayMode(mode) {
  updateVehicleDisplayMode(mode);
  
  // Update all desktop buttons
  const desktopButtons = [displayModeDotsBtn, displayModeEmojiBtn, displayModeCharBtn, displayModeArrowBtn];
  desktopButtons.forEach(btn => btn.classList.remove('active'));
  
  // Update all mobile buttons
  const mobileButtons = [mobileDisplayModeDotsBtn, mobileDisplayModeEmojiBtn, mobileDisplayModeCharBtn, mobileDisplayModeArrowBtn];
  mobileButtons.forEach(btn => btn.classList.remove('active'));
  
  // Mapping of modes to button pairs
  const modeButtonMap = {
    [VEHICLE_DISPLAY_MODES.DOTS]: [displayModeDotsBtn, mobileDisplayModeDotsBtn],
    [VEHICLE_DISPLAY_MODES.EMOJI]: [displayModeEmojiBtn, mobileDisplayModeEmojiBtn],
    [VEHICLE_DISPLAY_MODES.SINGLE_CHAR]: [displayModeCharBtn, mobileDisplayModeCharBtn],
    [VEHICLE_DISPLAY_MODES.ARROW]: [displayModeArrowBtn, mobileDisplayModeArrowBtn]
  };
  
  // Activate the correct buttons based on mode
  const buttonsToActivate = modeButtonMap[mode];
  if (buttonsToActivate) {
    buttonsToActivate.forEach(btn => btn.classList.add('active'));
  }
}

// Desktop settings menu event listener
settingsBtn.addEventListener('click', () => {
  settingsBtn.classList.toggle('active');
  desktopSettingsPanel.classList.toggle('visible');
});

desktopSettingsClose.addEventListener('click', () => {
  settingsBtn.classList.remove('active');
  desktopSettingsPanel.classList.remove('visible');
});

// Mobile bottom bar event listeners
mobileMenuBtn.addEventListener('click', () => {
  mobileMenuPanel.classList.add('visible');
});

mobileFilterBtn.addEventListener('click', () => {
  mobileFilterPanel.classList.add('visible');
});

mobileRefreshBtn.addEventListener('click', () => {
  if (dataWorker && workerReady) {
    dataWorker.postMessage({ type: 'refresh' });
  }
});

mobileLocateBtn.addEventListener('click', () => {
  locateBtn.click(); // Reuse desktop logic
});

mobileSettingsBtn.addEventListener('click', () => {
  mobileSettingsPanel.classList.add('visible');
});

// Mobile panel close handlers
mobileFilterClose.addEventListener('click', () => {
  mobileFilterPanel.classList.remove('visible');
});

mobileMenuClose.addEventListener('click', () => {
  mobileMenuPanel.classList.remove('visible');
});

mobileSettingsClose.addEventListener('click', () => {
  mobileSettingsPanel.classList.remove('visible');
});

// Mobile vehicle card handlers
mobileCardClose.addEventListener('click', () => {
  mobileVehicleCard.classList.remove('visible');
  mobileVehicleCard.classList.remove('minimized');
});

mobileCardMinimize.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileVehicleCard.classList.toggle('minimized');
});

// Click header to expand/collapse
mobileCardHeader.addEventListener('click', () => {
  if (mobileVehicleCard.classList.contains('minimized')) {
    mobileVehicleCard.classList.remove('minimized');
  }
});

// Mobile filter functionality (sync with desktop)
function updateMobileClearButton() {
  if (mobileRouteFilter.value.trim()) {
    mobileClearBtn.classList.add('visible');
  } else {
    mobileClearBtn.classList.remove('visible');
  }
}

mobileRouteFilter.addEventListener('input', () => {
  updateMobileClearButton();
  // Sync with desktop filter
  routeFilterEl.value = mobileRouteFilter.value;
  cachedFilterText = mobileRouteFilter.value.trim().toLowerCase();
  routesDirty = true;
  stopsDirty = true;
  updateMapSource();
});

mobileClearBtn.addEventListener('click', () => {
  mobileRouteFilter.value = '';
  routeFilterEl.value = '';
  cachedFilterText = '';
  updateMobileClearButton();
  updateClearButton();
  routesDirty = true;
  stopsDirty = true;
  updateMapSource();
  mobileRouteFilter.focus();
});

// Sync desktop filter to mobile
routeFilterEl.addEventListener('input', () => {
  mobileRouteFilter.value = routeFilterEl.value;
  updateMobileClearButton();
});

// Mobile toggle buttons (sync with desktop)
mobileAutoRefreshBtn.addEventListener('click', () => {
  autoRefreshBtn.click();
  mobileAutoRefreshBtn.classList.toggle('active');
});

mobileToggleRoutesBtn.addEventListener('click', () => {
  toggleRoutesBtn.click();
  mobileToggleRoutesBtn.classList.toggle('active');
});

mobileSnapToRouteBtn.addEventListener('click', () => {
  snapToRouteBtn.click();
  mobileSnapToRouteBtn.classList.toggle('active');
});

mobileSmoothAnimationBtn.addEventListener('click', () => {
  smoothAnimationBtn.click();
  mobileSmoothAnimationBtn.classList.toggle('active');
});

mobileSlideshowBtn.addEventListener('click', () => {
  mobileSlideshowBtn.classList.toggle('active');
  if (mobileSlideshowBtn.classList.contains('active')) {
    slideshowActive = true;
    mobileSlideshowControls.classList.remove('slideshow-controls-hidden');
    slideshowBtn.classList.add('active');
    slideshowControls.classList.remove('slideshow-controls-hidden');
    slideshowControls.classList.add('slideshow-controls-visible');
    logDebug('Slideshow started (mobile)', 'info');
    startSlideshow();
  } else {
    mobileSlideshowControls.classList.add('slideshow-controls-hidden');
    slideshowControls.classList.remove('slideshow-controls-visible');
    slideshowControls.classList.add('slideshow-controls-hidden');
    slideshowBtn.classList.remove('active');
    stopSlideshow();
  }
});

mobileSlideshowNextBtn.addEventListener('click', () => {
  if (slideshowActive) {
    logDebug('Skipping to next vehicle in slideshow (mobile)', 'info');
    if (slideshowTimer) {
      clearTimeout(slideshowTimer);
      slideshowTimer = null;
    }
    startSlideshow();
  }
});

mobileSlideshowInterval.addEventListener('change', () => {
  const newInterval = parseInt(mobileSlideshowInterval.value, DECIMAL_RADIX);
  if (!isNaN(newInterval) && newInterval >= SLIDESHOW_INTERVAL_MIN_SECONDS && newInterval <= SLIDESHOW_INTERVAL_MAX_SECONDS) {
    slideshowDurationMs = newInterval * MILLISECONDS_PER_SECOND;
    slideshowIntervalInput.value = newInterval; // Sync with desktop
    logDebug(`Slideshow interval updated to ${newInterval} seconds (mobile)`, 'info');
  } else {
    mobileSlideshowInterval.value = SLIDESHOW_INTERVAL_DEFAULT_SECONDS;
    slideshowIntervalInput.value = SLIDESHOW_INTERVAL_DEFAULT_SECONDS; // Sync with desktop
    slideshowDurationMs = SLIDESHOW_INTERVAL_DEFAULT_SECONDS * MILLISECONDS_PER_SECOND;
    logDebug('Invalid slideshow interval, reset to default (mobile)', 'warn');
  }
});

// Vehicle display mode event handlers (mobile)
mobileDisplayModeDotsBtn.addEventListener('click', () => {
  setVehicleDisplayMode(VEHICLE_DISPLAY_MODES.DOTS);
});

mobileDisplayModeEmojiBtn.addEventListener('click', () => {
  setVehicleDisplayMode(VEHICLE_DISPLAY_MODES.EMOJI);
});

mobileDisplayModeCharBtn.addEventListener('click', () => {
  setVehicleDisplayMode(VEHICLE_DISPLAY_MODES.SINGLE_CHAR);
});

mobileDisplayModeArrowBtn.addEventListener('click', () => {
  setVehicleDisplayMode(VEHICLE_DISPLAY_MODES.ARROW);
});

// Add keyboard support for exiting follow/slideshow mode and clearing filter
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (followModeActive || slideshowActive) {
      stopSlideshow();
      logDebug('Follow/slideshow mode stopped via Escape key', 'info');
    } else if (routeFilterEl.value.trim()) {
      // Clear the route filter
      routeFilterEl.value = '';
      cachedFilterText = '';
      updateClearButton();
      updateMapSource();
      logDebug('Route filter cleared via Escape key', 'info');
    }
  }
});

// Allow clicking on map background to exit follow mode (but not slideshow) and clear filter
if (map) {
  map.on('click', (e) => {
    // Only exit follow mode if clicking on empty space (not on a vehicle or stop)
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['vehicle-icons', 'stop-circles']
    });
    
    if (features.length === 0) {
      if (followModeActive && !slideshowActive) {
        stopFollowMode();
        logDebug('Follow mode stopped via map click', 'info');
      } else if (routeFilterEl.value.trim()) {
        // Clear the route filter
        routeFilterEl.value = '';
        cachedFilterText = '';
        updateClearButton();
        updateMapSource();
        logDebug('Route filter cleared via map click', 'info');
      }
    }
  });
}

function startProgressBar() {
  stopProgressBar();
  
  progressStartTime = Date.now();
  autoRefreshBtn.style.setProperty('--progress-width', '0%');
  
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - progressStartTime;
    const progress = Math.min((elapsed / REFRESH_INTERVAL_MS) * 100, 100);
    
    // Update the ::before pseudo-element width via inline style
    autoRefreshBtn.style.setProperty('--progress-width', progress + '%');
    
    // Reset when complete
    if (progress >= 100) {
      progressStartTime = Date.now();
    }
  }, 100); // Update every 100ms for smooth animation
}

function stopProgressBar() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  autoRefreshBtn.style.setProperty('--progress-width', '0%');
}

function startAutoRefresh() {
  stopAutoRefresh();
  if (dataWorker && workerReady) {
    dataWorker.postMessage({ type: 'setAutoRefresh', enabled: true, intervalMs: REFRESH_INTERVAL_MS });
    startProgressBar();
  }
}
function stopAutoRefresh() { 
  if (dataWorker && workerReady) {
    dataWorker.postMessage({ type: 'setAutoRefresh', enabled: false });
  }
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  stopProgressBar();
}

function updateUserLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation not available');
    stopLocationTracking();
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const coords = [pos.coords.longitude, pos.coords.latitude];
    userLocation.features = [{
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords }
    }];
    map.getSource('user-location').setData(userLocation);
    logDebug(`User location updated: ${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`, 'info');
    // Fly to user location only on first update after enabling
    if (shouldFlyToLocation) {
      map.flyTo({ center: coords, zoom: USER_LOCATION_ZOOM });
      shouldFlyToLocation = false;
    }
  }, e => {
    logDebug('Unable to get location: ' + e.message, 'error');
    // Don't stop tracking on single failure, but notify user
    if (locationTrackingEnabled) {
      logDebug('Location tracking will continue...', 'info');
    }
  });
}

function startLocationTracking() {
  stopLocationTracking();
  locationTrackingEnabled = true;
  shouldFlyToLocation = true; // Set flag to fly to location on first update
  // Get location immediately
  updateUserLocation();
  // Then update every 30 seconds
  locationTrackingTimer = setInterval(updateUserLocation, LOCATION_UPDATE_INTERVAL_MS);
  logDebug('Location tracking started (updates every 30s)', 'info');
}

function stopLocationTracking() {
  locationTrackingEnabled = false;
  if (locationTrackingTimer) {
    clearInterval(locationTrackingTimer);
    locationTrackingTimer = null;
  }
  // Clear the user location marker (blue dot)
  userLocation.features = [];
  if (map.getSource('user-location')) {
    map.getSource('user-location').setData(userLocation);
  }
  logDebug('Location tracking stopped', 'info');
}

(async function(){
  try {
    updateStatus('Waiting for map to load...');
    
    // Handle map initialization (may already be loaded or still loading)
    const initializeApp = async () => {
      try {
        logDebug('Map loaded successfully', 'info');
        loadEmojiImages(); // Load emoji icons
        loadCharacterImages(); // Load character icons
        loadArrowImages(); // Load arrow icons
        // Start data worker - it will load GTFS data and then we can fetch vehicles
        updateStatus('Starting data worker...');
        startDataWorker();
        // Worker will send 'gtfsLoaded' message when GTFS data is ready
        // Then it will continue with vehicle data fetching
      } catch (err) {
        logDebug('Error during map initialization: ' + err.message, 'error');
        updateStatus('Error during initialization');
        // Unlock UI even on error so user can try to refresh
        unlockUI();
        alert('Failed to load map data: ' + err.message);
      }
    };
    
    // Check if map is already loaded or wait for it
    if (map && map.loaded()) {
      logDebug('Map already loaded, initializing immediately', 'info');
      await initializeApp();
    } else if (map) {
      map.on('load', initializeApp);
    } else {
      logDebug('Map not available, UI-only mode', 'warn');
      unlockUI();
    }
  } catch (err) {
    logDebug('Startup error: ' + err.message, 'error');
    updateStatus('Startup error');
    // Unlock UI even on error so user can try to refresh
    unlockUI();
    alert('Failed to initialise: ' + err.message);
  }
})();
