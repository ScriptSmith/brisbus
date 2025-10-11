# Brisbane bus routes SPA

Vibe-coded SPA showing Brisbane bus locations and routes using GTFS real-time data from Translink.

## Features

- Live bus tracking on an interactive map
- Route visualization
- Compressed GTFS data for faster loading (gzip compressed, ~10MB vs 30MB zip)
- Automatic weekly data updates via GitHub Actions

## Development

Run a local server with CORS enabled:

```bash
npx http-server --cors .
```

## GTFS Data Processing

The GTFS data (shapes, routes, and trips) is automatically downloaded and processed weekly by GitHub Actions.

To manually update the GTFS data:

```bash
node process-gtfs.js
```

This script:
1. Downloads the latest GTFS data from Translink
2. Extracts only the necessary files (shapes.txt, routes.txt, trips.txt)
3. Compresses them with both Brotli and Gzip
4. Saves the compressed files to the `data/` directory

The app uses gzip-compressed files via the browser's native DecompressionStream API for efficient loading.

