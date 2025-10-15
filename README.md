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

1. **Frontend (index.html)**: A vanilla JavaScript single-page application that:
   - Fetches real-time vehicle positions from Translink's GTFS-RT feed via a CORS proxy
   - Loads and decompresses static GTFS data (routes, shapes, stops, schedules)
   - Renders an interactive map using MapLibre GL JS
   - Matches real-time positions with route geometries for accurate visualization
   - Maintains a position history for each vehicle to show movement trails

2. **Data Processing (process-gtfs.js)**: A Node.js script that:
   - Downloads the complete GTFS dataset from Translink
   - Extracts only the necessary files (shapes.txt, routes.txt, trips.txt, stops.txt, stop_times.txt)
   - Compresses each file with both Brotli and Gzip algorithms
   - Saves optimized data files for distribution

3. **Automated Updates (GitHub Actions)**: A weekly workflow that runs the data processing script to keep transit information current

### Data Flow

1. Browser loads the application and static GTFS data (compressed)
2. Application fetches real-time vehicle positions every 10 seconds
3. Vehicle positions are matched to trips and routes using GTFS data
4. Map is updated with current bus locations, trails, and route information
5. User interactions (filtering, following vehicles) update the display in real-time

## Development

Run a local server with CORS enabled:

```bash
npx http-server --cors .
```

## GTFS Data Processing

The GTFS data (shapes, routes, trips, stops, and stop_times) is automatically downloaded and processed weekly by GitHub Actions.

To manually update the GTFS data:

```bash
node process-gtfs.js
```

This script:
1. Downloads the latest GTFS data from Translink
2. Extracts only the necessary files (shapes.txt, routes.txt, trips.txt, stops.txt, stop_times.txt)
3. Compresses them with both Brotli and Gzip
4. Saves the compressed files to the `data/` directory

The app uses brotli-compressed files for WebKit browsers (Safari) and gzip-compressed files for other browsers via the native DecompressionStream API for efficient loading.

