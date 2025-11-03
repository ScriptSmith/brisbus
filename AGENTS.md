# Brisbane Bus Routes SPA - Coding Agent Instructions

## Project Overview
This is a real-time bus tracking web application for Brisbane, Australia, built as a single-page application (SPA) using vanilla JavaScript. The app visualizes live bus positions on an interactive map using GTFS (General Transit Feed Specification) data from Translink Queensland.

## Technology Stack
- **Frontend**: Vanilla JavaScript (no frameworks), HTML5, CSS3
- **Mapping**: MapLibre GL JS v2.4.0
- **Data Processing**:
  - Node.js (built-in modules only, no external dependencies) for build-time GTFS processing
  - Web Worker (`data-worker.js`) for runtime GTFS loading and real-time data processing
- **Data Format**: GTFS static data and GTFS-RT (real-time) Protocol Buffers
- **Compression**: Brotli (for Safari/WebKit) and Gzip (for other browsers)
- **Deployment**: GitHub Pages with automated daily updates via GitHub Actions
- **Browser APIs**: DecompressionStream, Geolocation API, requestAnimationFrame, Web Workers

## Architecture

### Core Components

1. **Frontend** - Split into separate files for better organization:
   
   a. **HTML Structure (`index.html`)**
      - Minimal HTML structure with semantic markup
      - Links to external CSS and JavaScript files
      - No embedded styles or scripts
   
   b. **Main Application Logic (`js/main.js`)**
      - Creates and manages a Web Worker for data processing
      - Renders interactive map using MapLibre GL JS with bus positions, trails, routes, and stops
      - Handles user interactions (filtering, following vehicles, toggling features)
      - Displays vehicle details, stop information, and real-time statistics
      - Implements smooth animations using requestAnimationFrame
      - Communicates with worker via postMessage
   
   c. **Application Styles (`styles/styles.css`)**
      - All CSS styles for the application
      - Includes responsive design for mobile devices
      - Modern styling with animations and transitions

2. **Web Worker (`js/data-worker.js`)** - ~650 lines
   - Runs in separate thread to avoid blocking UI
   - Loads and decompresses static GTFS data (routes, shapes, stops, schedules)
   - Fetches real-time vehicle positions every 10 seconds from Translink's GTFS-RT feed via CORS proxy
   - Decodes GTFS-RT Protocol Buffers using protobuf.js
   - Implements route snapping algorithm to align GPS positions with actual route paths
   - Maintains 10-minute position history for each vehicle to build movement trails
   - Calculates vehicle statistics (speeds, counts, route information)
   - Generates GeoJSON features for vehicles, trails, routes, and stops
   - Sends processed data to main thread for rendering

3. **Build-time Data Processing Script (`process-gtfs.js`)**
   - Downloads GTFS zip file from Translink API
   - Extracts only necessary files: `shapes.txt`, `routes.txt`, `trips.txt`, `stops.txt`, `stop_times.txt`
   - Calculates SHA256 hash of downloaded zip for change detection
   - Supports `--use-cache` flag to skip recompression if data hasn't changed
   - Supports `--no-compress` flag for faster local development
   - Compresses each file with both Brotli (max quality) and Gzip (level 9)
   - Outputs compressed files to `data/` directory
   - No external dependencies - uses only Node.js built-in modules

4. **GitHub Actions Workflows**
   - `update-gtfs.yml`: Runs daily at 7am Brisbane time (9pm UTC previous day); downloads and processes GTFS data, uploads as artifact (retained for 7 days)
   - `deploy-pages.yml`: Runs daily at 7am Brisbane time and on push to main; downloads cached artifact from update-gtfs workflow if available, processes GTFS data with cache support, deploys to GitHub Pages

