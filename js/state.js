/**
 * state.js - Application State Management
 * 
 * Centralized state management for the Brisbane Bus application.
 * Manages all application state including filters, display options, and dirty flags.
 */

import { SLIDESHOW_INTERVAL_DEFAULT_SECONDS, MILLISECONDS_PER_SECOND } from './constants.js';

// ============================================================================
// STATE VARIABLES
// ============================================================================

// Worker state
let dataWorker = null;
let workerReady = false;

// GTFS data
let vehiclesGeoJSON = { type: 'FeatureCollection', features: [] };
let vehicleHistory = {}; // vehicle_id → array of {coords, timestamp, speed} - UI only
let gtfsStats = { shapeCount: 0, stopCount: 0, routeCount: 0, tripCount: 0 };
let lastWorkerStats = null;

// Cached data from worker
let cachedRouteShapes = null;
let cachedStops = null;
let cachedRouteIds = [];

// User location state
let locationTrackingEnabled = false;
let shouldFlyToLocation = false;
let userLocation = { type: 'FeatureCollection', features: [] };

// Display toggles
let showVehicles = true;
let showRoutes = true;
let showTrails = true;
let showStops = true;
let snapToRoute = true;
let buildings3DEnabled = false;

// Filter state
let cachedFilterText = '';
let directionFilter = 'all'; // 'all', 'inbound', 'outbound'
let vehicleTypeFilter = {
  0: true,   // Tram
  1: true,   // Subway
  2: true,   // Rail
  3: true,   // Bus
  4: true,   // Ferry
  5: true,   // Cable Tram
  6: true,   // Aerial Lift
  7: true,   // Funicular
  8: true,   // Reserved/Trolleybus
  9: true,   // Reserved/Monorail
  10: true,  // Reserved
  11: true,  // Trolleybus (extended GTFS)
  12: true   // Monorail (extended GTFS)
};

// Display mode
let vehicleDisplayMode = 'emoji'; // 'dots', 'emoji', 'single-char', 'arrow'

// Theme state
let themeMode = 'auto'; // 'light', 'dark', 'auto'
let currentMapStyleIsDark = false;

// Dirty flags for performance optimization
let routesDirty = true;
let stopsDirty = true;
let trailsDirty = true;

// Cache for expensive calculations
let stopsGeoJSON = null;
let interpolatedGeoJSON = { type: 'FeatureCollection', features: [] };
let trailsGeoJSON = { type: 'FeatureCollection', features: [] };

// Animation state
let animationStartTime = null;
let animationInProgress = false;
let previousPositions = {};
let targetPositions = {};
let animationPaths = {};
let animationDataReady = false;

// Follow/Slideshow mode state
let slideshowActive = false;
let followModeActive = false;
let currentFollowedVehicle = null;
let currentRotationAngle = 0;
let currentFollowPopup = null;
let rotationStartTime = null;
let slideshowDurationMs = SLIDESHOW_INTERVAL_DEFAULT_SECONDS * MILLISECONDS_PER_SECOND;
let rotationDirection = 1;

// Worker trails data
let workerTrailsGeoJSON = { type: 'FeatureCollection', features: [] };

// ============================================================================
// GETTERS
// ============================================================================

