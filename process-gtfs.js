#!/usr/bin/env node

/**
 * Downloads and processes GTFS data from Translink
 * Extracts only necessary files (shapes.txt, routes.txt, trips.txt)
 * and compresses them with both Brotli and Gzip
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { promisify } = require('util');
const { pipeline } = require('stream');

const pipelineAsync = promisify(pipeline);

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  MOVED_PERMANENTLY: 301,
  FOUND: 302
};

// Compression settings
const GZIP_MAX_LEVEL = 9;

// Number parsing
const DECIMAL_RADIX = 10;

const GTFS_URL = 'https://gtfsrt.api.translink.com.au/GTFS/SEQ_GTFS.zip';
const OUTPUT_DIR = path.join(__dirname, 'data');
const TEMP_ZIP = path.join(__dirname, 'temp_gtfs.zip');
const HASH_FILE = path.join(__dirname, 'gtfs-hash.json');
const FILES_TO_EXTRACT = ['shapes.txt', 'routes.txt', 'trips.txt', 'stops.txt', 'stop_times.txt'];

/**
 * Download a file from a URL
 */
async function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destination);
    
    console.log(`Downloading ${url}...`);
    
    protocol.get(url, (response) => {
      if (response.statusCode === HTTP_STATUS.FOUND || response.statusCode === HTTP_STATUS.MOVED_PERMANENTLY) {
        // Handle redirect
        file.close();
        fs.unlinkSync(destination);
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== HTTP_STATUS.OK) {
        file.close();
        fs.unlinkSync(destination);
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }
      
      const totalBytes = parseInt(response.headers['content-length'], DECIMAL_RADIX);
      let downloadedBytes = 0;
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
        process.stdout.write(`\rDownloading: ${percent}%`);
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\nDownload complete!');
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destination);
      reject(err);
    });
  });
}

/**
 * Calculate SHA256 hash of a file
 */
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
}

/**
 * Save hash metadata to file
 */
function saveHashMetadata(hash) {
  const metadata = {
    hash,
    timestamp: new Date().toISOString(),
    url: GTFS_URL
  };
  fs.writeFileSync(HASH_FILE, JSON.stringify(metadata, null, 2));
  console.log(`Saved hash metadata: ${hash}`);
}

/**
 * Load hash metadata from file
 */
function loadHashMetadata() {
  try {
    if (fs.existsSync(HASH_FILE)) {
      const content = fs.readFileSync(HASH_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Could not load hash metadata:', error.message);
  }
  return null;
}

/**
 * Extract specific files from a zip archive
 * Uses unzip command for simplicity
 */
async function extractFiles(zipPath, files, outputDir) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  console.log('Extracting files from zip...');
  
  for (const file of files) {
    try {
      await execAsync(`unzip -o -j "${zipPath}" "${file}" -d "${outputDir}"`);
      console.log(`Extracted ${file}`);
    } catch (error) {
      console.error(`Failed to extract ${file}:`, error.message);
      throw error;
    }
  }
}

/**
 * Compress a file with both Brotli and Gzip
 */
async function compressFile(inputPath, outputBasePath, silent = false) {
  if (!silent) {
    console.log(`Compressing ${path.basename(inputPath)}...`);
  }
  
  // Brotli compression
  const brotliPath = `${outputBasePath}.br`;
  await pipelineAsync(
    fs.createReadStream(inputPath),
    zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
      }
    }),
    fs.createWriteStream(brotliPath)
  );
  
  // Gzip compression
  const gzipPath = `${outputBasePath}.gz`;
  await pipelineAsync(
    fs.createReadStream(inputPath),
    zlib.createGzip({ level: GZIP_MAX_LEVEL }),
    fs.createWriteStream(gzipPath)
  );
  
  if (!silent) {
    const brotliSize = fs.statSync(brotliPath).size;
    const gzipSize = fs.statSync(gzipPath).size;
    const originalSize = fs.statSync(inputPath).size;
    
    console.log(`  Brotli: ${(brotliSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Gzip: ${(gzipSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Brotli ratio: ${((brotliSize / originalSize) * 100).toFixed(1)}%`);
    console.log(`  Gzip ratio: ${((gzipSize / originalSize) * 100).toFixed(1)}%`);
  }
}

/**
 * Parse CSV line properly handling quoted fields
 */
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField);
  return fields;
}

/**
 * Parse GTFS time string (HH:MM:SS) to seconds since midnight
 */
