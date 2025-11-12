/**
 * worker-client.js - Web Worker Communication Client
 * 
 * Dedicated API client for interacting with the data worker.
 * Handles worker initialization, message passing, and request/response tracking.
 */

import * as state from './state.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const WORKER_REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout for worker requests

// ============================================================================
// REQUEST TRACKING
// ============================================================================

let nextRequestId = 1;
const pendingRequests = new Map(); // requestId → { resolve, timeoutId }

// ============================================================================
// WORKER INITIALIZATION
// ============================================================================

/**
 * Initialize and start the data worker
 * @param {Object} config - Configuration object with PROXY_FEED_URL, PROTO_URL, etc.
 * @param {Function} onMessage - Callback function to handle worker messages
 */
export function initializeWorker(config, onMessage) {
  const worker = new Worker('js/data-worker.js');
  
  worker.onmessage = (ev) => {
    const m = ev.data || {};
    
    // Handle request-response messages
    if (m.requestId && pendingRequests.has(m.requestId)) {
      const { resolve, timeoutId } = pendingRequests.get(m.requestId);
      clearTimeout(timeoutId);
      pendingRequests.delete(m.requestId);
      
      // Resolve with appropriate data based on message type
      if (m.type === 'routeShapes') {
        resolve(m.geojson);
      } else if (m.type === 'stops') {
        resolve(m.geojson);
      } else if (m.type === 'stopArrivals') {
        resolve(m.arrivals);
      } else if (m.type === 'tripStopTimes') {
        resolve(m.stopTimes);
      } else if (m.type === 'upcomingStops') {
        resolve(m.stops);
      } else if (m.type === 'routeType') {
        resolve(m.routeType);
      }
    }
    
    // Pass message to callback for other handling
    if (onMessage) {
      onMessage(m);
    }
  };
  
  // Send initialization configuration
  worker.postMessage({ 
    type: 'init', 
    config 
  });
  
  state.setDataWorker(worker);
  return worker;
}

// ============================================================================
// WORKER COMMUNICATION
// ============================================================================

/**
 * Request data from worker with promise and timeout
 * @param {string} type - Request type
 * @param {Object} params - Request parameters
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise} Promise that resolves with worker response
 */
export function requestFromWorker(type, params = {}, timeoutMs = WORKER_REQUEST_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const worker = state.getDataWorker();
    if (!worker) {
      reject(new Error('Worker not initialized'));
      return;
    }
    
    const requestId = nextRequestId++;
    
    // Set up timeout to prevent indefinite waiting
    const timeoutId = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error(`Worker request '${type}' timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);
    
    // Store both resolve and timeout ID so we can clear timeout on success
    pendingRequests.set(requestId, { resolve, timeoutId });
    
    worker.postMessage({ type, ...params, requestId });
  });
}

/**
 * Send a message to the worker without expecting a response
 * @param {Object} message - Message object to send
 */
export function postToWorker(message) {
  const worker = state.getDataWorker();
  if (worker) {
    worker.postMessage(message);
  }
}

/**
 * Terminate the worker
 */
export function terminateWorker() {
  const worker = state.getDataWorker();
  if (worker) {
    worker.terminate();
    state.setDataWorker(null);
    state.setWorkerReady(false);
  }
}