### Data Flow
1. GitHub Actions runs `process-gtfs.js` daily to download and compress latest GTFS data
2. Compressed GTFS files are deployed to GitHub Pages
3. Browser loads index.html, which loads styles/styles.css and js/main.js
4. Main thread (js/main.js) creates and initializes Web Worker (js/data-worker.js) with configuration
5. Worker loads and decompresses GTFS static data using browser-native DecompressionStream API
6. Worker fetches real-time vehicle positions every 10 seconds via CORS proxy
7. Worker decodes GTFS-RT Protocol Buffers and processes vehicle data
8. Worker matches vehicle positions to trips/routes, snaps to route geometry, builds trails
9. Worker sends GeoJSON and statistics to main thread via postMessage
10. Main thread updates MapLibre GL map with current bus locations, trails, and route information
11. User interactions in main thread send commands to worker (refresh, set options, toggle features)

## Key Files and Locations

### Main Application Files
- `index.html` - Minimal HTML structure (124 lines) with references to external files
- `js/main.js` - Main application logic and UI interactions (2320 lines)
- `js/data-worker.js` - Web Worker for GTFS loading and real-time data processing (runs in separate thread)
- `styles/styles.css` - All application styles (699 lines)
- `process-gtfs.js` - Build-time GTFS data download and compression script
- `manifest.json` - PWA manifest for mobile app-like experience
- `icon-*.png`, `icon.svg` - App icons for PWA

### Configuration Files
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow
- `.github/workflows/update-gtfs.yml` - GTFS data update workflow
- `.gitignore` - Excludes `data/` directory (generated files), temp files, IDE files

### Generated Files (not in git)
- `data/*.txt.br` - Brotli-compressed GTFS files
- `data/*.txt.gz` - Gzip-compressed GTFS files
- `gtfs-hash.json` - SHA256 hash metadata for change detection
- `temp_gtfs.zip` - Temporary download file (kept for artifact upload in CI)

## Coding Standards and Patterns

### JavaScript Style
- **External dependencies via CDN** - Uses MapLibre GL JS and protobuf.js (v7.2.3) loaded from CDN; no npm packages or bundler
- **Web Workers for performance** - Heavy processing (GTFS loading, real-time data parsing, trail building) runs in separate worker thread
- **No transpilation** - write modern ES6+ JavaScript that runs directly in browsers
- **No bundler** - separate files for HTML, CSS, and JavaScript without build tools
- **Separated concerns** - HTML structure in index.html, styles in styles/styles.css, logic in js/main.js, worker in js/data-worker.js
- **Constants at top** - HTTP status codes, compression settings, configuration values defined as named constants
- **Async/await** for asynchronous operations
- **Descriptive function names** - e.g., `fetchAndDecompress()`, `loadAndParseShapes()`, `buildTrailsGeoJSON()`
- **JSDoc comments** for complex functions
- **Memory efficiency** - Progressive processing, deleting temporary data structures after use

### Code Organization
- Constants defined at module/function scope with UPPER_SNAKE_CASE
- Helper functions for specific tasks (parsing, calculations, transformations)
- Event listeners grouped together
- State managed in module-scope variables (no global pollution)

### Performance Optimizations
- **Web Worker architecture** - GTFS loading and real-time data processing run in separate thread to keep UI responsive
- Browser-native `DecompressionStream` API for efficient decompression
- Brotli for Safari/WebKit (better compression ratio)
- Gzip for other browsers (better compatibility)
- Progressive CSV parsing to avoid keeping full data in memory
- Reusing objects and arrays where possible
- `requestAnimationFrame` for smooth vehicle position animations
- Caching of calculated values (e.g., nearest points on route)
- Build-time hash checking to skip recompression when data hasn't changed (via `--use-cache` flag)

### Error Handling
- Try-catch blocks for async operations
- Global error handlers for uncaught exceptions and promise rejections
- User-friendly status messages
- Debug logging system with categorized messages (info/warn/error)
- Process exits with code 1 on errors in Node.js scripts

## Feature Overview

### Real-Time Features
- **Live Bus Tracking**: Updates every 10 seconds from GTFS-RT feed
- **Vehicle Trails**: 10-minute history shown as colored lines (speed-based gradient)
- **Route Snapping**: Aligns GPS positions to route geometry within 100m threshold
- **Smooth Animations**: Uses `requestAnimationFrame` for interpolated position updates
- **Auto-refresh**: Toggle automatic updates on/off