function parseGtfsTime(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return null;
  const hours = parseInt(parts[0], DECIMAL_RADIX);
  const minutes = parseInt(parts[1], DECIMAL_RADIX);
  const seconds = parseInt(parts[2], DECIMAL_RADIX);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Get bucket key for a trip ID (first 5 characters before hyphen)
 */
function getTripBucket(tripId) {
  const beforeHyphen = tripId.split('-')[0];
  return beforeHyphen.substring(0, 5);
}

/**
 * Get bucket key for a stop ID (first 3 characters)
 */
function getStopBucket(stopId) {
  return stopId.substring(0, 3);
}

/**
 * Process stop_times.txt and create pre-computed trip stop times files
 * Groups trips by 5-character prefix to reduce file count
 * Groups stop arrivals by 3-character stop prefix
 */
async function processStopTimes() {
  console.log('\n=== Processing stop times data ===\n');
  
  const stopTimesPath = path.join(OUTPUT_DIR, 'stop_times.txt');
  if (!fs.existsSync(stopTimesPath)) {
    console.log('⚠️  stop_times.txt not found, skipping trip data generation');
    return;
  }
  
  const tripBuckets = {}; // bucket_key -> { tripId -> [{stop_id, arrival_time, ...}] }
  const stopArrivalBuckets = {}; // bucket_key -> { stop_id -> [{trip_id, arrival_time, stop_sequence}] }
  
  console.log('Reading stop_times.txt...');
  const content = fs.readFileSync(stopTimesPath, 'utf8');
  const lines = content.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]);
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  
  let processedCount = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const parts = parseCSVLine(line);
    const tripId = parts[idx['trip_id']];
    const stopId = parts[idx['stop_id']];
    const arrivalTimeStr = parts[idx['arrival_time']];
    const departureTimeStr = parts[idx['departure_time']];
    const stopSequence = parseInt(parts[idx['stop_sequence']], DECIMAL_RADIX);
    
    if (!tripId || !stopId || !arrivalTimeStr) continue;
    
    const arrivalTime = parseGtfsTime(arrivalTimeStr);
    const departureTime = departureTimeStr ? parseGtfsTime(departureTimeStr) : arrivalTime;
    
    if (arrivalTime === null) continue;
    
    // Group trips by bucket
    const tripBucket = getTripBucket(tripId);
    if (!tripBuckets[tripBucket]) tripBuckets[tripBucket] = {};
    if (!tripBuckets[tripBucket][tripId]) tripBuckets[tripBucket][tripId] = [];
    
    tripBuckets[tripBucket][tripId].push({
      stop_id: stopId,
      arrival_time: arrivalTime,
      departure_time: departureTime,
      stop_sequence: stopSequence
    });
    
    // Group stop arrivals by bucket
    const stopBucket = getStopBucket(stopId);
    if (!stopArrivalBuckets[stopBucket]) stopArrivalBuckets[stopBucket] = {};
    if (!stopArrivalBuckets[stopBucket][stopId]) stopArrivalBuckets[stopBucket][stopId] = [];
    stopArrivalBuckets[stopBucket][stopId].push({
      trip_id: tripId,
      arrival_time: arrivalTime,
      stop_sequence: stopSequence
    });
    
    processedCount++;
    if (processedCount % 500000 === 0) {
      console.log(`  Processed ${processedCount} stop times...`);
    }
  }
  
  console.log(`Processed ${processedCount} stop times`);
  console.log(`Created ${Object.keys(tripBuckets).length} trip buckets`);
  console.log(`Created ${Object.keys(stopArrivalBuckets).length} stop arrival buckets`);
  
  // Sort stop times by sequence for each trip
  console.log('Sorting trip stop times...');
  for (const bucket in tripBuckets) {
    for (const tripId in tripBuckets[bucket]) {
      tripBuckets[bucket][tripId].sort((a, b) => a.stop_sequence - b.stop_sequence);
    }
  }
  
  // Sort stop arrivals by time for each stop
  console.log('Sorting stop arrivals...');
  for (const bucket in stopArrivalBuckets) {
    for (const stopId in stopArrivalBuckets[bucket]) {
      stopArrivalBuckets[bucket][stopId].sort((a, b) => a.arrival_time - b.arrival_time);
    }
  }
  
  // Create trips directory
  const tripsDir = path.join(OUTPUT_DIR, 'trips');
  if (!fs.existsSync(tripsDir)) {
    fs.mkdirSync(tripsDir, { recursive: true });
  }
  
  // Create stops directory
  const stopsDir = path.join(OUTPUT_DIR, 'stops');
  if (!fs.existsSync(stopsDir)) {
    fs.mkdirSync(stopsDir, { recursive: true });
  }
  
  // Write trip bucket files
  console.log('Writing trip bucket files...');
  let bucketCount = 0;
  for (const bucket in tripBuckets) {
    const jsonPath = path.join(tripsDir, `${bucket}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(tripBuckets[bucket]));
    bucketCount++;
    if (bucketCount % 50 === 0) {
      console.log(`  Written ${bucketCount} trip bucket files...`);
    }
  }
  console.log(`Written ${bucketCount} trip bucket files`);
  
  // Write stop arrival bucket files
  console.log('Writing stop arrival bucket files...');
  let stopBucketCount = 0;
  for (const bucket in stopArrivalBuckets) {
    const jsonPath = path.join(stopsDir, `${bucket}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(stopArrivalBuckets[bucket]));
    stopBucketCount++;
  }
  console.log(`Written ${stopBucketCount} stop arrival bucket files`);
  
  return { tripsDir, stopsDir, bucketCount, stopBucketCount };
}

