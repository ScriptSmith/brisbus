/**
 * ui.js - UI Management and DOM Interactions
 * 
 * Manages all DOM element references, event listeners, and UI updates.
 */

import * as state from './state.js';
import { MAX_DEBUG_LOGS } from './constants.js';

// ============================================================================
// DOM ELEMENT REFERENCES
// ============================================================================

// Debug logging system
const debugLogs = [];
export const statusBarEl = document.getElementById('statusBar');
export const debugToggleEl = document.getElementById('debugToggle');
export const debugPaneEl = document.getElementById('debugPane');
export const debugContentEl = document.getElementById('debugContent');
export const clearLogsBtnEl = document.getElementById('clearLogsBtn');
export const closeDebugBtnEl = document.getElementById('closeDebugBtn');

// Stats system
export const statsToggleEl = document.getElementById('statsToggle');
export const statsBoxEl = document.getElementById('statsBox');
export const statTotalVehiclesEl = document.getElementById('statTotalVehicles');
export const statUniqueRoutesEl = document.getElementById('statUniqueRoutes');
export const statAvgSpeedEl = document.getElementById('statAvgSpeed');
export const statFastestVehicleEl = document.getElementById('statFastestVehicle');
export const statSlowestVehicleEl = document.getElementById('statSlowestVehicle');
export const statStationaryVehiclesEl = document.getElementById('statStationaryVehicles');
export const statInboundVehiclesEl = document.getElementById('statInboundVehicles');
export const statOutboundVehiclesEl = document.getElementById('statOutboundVehicles');
export const statBusiestRouteEl = document.getElementById('statBusiestRoute');
export const statTotalStopsEl = document.getElementById('statTotalStops');

// Main UI elements
export const lastUpdateEl = document.getElementById('lastUpdate');
export const menuLastUpdate = document.getElementById('menuLastUpdate');
export const currentTimeEl = document.getElementById('currentTime');
export const menuCurrentTime = document.getElementById('menuCurrentTime');
export const refreshBtn = document.getElementById('refreshBtn');
export const autoRefreshBtn = document.getElementById('autoRefreshBtn');
export const routeFilterEl = document.getElementById('routeFilter');
export const filterInput = document.getElementById('filterInput');
export const routeListEl = document.getElementById('routeList');
export const filterRouteListEl = document.getElementById('filterRouteList');
export const clearBtn = document.getElementById('clearBtn');
export const filterClearBtn = document.getElementById('filterClearBtn');
export const locateBtn = document.getElementById('locateBtn');
export const toggleVehiclesBtn = document.getElementById('toggleVehiclesBtn');
export const toggleRoutesBtn = document.getElementById('toggleRoutesBtn');
export const toggleTrailsBtn = document.getElementById('toggleTrailsBtn');
export const toggleStopsBtn = document.getElementById('toggleStopsBtn');
export const toggle3DBuildingsBtn = document.getElementById('toggle3DBuildingsBtn');
export const basemapLegend = document.getElementById('basemapLegend');
export const snapToRouteBtn = document.getElementById('snapToRouteBtn');
export const slideshowBtn = document.getElementById('slideshowBtn');
export const followIndicator = document.getElementById('followIndicator');
export const followIndicatorText = document.getElementById('followIndicatorText');
export const followIndicatorClose = document.getElementById('followIndicatorClose');
export const slideshowControls = document.getElementById('slideshowControls');
export const slideshowNextBtn = document.getElementById('slideshowNextBtn');
export const slideshowIntervalInput = document.getElementById('slideshowInterval');

// Vehicle display mode buttons
export const displayModeDotsBtn = document.getElementById('displayModeDotsBtn');
export const displayModeEmojiBtn = document.getElementById('displayModeEmojiBtn');
export const displayModeCharBtn = document.getElementById('displayModeCharBtn');
export const displayModeArrowBtn = document.getElementById('displayModeArrowBtn');