export function getDataWorker() { return dataWorker; }
export function getWorkerReady() { return workerReady; }
export function getVehiclesGeoJSON() { return vehiclesGeoJSON; }
export function getVehicleHistory() { return vehicleHistory; }
export function getGtfsStats() { return gtfsStats; }
export function getLastWorkerStats() { return lastWorkerStats; }
export function getCachedRouteShapes() { return cachedRouteShapes; }
export function getCachedStops() { return cachedStops; }
export function getCachedRouteIds() { return cachedRouteIds; }
export function getLocationTrackingEnabled() { return locationTrackingEnabled; }
export function getShouldFlyToLocation() { return shouldFlyToLocation; }
export function getUserLocation() { return userLocation; }
export function getShowVehicles() { return showVehicles; }
export function getShowRoutes() { return showRoutes; }
export function getShowTrails() { return showTrails; }
export function getShowStops() { return showStops; }
export function getSnapToRoute() { return snapToRoute; }
export function getBuildings3DEnabled() { return buildings3DEnabled; }
export function getCachedFilterText() { return cachedFilterText; }
export function getDirectionFilter() { return directionFilter; }
export function getVehicleTypeFilter() { return vehicleTypeFilter; }
export function getVehicleDisplayMode() { return vehicleDisplayMode; }
export function getThemeMode() { return themeMode; }
export function getCurrentMapStyleIsDark() { return currentMapStyleIsDark; }
export function getRoutesDirty() { return routesDirty; }
export function getStopsDirty() { return stopsDirty; }
export function getTrailsDirty() { return trailsDirty; }
export function getStopsGeoJSON() { return stopsGeoJSON; }
export function getInterpolatedGeoJSON() { return interpolatedGeoJSON; }
export function getTrailsGeoJSON() { return trailsGeoJSON; }
export function getAnimationStartTime() { return animationStartTime; }
export function getAnimationInProgress() { return animationInProgress; }
export function getPreviousPositions() { return previousPositions; }
export function getTargetPositions() { return targetPositions; }
export function getAnimationPaths() { return animationPaths; }
export function getAnimationDataReady() { return animationDataReady; }
export function getSlideshowActive() { return slideshowActive; }
export function getFollowModeActive() { return followModeActive; }
export function getCurrentFollowedVehicle() { return currentFollowedVehicle; }
export function getCurrentRotationAngle() { return currentRotationAngle; }
export function getCurrentFollowPopup() { return currentFollowPopup; }
export function getRotationStartTime() { return rotationStartTime; }
export function getSlideshowDurationMs() { return slideshowDurationMs; }
export function getRotationDirection() { return rotationDirection; }
export function getWorkerTrailsGeoJSON() { return workerTrailsGeoJSON; }

// ============================================================================
// SETTERS
// ============================================================================

export function setDataWorker(value) { dataWorker = value; }
export function setWorkerReady(value) { workerReady = value; }
export function setVehiclesGeoJSON(value) { vehiclesGeoJSON = value; }
export function setVehicleHistory(value) { vehicleHistory = value; }
export function setGtfsStats(value) { gtfsStats = value; }
export function setLastWorkerStats(value) { lastWorkerStats = value; }
export function setCachedRouteShapes(value) { cachedRouteShapes = value; }
export function setCachedStops(value) { cachedStops = value; }
export function setCachedRouteIds(value) { cachedRouteIds = value; }
export function setLocationTrackingEnabled(value) { locationTrackingEnabled = value; }
export function setShouldFlyToLocation(value) { shouldFlyToLocation = value; }
export function setUserLocation(value) { userLocation = value; }
export function setShowVehicles(value) { showVehicles = value; }
export function setShowRoutes(value) { showRoutes = value; }
export function setShowTrails(value) { showTrails = value; }
export function setShowStops(value) { showStops = value; }
export function setSnapToRoute(value) { snapToRoute = value; }
export function setBuildings3DEnabled(value) { buildings3DEnabled = value; }
export function setCachedFilterText(value) { cachedFilterText = value; }
export function setDirectionFilter(value) { directionFilter = value; }
export function setVehicleTypeFilter(value) { vehicleTypeFilter = value; }
export function setVehicleDisplayMode(value) { vehicleDisplayMode = value; }
export function setThemeMode(value) { themeMode = value; }
export function setCurrentMapStyleIsDark(value) { currentMapStyleIsDark = value; }
export function setRoutesDirty(value) { routesDirty = value; }
export function setStopsDirty(value) { stopsDirty = value; }
export function setTrailsDirty(value) { trailsDirty = value; }
export function setStopsGeoJSON(value) { stopsGeoJSON = value; }
export function setInterpolatedGeoJSON(value) { interpolatedGeoJSON = value; }
export function setTrailsGeoJSON(value) { trailsGeoJSON = value; }
export function setAnimationStartTime(value) { animationStartTime = value; }
export function setAnimationInProgress(value) { animationInProgress = value; }
export function setPreviousPositions(value) { previousPositions = value; }
export function setTargetPositions(value) { targetPositions = value; }
export function setAnimationPaths(value) { animationPaths = value; }
export function setAnimationDataReady(value) { animationDataReady = value; }
export function setSlideshowActive(value) { slideshowActive = value; }
export function setFollowModeActive(value) { followModeActive = value; }
export function setCurrentFollowedVehicle(value) { currentFollowedVehicle = value; }
export function setCurrentRotationAngle(value) { currentRotationAngle = value; }
export function setCurrentFollowPopup(value) { currentFollowPopup = value; }
export function setRotationStartTime(value) { rotationStartTime = value; }
export function setSlideshowDurationMs(value) { slideshowDurationMs = value; }
export function setRotationDirection(value) { rotationDirection = value; }
export function setWorkerTrailsGeoJSON(value) { workerTrailsGeoJSON = value; }