/**
 * Compress trip bucket files and stop arrival bucket files
 */
async function compressTripData(tripsDir, stopsDir, skipCompression) {
  if (skipCompression) {
    console.log('Skipping trip data compression (--no-compress flag)');
    return;
  }
  
  console.log('\n=== Compressing trip data ===\n');
  
  // Compress trip bucket files
  const tripBucketFiles = fs.readdirSync(tripsDir).filter(f => f.endsWith('.json'));
  console.log(`Compressing ${tripBucketFiles.length} trip bucket files...`);
  
  let compressed = 0;
  for (const file of tripBucketFiles) {
    const inputPath = path.join(tripsDir, file);
    const outputBasePath = path.join(tripsDir, file);
    await compressFile(inputPath, outputBasePath, true); // Silent mode
    compressed++;
    if (compressed % 20 === 0 || compressed === tripBucketFiles.length) {
      console.log(`  Compressed ${compressed}/${tripBucketFiles.length} trip files...`);
    }
  }
  console.log(`Completed compression of ${compressed} trip bucket files`);
  
  // Compress stop arrival bucket files
  const stopBucketFiles = fs.readdirSync(stopsDir).filter(f => f.endsWith('.json'));
  console.log(`Compressing ${stopBucketFiles.length} stop arrival bucket files...`);
  
  compressed = 0;
  for (const file of stopBucketFiles) {
    const inputPath = path.join(stopsDir, file);
    const outputBasePath = path.join(stopsDir, file);
    await compressFile(inputPath, outputBasePath, true); // Silent mode
    compressed++;
    if (compressed % 20 === 0 || compressed === stopBucketFiles.length) {
      console.log(`  Compressed ${compressed}/${stopBucketFiles.length} stop files...`);
    }
  }
  console.log(`Completed compression of ${compressed} stop arrival bucket files`);
  
  // Remove uncompressed JSON files
  console.log('Removing uncompressed JSON files...');
  for (const file of tripBucketFiles) {
    fs.unlinkSync(path.join(tripsDir, file));
  }
  for (const file of stopBucketFiles) {
    fs.unlinkSync(path.join(stopsDir, file));
  }
}

/**
 * Main processing function
 */
