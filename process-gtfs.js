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
async function compressFile(inputPath, outputBasePath) {
  console.log(`Compressing ${path.basename(inputPath)}...`);
  
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
  
  const brotliSize = fs.statSync(brotliPath).size;
  console.log(`  Brotli: ${(brotliSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Gzip compression
  const gzipPath = `${outputBasePath}.gz`;
  await pipelineAsync(
    fs.createReadStream(inputPath),
    zlib.createGzip({ level: GZIP_MAX_LEVEL }),
    fs.createWriteStream(gzipPath)
  );
  
  const gzipSize = fs.statSync(gzipPath).size;
  console.log(`  Gzip: ${(gzipSize / 1024 / 1024).toFixed(2)} MB`);
  
  const originalSize = fs.statSync(inputPath).size;
  console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Brotli ratio: ${((brotliSize / originalSize) * 100).toFixed(1)}%`);
  console.log(`  Gzip ratio: ${((gzipSize / originalSize) * 100).toFixed(1)}%`);
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
