#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const cesiumSource = path.join(rootDir, 'node_modules', 'cesium', 'Build', 'Cesium');
const cesiumDest = path.join(rootDir, 'public', 'cesium');

async function copyCesiumAssets() {
  try {
    console.log('Copying Cesium assets...');
    
    // Ensure public directory exists
    await fs.ensureDir(path.join(rootDir, 'public'));
    
    // Remove old assets
    await fs.remove(cesiumDest);
    
    // Copy new assets
    await fs.copy(cesiumSource, cesiumDest);
    
    console.log('✅ Cesium assets copied to public/cesium');
  } catch (err) {
    console.error('❌ Failed to copy Cesium assets:', err.message);
    process.exit(1);
  }
}

copyCesiumAssets();
