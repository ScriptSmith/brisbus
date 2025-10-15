# Brisbane Bus Routes SPA - Copilot Instructions

## Project Overview
This is a real-time bus tracking web application for Brisbane, Australia, built as a single-page application (SPA) using vanilla JavaScript. The app visualizes live bus positions on an interactive map using GTFS (General Transit Feed Specification) data from Translink Queensland.

## Technology Stack
- **Frontend**: Vanilla JavaScript (no frameworks), HTML5, CSS3
- **Mapping**: MapLibre GL JS v2.4.0
- **Data Processing**: Node.js (built-in modules only, no external dependencies)
- **Data Format**: GTFS static data and GTFS-RT (real-time) Protocol Buffers
- **Compression**: Brotli (for Safari/WebKit) and Gzip (for other browsers)
- **Deployment**: GitHub Pages with automated daily updates via GitHub Actions
- **Browser APIs**: DecompressionStream, Geolocation API, requestAnimationFrame

## Architecture

### Core Components

1. **Frontend (`index.html`)** - ~2650 lines
   - Self-contained SPA with embedded CSS and JavaScript
   - Fetches real-time vehicle positions every 10 seconds from Translink's GTFS-RT feed via CORS proxy
   - Loads and decompresses static GTFS data (routes, shapes, stops, schedules)
   - Renders interactive map with bus positions, trails, routes, and stops
   - Implements route snapping algorithm to align GPS positions with actual route paths
   - Maintains 10-minute position history for each vehicle to display movement trails

2. **Data Processing Script (`process-gtfs.js`)** - ~213 lines
   - Downloads GTFS zip file from Translink API
   - Extracts only necessary files: `shapes.txt`, `routes.txt`, `trips.txt`, `stops.txt`, `stop_times.txt`
   - Compresses each file with both Brotli (max quality) and Gzip (level 9)
   - Outputs compressed files to `data/` directory
   - No external dependencies - uses only Node.js built-in modules

3. **GitHub Actions Workflows**
   - `deploy-pages.yml`: Runs daily at 7am Brisbane time and on push to main; processes GTFS data and deploys to GitHub Pages
   - `update-gtfs.yml`: Runs daily at 7am Brisbane time; updates GTFS data and uploads as artifact

### Data Flow
1. GitHub Actions runs `process-gtfs.js` daily to download and compress latest GTFS data
2. Compressed GTFS files are deployed to GitHub Pages
3. Browser loads the application
4. Application fetches and decompresses GTFS static data (browser-native DecompressionStream API)
5. Application fetches real-time vehicle positions every 10 seconds via CORS proxy
6. Vehicle positions are matched to trips/routes using GTFS data
7. Map updates with current bus locations, trails, and route information

## Key Files and Locations

### Main Application Files
- `index.html` - Complete SPA (HTML, CSS, JavaScript all embedded)
- `process-gtfs.js` - GTFS data download and compression script
- `manifest.json` - PWA manifest for mobile app-like experience
- `icon-*.png`, `icon.svg` - App icons for PWA

### Configuration Files
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow
- `.github/workflows/update-gtfs.yml` - GTFS data update workflow
- `.gitignore` - Excludes `data/` directory (generated files), temp files, IDE files

### Generated Files (not in git)
- `data/*.txt.br` - Brotli-compressed GTFS files
- `data/*.txt.gz` - Gzip-compressed GTFS files
- `temp_gtfs.zip` - Temporary download file (cleaned up after processing)

## Coding Standards and Patterns

### JavaScript Style
- **External dependencies via CDN** - Uses MapLibre GL JS and protobuf.js loaded from CDN; no npm packages or bundler
- **No transpilation** - write modern ES6+ JavaScript that runs directly in browsers
- **No bundler** - single HTML file with embedded JavaScript
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
- Browser-native `DecompressionStream` API for efficient decompression
- Brotli for Safari/WebKit (better compression ratio)
- Gzip for other browsers (better compatibility)
- Progressive CSV parsing to avoid keeping full data in memory
- Reusing objects and arrays where possible
- `requestAnimationFrame` for smooth vehicle position animations
- Caching of calculated values (e.g., nearest points on route)

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

### Making Changes to Frontend (`index.html`)
- The entire application is in one file - be careful with large-scale refactoring
- Verify on mobile devices (responsive design is critical)
- Check console for errors and debug logs
- Test with different route filters and interaction modes

### Making Changes to Data Processing (`process-gtfs.js`)
- Only use Node.js built-in modules (no external dependencies)
- Test compression ratios and file sizes after changes
- Verify both Brotli and Gzip outputs are created
- Check that temporary files are cleaned up
- Run locally: `node process-gtfs.js`

