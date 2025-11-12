/**
 * constants.js - Application Constants
 * 
 * Centralized constants used throughout the application.
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const PROXY_FEED_URL = 'https://api.codetabs.com/v1/proxy?quest=https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions';
export const GTFS_BASE_URL = window.location.pathname.includes('/brisbus/') ? '/brisbus/data/' : '/data/';
export const PROTO_URL = 'https://raw.githubusercontent.com/google/transit/master/gtfs-realtime/proto/gtfs-realtime.proto';
export const REFRESH_INTERVAL_MS = 10000;
export const HISTORY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes for trails
export const LOCATION_UPDATE_INTERVAL_MS = 30000; // 30 seconds for user location updates

// ============================================================================
// GEOGRAPHIC AND MATHEMATICAL CONSTANTS
// ============================================================================

export const METERS_PER_DEGREE_LAT = 111320;
export const DEGREES_IN_CIRCLE = 360;
export const RADIANS_PER_DEGREE = Math.PI / 180;

// ============================================================================
// TIME CONVERSION CONSTANTS
// ============================================================================

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_HALF_DAY = 12 * 3600;
export const SECONDS_PER_DAY = 24 * 3600;
export const MILLISECONDS_PER_SECOND = 1000;

// ============================================================================
// NUMBER PARSING
// ============================================================================

export const DECIMAL_RADIX = 10;

// ============================================================================
// MAP VIEW CONSTANTS
// ============================================================================

export const FOLLOW_MODE_ZOOM = 16;
export const FOLLOW_MODE_PITCH = 60;
export const FOLLOW_MODE_INITIAL_BEARING = 0;

// ============================================================================
// ANIMATION AND TIMING CONSTANTS
// ============================================================================

export const ANIMATION_DURATION_MS = 2000;  // 2 seconds
export const SLIDESHOW_DURATION_MS = 30000; // 30 seconds per vehicle
export const SLIDESHOW_INTERVAL_MIN_SECONDS = 5;
export const SLIDESHOW_INTERVAL_MAX_SECONDS = 300; // 5 minutes
export const SLIDESHOW_INTERVAL_DEFAULT_SECONDS = 30;
export const SLIDESHOW_INTERVAL_STEP_SECONDS = 5;
export const ROTATION_FULL_CYCLE_SECONDS = 60;
export const ROTATION_SPEED = DEGREES_IN_CIRCLE / ROTATION_FULL_CYCLE_SECONDS; // 6° per second
export const FOLLOW_MODE_FLY_DURATION_MS = 2000;
export const FOLLOW_MODE_FLY_BUFFER_MS = 100;
export const CIRCLE_TRANSITION_DURATION_MS = 2000;
export const UI_UPDATE_INTERVAL_MS = 1000; // Update UI every second

// ============================================================================
// PATH CALCULATION CONSTANTS
// ============================================================================

export const MAX_SEGMENT_DIFF = 200;
export const MAX_REASONABLE_DISTANCE = 2000; // 2km
export const SNAP_THRESHOLD_M = 100;

// ============================================================================
// DISTANCE CALCULATION TIME INTERVALS (in seconds)
// ============================================================================

export const DISTANCE_INTERVALS_SECONDS = [10, 20, 30, 60, 120, 180, 300, 600];

// ============================================================================
// SPEED THRESHOLDS (m/s)
// ============================================================================

export const SPEED_STATIONARY = 0;
export const SPEED_SLOW = 5;      // 5 m/s ≈ 18 km/h
export const SPEED_MEDIUM = 10;   // 10 m/s ≈ 36 km/h
export const SPEED_FAST = 15;     // 15 m/s ≈ 54 km/h
export const SPEED_VERY_FAST = 20; // 20 m/s ≈ 72 km/h

export const SPEED_THRESHOLD_HIGH = 40; // km/h
export const SPEED_THRESHOLD_LOW = 20;  // km/h

// ============================================================================
// ETA COLOR THRESHOLDS (minutes)
// ============================================================================

export const ETA_IMMEDIATE = 1;
export const ETA_VERY_SOON = 5;
export const ETA_SOON = 10;
export const ETA_MEDIUM = 15;

// ============================================================================
// TIME CONSTANTS FOR UPCOMING ARRIVALS
// ============================================================================

export const THIRTY_MINUTES_MS = 30 * 60 * MILLISECONDS_PER_SECOND;

// ============================================================================
// GTFS ROUTE TYPE CONSTANTS
// ============================================================================

export const DEFAULT_ROUTE_TYPE = 3; // Default to bus
export const DEFAULT_VEHICLE_EMOJI = '🚌';

// ============================================================================
// VEHICLE DISPLAY MODES
// ============================================================================

export const VEHICLE_DISPLAY_MODES = {
  DOTS: 'dots',
  EMOJI: 'emoji',
  SINGLE_CHAR: 'single-char',
  ARROW: 'arrow'
};

// ============================================================================
// GTFS ROUTE_TYPE TO CHARACTER MAPPING
// ============================================================================

export const ROUTE_TYPE_TO_CHAR = {
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

// ============================================================================
// CANVAS SIZE CONSTANTS
// ============================================================================

export const EMOJI_CANVAS_SIZE = 64;
export const CHAR_CANVAS_SIZE = 64;

// ============================================================================
// MAP LAYER PAINT PROPERTIES
// ============================================================================

export const ROUTE_LINE_COLOR = '#0077cc';
export const ROUTE_LINE_WIDTH = 2;
export const ROUTE_LINE_OPACITY = 0.6;

export const STOP_CIRCLE_RADIUS = 3;
export const STOP_CIRCLE_COLOR = '#9E9E9E';
export const STOP_CIRCLE_STROKE_WIDTH = 1;
export const STOP_CIRCLE_STROKE_COLOR = '#fff';
export const STOP_CIRCLE_OPACITY = 0.7;

export const USER_LOCATION_RADIUS = 7;
export const USER_LOCATION_COLOR_LIGHT = '#0066ff';
export const USER_LOCATION_COLOR_DARK = '#4db8ff';
export const USER_LOCATION_OPACITY = 0.8;
export const USER_LOCATION_STROKE_WIDTH = 3;
export const USER_LOCATION_STROKE_COLOR_LIGHT = '#fff';
export const USER_LOCATION_STROKE_COLOR_DARK = '#1a1a1a';

export const TRAIL_LINE_WIDTH = 2;
export const TRAIL_LINE_OPACITY = 0.6;

// ============================================================================
// COLORS FOR SPEED VISUALIZATION
// ============================================================================

export const COLOR_STATIONARY = '#888888';
export const COLOR_SLOW = '#F44336';
export const COLOR_MEDIUM = '#FF9800';
export const COLOR_FAST = '#FFC107';
export const COLOR_VERY_FAST = '#4CAF50';

// ============================================================================
// ETA COLORS
// ============================================================================

export const COLOR_ETA_IMMEDIATE = '#F44336';  // Red
export const COLOR_ETA_SOON = '#FF9800';       // Orange
export const COLOR_ETA_MEDIUM = '#FFC107';     // Amber
export const COLOR_ETA_COMFORTABLE = '#4CAF50'; // Green

// ============================================================================
// ZOOM LEVELS
// ============================================================================

export const DEFAULT_ZOOM = 11;
export const USER_LOCATION_ZOOM = 14;
export const STOPS_MIN_ZOOM = 13;

// ============================================================================
// TIME INTERVALS
// ============================================================================

export const HALF_INTERVAL_MS = 500;
export const INACTIVE_VEHICLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// CLUSTERING
// ============================================================================

export const STOP_CLUSTER_RADIUS = 50;
export const STOP_CLUSTER_MAX_ZOOM = 14;

// ============================================================================
// DEBUG LOGGING
// ============================================================================

export const MAX_DEBUG_LOGS = 500;

// ============================================================================
// MAP STYLES
// ============================================================================

export const LIGHT_MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
export const DARK_MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
export const OPENFREEMAP_LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/positron';
export const OPENFREEMAP_DARK_STYLE = 'https://tiles.openfreemap.org/styles/fiord';

// ============================================================================
// WORKER REQUEST TIMEOUTS
// ============================================================================

export const WORKER_REQUEST_TIMEOUT_MS = 30000; // 30 seconds
export const FILTER_DEBOUNCE_MS = 300; // 300ms