// Direction filter buttons
export const directionAllBtn = document.getElementById('directionAllBtn');
export const directionInboundBtn = document.getElementById('directionInboundBtn');
export const directionOutboundBtn = document.getElementById('directionOutboundBtn');

// Vehicle type filter buttons
export const vehicleTypeBusBtn = document.getElementById('vehicleTypeBusBtn');
export const vehicleTypeRailBtn = document.getElementById('vehicleTypeRailBtn');
export const vehicleTypeFerryBtn = document.getElementById('vehicleTypeFerryBtn');
export const vehicleTypeTramBtn = document.getElementById('vehicleTypeTramBtn');

// Theme mode buttons
export const themeLightBtn = document.getElementById('themeLightBtn');
export const themeDarkBtn = document.getElementById('themeDarkBtn');
export const themeAutoBtn = document.getElementById('themeAutoBtn');

// Settings panel
export const settingsBtn = document.getElementById('settingsBtn');
export const mainUI = document.getElementById('mainUI');
export const settingsPanel = document.getElementById('settingsPanel');
export const settingsClose = document.getElementById('settingsClose');

// Mobile navigation buttons
export const menuBtn = document.getElementById('menuBtn');
export const filterBtn = document.getElementById('filterBtn');
export const refreshMobileBtn = document.getElementById('refreshMobileBtn');
export const locateMobileBtn = document.getElementById('locateMobileBtn');
export const settingsMobileBtn = document.getElementById('settingsMobileBtn');

// Vehicle card
export const vehicleCard = document.getElementById('vehicleCard');
export const cardTitle = document.getElementById('cardTitle');
export const cardContent = document.getElementById('cardContent');
export const cardMinimize = document.getElementById('cardMinimize');
export const cardClose = document.getElementById('cardClose');
export const cardHeader = document.querySelector('.vehicle-card-header');

// Filter panel (mobile)
export const filterPanel = document.getElementById('filterPanel');
export const filterClose = document.getElementById('filterClose');

// Menu panel (mobile)
export const menuPanel = document.getElementById('menuPanel');
export const menuClose = document.getElementById('menuClose');

// ============================================================================
// UI STATE AND UTILITIES
// ============================================================================

let flashTimeout = null;

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// STATUS AND DEBUG LOGGING
// ============================================================================

export function updateStatus(message) {
  if (statusBarEl) {
    statusBarEl.textContent = message;
  }
  logDebug(message, 'info');
}

export function logDebug(message, level = 'info') {
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
  
  // Flash debug toggle button red for 5 seconds when error occurs
  if (level === 'error') {
    flashDebugToggle();
  }
}

function flashDebugToggle() {
  // Clear any existing timeout to restart the 5-second duration
  if (flashTimeout) {
    clearTimeout(flashTimeout);
  }
  
  // Add flash animation class
  debugToggleEl.classList.add('error-flash');
  
  // Remove the class after 5 seconds
  flashTimeout = setTimeout(() => {
    debugToggleEl.classList.remove('error-flash');
    flashTimeout = null;
  }, 5000);
}

export function hideStatusBar() {
  if (statusBarEl) {
    statusBarEl.classList.add('hidden');
  }
}

export function clearDebugLogs() {
  debugLogs.length = 0;
  debugContentEl.innerHTML = '';
}

export function getDebugLogs() {
  return debugLogs;
}

// ============================================================================
// UI LOCK/UNLOCK
// ============================================================================

export function lockUI(interactiveElements) {
  // Disable all interactive UI elements during initialization
  interactiveElements.forEach(el => { if (el) el.disabled = true; });
}

export function unlockUI(interactiveElements) {
  // Enable all interactive UI elements after initialization
  interactiveElements.forEach(el => { if (el) el.disabled = false; });
}

// ============================================================================
// STATS DISPLAY
// ============================================================================

export function applyStats(s, gtfsStats) {
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
    // Direction stats
    statInboundVehiclesEl.textContent = s.inbound ?? '0';
    statOutboundVehiclesEl.textContent = s.outbound ?? '0';
  } catch (err) {
    console.error('Error applying stats:', err);
  }
}