### Interactive Features
- **Route Filtering**: Search/filter by route number
- **Follow Mode**: Track specific vehicle with auto-pan and rotation
- **Slideshow Mode**: Auto-cycle through different buses
- **Toggle Routes**: Show/hide route lines and stops
- **User Location**: Center map on user's GPS location
- **Clickable Elements**:
  - Click bus → show route details, speed, destination, upcoming stops
  - Click stop → show stop name, upcoming arrivals (next 30 minutes)

### Map Visualization
- **Vehicle Markers**: Colored circles (speed-based) with route labels
- **Trail Lines**: Color-coded by speed (gray=stationary, red=slow, orange=medium, yellow=fast, green=very fast)
- **Route Shapes**: Complete route paths overlaid on map
- **Stop Markers**: Small circles at bus stops
- **User Location**: Blue marker for user's GPS position

## Development Guidelines

### General
- Do not create explainer documents or other documentation unless specifically asked to.

### Making Changes to Frontend

**HTML Structure (`index.html`)**
- Minimal HTML with semantic markup
- Links to external CSS (styles/styles.css) and JavaScript (js/main.js)
- No embedded styles or scripts
- Changes should focus on structure and content only

**Main Application (`js/main.js`)**
- The main thread handles UI, map rendering, and user interactions
- Web Worker communication via `postMessage` for data requests and updates
- Heavy processing should be kept in the worker, not main thread
- Verify on mobile devices (responsive design is critical)
- Check console for errors and debug logs
- Test with different route filters and interaction modes

**Styles (`styles/styles.css`)**
- All CSS styles for the application
- Includes responsive breakpoints for mobile devices
- Test changes across different screen sizes
- Verify styles work in both light and dark modes (if applicable)

### Making Changes to Web Worker (`js/data-worker.js`)
- Worker runs in separate thread with no DOM access
- All GTFS loading, parsing, and trail building happens here
- Uses `self.postMessage()` to send data to main thread
- Uses `self.onmessage` to receive commands from main thread
- Test changes by checking console logs and worker messages
- Memory management is critical - clean up temporary data structures

### Making Changes to Data Processing (`process-gtfs.js`)
- Only use Node.js built-in modules (no external dependencies)
- Test compression ratios and file sizes after changes
- Verify both Brotli and Gzip outputs are created
- Test hash-based caching with `--use-cache` flag
- Check that temporary files are cleaned up appropriately
- Run locally: `node process-gtfs.js` (downloads ~100MB)
- For faster iteration: `node process-gtfs.js --no-compress` (skips compression)

### Testing
- **No automated test suite** - manual testing required
- **Local development server**: `npx http-server --cors .`
- **Test data processing**: `node process-gtfs.js` (requires ~100MB download, creates ~20-30MB compressed files)
- **Fast iteration mode**: `node process-gtfs.js --no-compress` (for development, skips compression)
- **Cache testing**: `node process-gtfs.js --use-cache` (tests hash-based change detection)
- **Playwright limitations**: When testing with Copilot agent's Playwright, note that external connections are disabled - CDN-loaded dependencies (MapLibre GL JS, protobuf.js), map tiles, and real-time vehicle data will not load. The UI shell will render but map and data features will be unavailable.

### GitHub Actions Workflows
- Workflows run automatically on schedule (daily at 7am Brisbane time = 9pm UTC previous day)
- Can be triggered manually via "workflow_dispatch"
- `update-gtfs.yml` processes data and uploads as artifact (7-day retention)
- `deploy-pages.yml` downloads cached artifact if available, uses `--use-cache` flag to skip recompression if data unchanged
- Data processing happens in CI, compressed files deployed to GitHub Pages
- No secrets required (public API)

## Important Constraints

### External Dependencies via CDN Only
- Frontend uses **CDN-loaded libraries** - MapLibre GL JS v2.4.0 and protobuf.js v7.2.3 loaded from CDN; no npm packages, webpack, or bundler
- Worker uses **CDN-loaded protobuf.js** via `importScripts()` for Protocol Buffer decoding
- Backend uses **only Node.js built-in modules** - no package.json or node_modules
- This keeps the project lightweight and deployment simple without build tools