### Testing
- **No automated test suite** - manual testing required
- **Local development server**: `npx http-server --cors .`
- **Test data processing**: `node process-gtfs.js` (requires ~100MB download)
- **Playwright limitations**: When testing with Copilot agent's Playwright, note that external connections are disabled - CDN-loaded dependencies (MapLibre GL JS, protobuf.js), map tiles, and real-time vehicle data will not load. The UI shell will render but map and data features will be unavailable.

### GitHub Actions Workflows
- Workflows run automatically on schedule (daily at 7am Brisbane time)
- Can be triggered manually via "workflow_dispatch"
- Data processing happens in CI, compressed files deployed to GitHub Pages
- No secrets required (public API)

## Important Constraints

### External Dependencies via CDN Only
- Frontend uses **CDN-loaded libraries** - MapLibre GL JS and protobuf.js loaded from CDN; no npm packages, webpack, or bundler
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
1. Identify where in `index.html` to add the feature (likely in event handlers or update functions)
2. Add UI controls if needed (buttons, inputs) in HTML section
3. Add corresponding state variables at module scope
4. Implement feature logic in JavaScript section
5. Update map sources/layers if needed
6. Test across browsers and devices

### Updating GTFS Data Processing
1. Modify `process-gtfs.js` to change download/extraction/compression logic
2. Update `FILES_TO_EXTRACT` array if adding new GTFS files
3. Test locally: `node process-gtfs.js`
4. Verify compressed files in `data/` directory
5. Update frontend in `index.html` if new data files need to be loaded

### Changing Map Styling
1. Locate MapLibre layer definitions in `index.html` (search for `map.addLayer`)
2. Modify `paint` or `layout` properties
3. Consult MapLibre GL JS documentation for available properties
4. Test changes visually on the map

### Debugging Issues
1. Open browser DevTools console
2. Click "Debug" button in app UI to open debug pane
3. Review categorized logs (info/warn/error)
4. Check network requests for GTFS data loading
5. Verify GTFS-RT feed is accessible (CORS proxy might fail)

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
- CSV files parsed line-by-line to avoid loading entire file into memory
- Temporary data structures deleted after processing (e.g., `delete tmp[sid]`)
- Vehicle history pruned to 10-minute window
- Shape coordinates stored as typed arrays where possible

### Network Optimization
- GTFS files served with high compression (Brotli ~30-40% of original, Gzip ~40-50%)
- Browser-native decompression (no JavaScript decompression overhead)
- Only necessary GTFS files extracted (not entire dataset)
- Real-time data fetched only when needed (not on page load)

### Rendering Performance
- Smooth animations using `requestAnimationFrame`
- Map layers use GeoJSON for efficient rendering
- Circle/line layers hardware-accelerated via MapLibre GL
- Filters applied to reduce number of rendered features

## Deployment

### GitHub Pages Setup
- Source: `_site/` directory created by deploy workflow
- Contains: `index.html`, `manifest.json`, icons, and `data/` directory
- Base URL: `/brisbus/` (for GitHub Pages) or `/` (for local dev)
- Auto-detected in code: `window.location.pathname.includes('/brisbus/')`

### Manual Deployment Steps
1. GitHub Actions automatically runs on push to main or daily schedule
2. Workflow downloads GTFS data via `node process-gtfs.js`
3. Workflow copies files to `_site/` directory
4. Workflow deploys `_site/` to GitHub Pages

### Local Development
1. Clone repository
2. Run `node process-gtfs.js` to generate data files (optional - can use deployed data)
3. Start local server: `npx http-server --cors .`
4. Open `http://localhost:8080` in browser

## Troubleshooting

### Common Issues
- **CORS errors**: GTFS-RT proxy might be down - check console for network errors
- **No vehicles showing**: Real-time feed might be unavailable or no buses running
- **Map not loading**: Check MapLibre GL JS CDN is accessible
- **Data files not loading**: Verify GitHub Pages deployment succeeded and data files exist
- **Compression errors**: Check browser supports DecompressionStream API (modern browsers only)

### Browser-Specific Issues
- **Safari**: Should use Brotli (.br) files - check network tab
- **Chrome/Firefox**: Should use Gzip (.gz) files - check network tab
- **Mobile Safari**: Test geolocation permissions for user location feature
- **Older browsers**: May not support DecompressionStream - requires modern browser

## Future Considerations

When adding features or making changes, consider:
- **Mobile Performance**: Test on actual devices, not just DevTools mobile emulation
- **Data Size**: GTFS files are large - keep compression optimal
- **Real-time Updates**: Don't increase polling frequency (respect API limits)
- **Accessibility**: Ensure interactive elements are keyboard and screen-reader accessible
- **Progressive Enhancement**: Features should degrade gracefully if APIs unavailable
- **Battery Life**: Be mindful of animation and polling impact on mobile devices
