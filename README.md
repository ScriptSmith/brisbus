# Brisbane bus routes SPA

Vibe-coded SPA showing Brisbane bus locations and routes using GTFS real-time data from Translink.

## Features

- Live bus tracking on an interactive map
- Route visualization
- Bus stop markers with upcoming arrivals (next 30 minutes)
- Interactive popups showing estimated time of arrival (ETA) for each vehicle
- Compressed GTFS data for faster loading (brotli for WebKit, gzip for other browsers)
- Automatic weekly data updates via GitHub Actions

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