### Data Not in Git
- The `data/` directory is gitignored
- GTFS files are generated during GitHub Pages deployment
- Keeps repository size small (only source code tracked)
- Fresh data pulled daily from Translink API

### Browser Compatibility
- **WebKit (Safari)**: Uses Brotli compression via `.br` files
- **Other browsers**: Uses Gzip compression via `.gz` files
- Detection: `const isWebKit = /WebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);`

## Common Tasks

### Adding a New Feature to the Map
1. Identify if feature should be in main thread (UI/rendering) or worker (data processing)
2. For UI features: modify `js/main.js` event handlers or update functions
3. For data features: modify `js/data-worker.js` and add worker message handlers
4. Add UI controls if needed (buttons, inputs) in `index.html`
5. Add styling for new elements in `styles/styles.css`
6. Add corresponding state variables at module scope in `js/main.js`
7. Implement worker communication via postMessage if needed
8. Update map sources/layers if needed
9. Test across browsers and devices

### Adding Worker Communication
1. In main thread (js/main.js): send message to worker via `dataWorker.postMessage({ type: 'yourAction', ...params })`
2. In worker (js/data-worker.js): handle message in `self.onmessage` handler
3. Worker processes data and sends result via `self.postMessage({ type: 'yourResult', ...data })`
4. Main thread handles result in `dataWorker.onmessage` handler
5. Update map or UI based on worker's response

### Updating GTFS Data Processing
1. Modify `process-gtfs.js` to change download/extraction/compression logic
2. Update `FILES_TO_EXTRACT` array if adding new GTFS files
3. Test locally: `node process-gtfs.js --no-compress` (fast iteration)
4. Verify compressed files in `data/` directory with full run: `node process-gtfs.js`
5. If adding new GTFS files, update worker loading in `js/data-worker.js` (add new `loadAndParse*()` function)
6. Update main thread in `js/main.js` if new data needs to be displayed

### Changing Map Styling
1. Locate MapLibre layer definitions in `js/main.js` (search for `map.addLayer`)
2. Modify `paint` or `layout` properties
3. Consult MapLibre GL JS documentation for available properties
4. Test changes visually on the map

### Debugging Issues
1. Open browser DevTools console
2. Click "Debug" button in app UI to open debug pane (shows main thread logs)
3. Check "Stats" button for real-time vehicle statistics
4. Review categorized logs (info/warn/error)
5. Check network requests for GTFS data loading (verify js/main.js, js/data-worker.js, styles/styles.css load correctly)
6. Verify GTFS-RT feed is accessible (CORS proxy might fail)
7. For worker issues: add `console.log()` in `js/data-worker.js` (logs appear in main console)
8. Check worker messages in network/application tab of DevTools

## GTFS Data Reference

### Files Used
- **shapes.txt**: Route path geometries (lat/lon sequences)
- **routes.txt**: Route metadata (route_id, route_short_name, etc.)
- **trips.txt**: Trip instances linking routes to shapes
- **stops.txt**: Stop locations and metadata
- **stop_times.txt**: Schedule data (arrival/departure times per trip/stop)

### Key Relationships
- `trip_id` links to both `shape_id` (in trips.txt) and `route_id`
- `shape_id` maps to coordinates in shapes.txt
- `stop_id` links stops.txt to stop_times.txt
- Real-time vehicle positions include `trip_id` to match with static data

## API Endpoints

### GTFS Static Data
- Source: `https://gtfsrt.api.translink.com.au/GTFS/SEQ_GTFS.zip`
- Processed and served from: `/brisbus/data/` (GitHub Pages) or `/data/` (local)
- Format: Compressed (.br or .gz) CSV files

### GTFS Real-Time Feed
- Source: `https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions`
- Accessed via CORS proxy: `https://api.codetabs.com/v1/proxy?quest=...`
- Format: Protocol Buffers (gtfs-realtime.proto)
- Update frequency: Every 10 seconds in the app

## Performance Considerations

