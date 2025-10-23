# Brisbane Bus Routes SPA

A single-page application for tracking Brisbane buses in real-time using GTFS (General Transit Feed Specification) data from Translink.

## Features

### Real-Time Bus Tracking
The application displays live positions of Brisbane buses on an interactive map, updating every 10 seconds with the latest data from Translink's GTFS real-time feed.

### Interactive Map Interface
- **Route Visualization**: View complete bus routes overlaid on the map
- **Bus Stop Markers**: See all stops along selected routes with upcoming arrival times (next 30 minutes)
- **Vehicle Details**: Click any bus to see its route number, destination, speed, and estimated arrival times
- **Route Filtering**: Search and filter by specific route numbers to focus on relevant buses
- **User Location**: Quickly center the map on your current location

### Historical Trails
The app maintains a 10-minute history of bus positions and displays movement trails on the map. Trails can be snapped to route geometry for accuracy, or shown as raw GPS paths.

### Advanced Features
- **Slideshow Mode**: Automatically cycles through different buses on the map
- **Follow Mode**: Track a specific vehicle as it moves, with automatic map panning and rotation
- **Route Snapping**: Aligns GPS positions to actual route paths within 100 meters for cleaner visualization
- **Performance Optimizations**: Uses compressed GTFS data (Brotli for Safari, Gzip for other browsers) and efficient browser-native decompression for fast loading

### Data Management
- **Automatic Updates**: GTFS static data (routes, stops, shapes, schedules) is automatically refreshed weekly via GitHub Actions
- **Efficient Storage**: All transit data is compressed and served in optimized formats to minimize bandwidth usage

## How It Works

### Architecture

The application consists of three main components:

1. **Frontend**: A vanilla JavaScript single-page application with separated concerns:
   - **index.html** - Minimal HTML structure (124 lines)
   - **js/main.js** - Main application logic and UI interactions
   - **js/data-worker.js** - Web Worker for GTFS loading and real-time data processing
   - **styles/styles.css** - All application styles
   
   The main thread:
   - Renders an interactive map using MapLibre GL JS
   - Handles user interactions and UI updates
   - Communicates with the Web Worker for data processing
   
   The Web Worker:
   - Loads and decompresses static GTFS data (routes, shapes, stops, schedules)
   - Fetches real-time vehicle positions from Translink's GTFS-RT feed via a CORS proxy
   - Matches real-time positions with route geometries for accurate visualization
   - Maintains a position history for each vehicle to show movement trails
   - Sends processed data to main thread for rendering

2. **Data Processing (process-gtfs.js)**: A Node.js script that:
   - Downloads the complete GTFS dataset from Translink
   - Extracts only the necessary files (shapes.txt, routes.txt, trips.txt, stops.txt, stop_times.txt)
   - Compresses each file with both Brotli and Gzip algorithms
   - Saves optimized data files for distribution

3. **Automated Updates (GitHub Actions)**: A daily workflow that runs the data processing script to keep transit information current

### Data Flow

1. Browser loads index.html, which loads external CSS (styles/styles.css) and JavaScript (js/main.js)
2. Main thread creates a Web Worker (js/data-worker.js) for data processing
3. Worker loads and decompresses static GTFS data (compressed)
4. Worker fetches real-time vehicle positions every 10 seconds
5. Worker matches vehicle positions to trips and routes using GTFS data
6. Worker sends processed GeoJSON and statistics to main thread
7. Main thread updates map with current bus locations, trails, and route information
8. User interactions (filtering, following vehicles) update the display in real-time

## Development

Run a local server with CORS enabled:

```bash
npx http-server --cors .
```

## GTFS Data Processing

The GTFS data (shapes, routes, trips, stops, and stop_times) is automatically downloaded and processed daily by GitHub Actions. The data files are built as part of the GitHub Pages deployment and are not committed to the repository to keep it lightweight.

To manually update the GTFS data locally:

```bash
node process-gtfs.js
```

This script:
1. Downloads the latest GTFS data from Translink
2. Extracts only the necessary files (shapes.txt, routes.txt, trips.txt, stops.txt, stop_times.txt)
3. Compresses them with both Brotli and Gzip
4. Saves the compressed files to the `data/` directory

The app uses brotli-compressed files for WebKit browsers (Safari) and gzip-compressed files for other browsers via the native DecompressionStream API for efficient loading.

### Development Mode (Skip Compression)

During local development, you can skip the compression step to speed up data processing:

```bash
node process-gtfs.js --no-compress
```

This will download and extract the GTFS files without compressing them. The browser will automatically fall back to using the uncompressed `.txt` files if compressed versions are not available.

**Note:** Data files are not tracked in git. They are generated during the GitHub Pages deployment process and served directly from the deployed site.