async function main() {
  try {
    // Check for command-line flags
    const args = process.argv.slice(2);
    const skipCompression = args.includes('--no-compress');
    const useCachedData = args.includes('--use-cache');
    
    console.log('=== GTFS Data Processing ===\n');
    if (skipCompression) {
      console.log('⚠️  Compression disabled (--no-compress flag)\n');
    }
    if (useCachedData) {
      console.log('📦 Cache mode enabled (--use-cache flag)\n');
    }
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`Created directory: ${OUTPUT_DIR}`);
    }
    
    // Step 1: Download the zip file
    await downloadFile(GTFS_URL, TEMP_ZIP);
    
    // Step 2: Calculate hash of downloaded zip
    console.log('\nCalculating zip file hash...');
    const currentHash = await calculateFileHash(TEMP_ZIP);
    console.log(`Current hash: ${currentHash}`);
    
    // Step 3: Check if we can use cached compressed files
    let useCachedFiles = false;
    if (useCachedData) {
      const previousMetadata = loadHashMetadata();
      if (previousMetadata && previousMetadata.hash === currentHash) {
        console.log('✅ Hash matches previous version - checking for cached compressed files...');
        
        // Check if all compressed files exist in data directory
        const allCompressedExist = FILES_TO_EXTRACT.every(file => {
          const brPath = path.join(OUTPUT_DIR, `${file}.br`);
          const gzPath = path.join(OUTPUT_DIR, `${file}.gz`);
          return fs.existsSync(brPath) && fs.existsSync(gzPath);
        });
        
        if (allCompressedExist) {
          console.log('✅ All cached compressed files found - skipping compression\n');
          useCachedFiles = true;
        } else {
          console.log('⚠️  Some compressed files missing - will recompress\n');
        }
      } else {
        console.log('📝 Hash differs from previous version - will process from scratch\n');
      }
    }
    
    // Step 4: Extract files (always needed for txt files during processing)
    await extractFiles(TEMP_ZIP, FILES_TO_EXTRACT, OUTPUT_DIR);
    
    // Step 5: Compress each file (unless using cache or --no-compress flag is set)
    if (!skipCompression && !useCachedFiles) {
      console.log('\n=== Compressing files ===\n');
      await Promise.all(
        FILES_TO_EXTRACT.map(file => {
          const inputPath = path.join(OUTPUT_DIR, file);
          const outputBasePath = path.join(OUTPUT_DIR, file);
          return compressFile(inputPath, outputBasePath);
        })
      );
      console.log('');
    }
    
    // Step 5.5: Process stop times into trip buckets and stop arrivals buckets
    const tripDataResult = await processStopTimes();
    if (tripDataResult) {
      const { tripsDir, stopsDir, bucketCount, stopBucketCount } = tripDataResult;
      await compressTripData(tripsDir, stopsDir, skipCompression);
    }
    
    // Step 6: Save hash metadata
    saveHashMetadata(currentHash);
    
    // Step 7: Clean up temporary txt files
    // Note: We keep the zip file (temp_gtfs.zip) for artifact upload
    console.log('Cleaning up extracted txt files...');
    
    // Remove uncompressed txt files to save space (only if we compressed them)
    if (!skipCompression && !useCachedFiles) {
      for (const file of FILES_TO_EXTRACT) {
        const txtPath = path.join(OUTPUT_DIR, file);
        if (fs.existsSync(txtPath)) {
          fs.unlinkSync(txtPath);
          console.log(`Removed ${file}`);
        }
      }
    } else if (skipCompression) {
      console.log('Keeping uncompressed txt files (--no-compress flag)');
    } else if (useCachedFiles) {
      // Remove txt files when using cache since we don't need them
      for (const file of FILES_TO_EXTRACT) {
        const txtPath = path.join(OUTPUT_DIR, file);
        if (fs.existsSync(txtPath)) {
          fs.unlinkSync(txtPath);
          console.log(`Removed ${file}`);
        }
      }
    }
    
    console.log('\n=== Processing complete! ===');
    console.log('\nGenerated files:');
    for (const file of FILES_TO_EXTRACT) {
      const txtPath = path.join(OUTPUT_DIR, file);
      const brPath = path.join(OUTPUT_DIR, `${file}.br`);
      const gzPath = path.join(OUTPUT_DIR, `${file}.gz`);
      if (fs.existsSync(txtPath)) {
        console.log(`  ${file}`);
      }
      if (fs.existsSync(brPath)) {
        console.log(`  ${file}.br`);
      }
      if (fs.existsSync(gzPath)) {
        console.log(`  ${file}.gz`);
      }
    }
    
    // List trip data files
    const tripsDir = path.join(OUTPUT_DIR, 'trips');
    if (fs.existsSync(tripsDir)) {
      const tripFiles = fs.readdirSync(tripsDir);
      const brFiles = tripFiles.filter(f => f.endsWith('.br'));
      const gzFiles = tripFiles.filter(f => f.endsWith('.gz'));
      console.log(`\nTrip data files:`);
      console.log(`  ${brFiles.length} .br files in trips/`);
      console.log(`  ${gzFiles.length} .gz files in trips/`);
    }
    
    // List stop arrival data files
    const stopsDir = path.join(OUTPUT_DIR, 'stops');
    if (fs.existsSync(stopsDir)) {
      const stopFiles = fs.readdirSync(stopsDir);
      const brFiles = stopFiles.filter(f => f.endsWith('.br'));
      const gzFiles = stopFiles.filter(f => f.endsWith('.gz'));
      console.log(`\nStop arrival data files:`);
      console.log(`  ${brFiles.length} .br files in stops/`);
      console.log(`  ${gzFiles.length} .gz files in stops/`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