### Memory Management
- **Worker-based processing** - Heavy data processing isolated in worker thread to prevent UI blocking
- CSV files parsed line-by-line to avoid loading entire file into memory
- Temporary data structures deleted after processing (e.g., `delete tmp[sid]`)
- Vehicle history pruned to 10-minute window
- Shape coordinates stored as arrays (considered typed arrays for future optimization)
- Worker maintains GTFS data in memory for fast lookups during real-time updates

### Network Optimization
- GTFS files served with high compression (Brotli ~30-40% of original, Gzip ~40-50%)
- Browser-native decompression in worker thread (no JavaScript decompression overhead)
- Only necessary GTFS files extracted (not entire dataset)
- Real-time GTFS-RT feed fetched by worker every 10 seconds (not on page load)
- Hash-based change detection prevents unnecessary recompression during CI builds

### Rendering Performance
- Main thread focused on rendering while worker handles data processing
- Smooth animations using `requestAnimationFrame`
- Map layers use GeoJSON for efficient rendering
- Circle/line layers hardware-accelerated via MapLibre GL
- Filters applied to reduce number of rendered features
- Worker sends pre-computed GeoJSON to minimize main thread work

## Deployment

### GitHub Pages Setup
- Source: `_site/` directory created by deploy workflow
- Contains: `index.html`, `js/` directory, `styles/` directory, `manifest.json`, icons, and `data/` directory
- Base URL: `/brisbus/` (for GitHub Pages) or `/` (for local dev)
- Auto-detected in code: `window.location.pathname.includes('/brisbus/')`

### Manual Deployment Steps
1. GitHub Actions automatically runs on push to main or daily schedule
2. `update-gtfs.yml` workflow downloads GTFS data via `node process-gtfs.js` and uploads as artifact
3. `deploy-pages.yml` workflow downloads cached artifact (if available within 7 days)
4. `deploy-pages.yml` runs `node process-gtfs.js --use-cache` to use cached data if unchanged
5. Workflow copies files to `_site/` directory (index.html, js/, styles/, manifest.json, icons, data/)
6. Workflow deploys `_site/` to GitHub Pages

### Local Development
1. Clone repository
2. Run `node process-gtfs.js` to generate data files (or `node process-gtfs.js --no-compress` for faster iteration)
3. Start local server: `npx http-server --cors .`
4. Open `http://localhost:8080` in browser
5. Browser loads index.html, which loads js/main.js and styles/styles.css
6. Main thread creates worker from js/data-worker.js
7. GTFS data will load from local `data/` directory (or can fetch from deployed site if not present)

## Troubleshooting

### Common Issues
- **CORS errors**: GTFS-RT proxy might be down - check console for network errors from worker
- **No vehicles showing**: Real-time feed might be unavailable or no buses running (check worker error messages)
- **Map not loading**: Check MapLibre GL JS CDN is accessible
- **Styles not loading**: Verify styles/styles.css loads correctly (check network tab)
- **JavaScript errors**: Verify js/main.js and js/data-worker.js load correctly (check network tab)
- **Data files not loading**: Verify GitHub Pages deployment succeeded and data files exist (check worker console logs)
- **Worker not starting**: Check browser console for js/data-worker.js loading errors
- **Compression errors**: Check browser supports DecompressionStream API (modern browsers only)

### Browser-Specific Issues
- **Safari**: Should use Brotli (.br) files - check network tab
- **Chrome/Firefox**: Should use Gzip (.gz) files - check network tab
- **Mobile Safari**: Test geolocation permissions for user location feature
- **Older browsers**: May not support DecompressionStream - requires modern browser

## Future Considerations

When adding features or making changes, consider:
- **Mobile Performance**: Test on actual devices, not just DevTools mobile emulation
- **Worker Communication Overhead**: Minimize postMessage frequency for large data transfers
- **Data Size**: GTFS files are large - keep compression optimal
- **Real-time Updates**: Don't increase polling frequency (respect API limits)
- **Accessibility**: Ensure interactive elements are keyboard and screen-reader accessible
- **Progressive Enhancement**: Features should degrade gracefully if APIs unavailable
- **Battery Life**: Be mindful of animation and polling impact on mobile devices (worker helps by offloading processing)
- **Shared Worker**: Consider using SharedWorker if multiple tabs need to share GTFS data (not currently implemented)
