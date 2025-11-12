/**
 * map.js - MapLibre GL Map Operations
 * 
 * Handles all MapLibre-specific logic including map initialization,
 * layer management, and map-related interactions.
 */

import * as state from './state.js';
import * as constants from './constants.js';

// ============================================================================
// MAP INITIALIZATION
// ============================================================================

let map = null;

/**
 * Initialize the MapLibre GL map
 * @returns {Object} The initialized map instance
 */
export function initializeMap() {
  try {
    map = new maplibregl.Map({
      container: 'map',
      style: constants.LIGHT_MAP_STYLE,
      center: [153.0251, -27.4679],
      zoom: constants.DEFAULT_ZOOM,
      canvasContextAttributes: { antialias: true },
      maxPitch: 85
    });
    map.addControl(new maplibregl.NavigationControl({showCompass: false}), 'top-right');
    return map;
  } catch (error) {
    console.error('MapLibre GL not available:', error);
    throw error;
  }
}

/**
 * Get the current map instance
 * @returns {Object} The map instance
 */
export function getMap() {
  return map;
}

// ============================================================================
// MAP UTILITY FUNCTIONS
// ============================================================================

/**
 * Get appropriate font stack for current map style
 * @returns {Array} Font stack array
 */
export function getMapFont() {
  if (state.getBuildings3DEnabled()) {
    return ['Noto Sans Bold'];
  }
  return ['Open Sans Bold', 'Arial Unicode MS Bold'];
}

/**
 * Create an empty GeoJSON feature collection
 * @param {Array} features - Optional array of features
 * @returns {Object} GeoJSON FeatureCollection
 */
export function createFeatureCollection(features = []) {
  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Create a GeoJSON Point feature
 * @param {Array} coordinates - [longitude, latitude]
 * @param {Object} properties - Feature properties
 * @returns {Object} GeoJSON Feature
 */
export function createPointFeature(coordinates, properties) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates
    },
    properties: properties || {}
  };
}

/**
 * Create a GeoJSON LineString feature
 * @param {Array} coordinates - Array of [longitude, latitude] pairs
 * @param {Object} properties - Feature properties
 * @returns {Object} GeoJSON Feature
 */
export function createLineFeature(coordinates, properties) {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates
    },
    properties: properties || {}
  };
}

// ============================================================================
// MAP LAYER MANAGEMENT
// ============================================================================

/**
 * Check if a layer exists on the map
 * @param {string} layerId - Layer ID to check
 * @returns {boolean} True if layer exists
 */
export function hasLayer(layerId) {
  return map && map.getLayer(layerId) !== undefined;
}

/**
 * Check if a source exists on the map
 * @param {string} sourceId - Source ID to check
 * @returns {boolean} True if source exists
 */
export function hasSource(sourceId) {
  return map && map.getSource(sourceId) !== undefined;
}

/**
 * Update a map source with new data
 * @param {string} sourceId - Source ID
 * @param {Object} data - GeoJSON data
 */
export function updateSource(sourceId, data) {
  if (map && hasSource(sourceId)) {
    map.getSource(sourceId).setData(data);
  }
}

/**
 * Add a GeoJSON source to the map
 * @param {string} sourceId - Source ID
 * @param {Object} data - Initial GeoJSON data
 * @param {Object} options - Additional source options
 */
export function addSource(sourceId, data, options = {}) {
  if (map && !hasSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data,
      ...options
    });
  }
}

/**
 * Add a layer to the map
 * @param {Object} layerConfig - MapLibre layer configuration
 */
export function addLayer(layerConfig) {
  if (map && !hasLayer(layerConfig.id)) {
    map.addLayer(layerConfig);
  }
}

/**
 * Set layer visibility
 * @param {string} layerId - Layer ID
 * @param {boolean} visible - Whether layer should be visible
 */
export function setLayerVisibility(layerId, visible) {
  if (map && hasLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
}

/**
 * Remove a layer from the map
 * @param {string} layerId - Layer ID to remove
 */
export function removeLayer(layerId) {
  if (map && hasLayer(layerId)) {
    map.removeLayer(layerId);
  }
}

/**
 * Remove a source from the map
 * @param {string} sourceId - Source ID to remove
 */
export function removeSource(sourceId) {
  if (map && hasSource(sourceId)) {
    map.removeSource(sourceId);
  }
}

// ============================================================================
// MAP CAMERA OPERATIONS
// ============================================================================

/**
 * Fly to a specific location
 * @param {Object} options - MapLibre flyTo options
 */
export function flyTo(options) {
  if (map) {
    map.flyTo(options);
  }
}

/**
 * Jump to a specific location instantly
 * @param {Object} options - MapLibre jumpTo options
 */
export function jumpTo(options) {
  if (map) {
    map.jumpTo(options);
  }
}

/**
 * Ease to a specific camera position
 * @param {Object} options - MapLibre easeTo options
 */
export function easeTo(options) {
  if (map) {
    map.easeTo(options);
  }
}

/**
 * Get current map center
 * @returns {Object} LngLat object
 */
export function getCenter() {
  return map ? map.getCenter() : null;
}

/**
 * Get current map zoom
 * @returns {number} Zoom level
 */
export function getZoom() {
  return map ? map.getZoom() : null;
}

/**
 * Get current map bearing
 * @returns {number} Bearing in degrees
 */
export function getBearing() {
  return map ? map.getBearing() : null;
}

/**
 * Get current map pitch
 * @returns {number} Pitch in degrees
 */
export function getPitch() {
  return map ? map.getPitch() : null;
}

// ============================================================================
// MAP EVENT HANDLING
// ============================================================================

/**
 * Add an event listener to the map
 * @param {string} type - Event type
 * @param {string} layerId - Optional layer ID
 * @param {Function} listener - Event listener function
 */
export function on(type, layerIdOrListener, listener) {
  if (map) {
    if (typeof layerIdOrListener === 'function') {
      map.on(type, layerIdOrListener);
    } else {
      map.on(type, layerIdOrListener, listener);
    }
  }
}

/**
 * Remove an event listener from the map
 * @param {string} type - Event type
 * @param {string} layerId - Optional layer ID
 * @param {Function} listener - Event listener function
 */
export function off(type, layerIdOrListener, listener) {
  if (map) {
    if (typeof layerIdOrListener === 'function') {
      map.off(type, layerIdOrListener);
    } else {
      map.off(type, layerIdOrListener, listener);
    }
  }
}

/**
 * Check if map is loaded
 * @returns {boolean} True if map is loaded
 */
export function isLoaded() {
  return map && map.loaded();
}

// ============================================================================
// MAP STYLE MANAGEMENT
// ============================================================================

/**
 * Switch map style (light/dark mode)
 * @param {boolean} isDark - Whether to use dark mode
 */
export function setMapStyle(isDark) {
  if (!map) return;
  
  const newStyle = isDark ? constants.DARK_MAP_STYLE : constants.LIGHT_MAP_STYLE;
  state.setCurrentMapStyleIsDark(isDark);
  
  // Switching style will remove all layers and sources, so we need to re-add them
  // This is handled by the caller after style switch is complete
  map.setStyle(newStyle);
}

/**
 * Get the map canvas element
 * @returns {HTMLCanvasElement} The map canvas
 */
export function getCanvas() {
  return map ? map.getCanvas() : null;
}
