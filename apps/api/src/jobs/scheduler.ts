import cron from 'node-cron';
import { syncTleFromCelesTrak } from './sync-tle.js';
import { syncEphemeris } from './sync-ephemeris.js';

console.log('⏰ Starting scheduled jobs...');

// TLE sync every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('📡 Running TLE sync job...');
  const result = await syncTleFromCelesTrak();
  console.log('📡 TLE sync result:', result);
});

// Ephemeris sync every hour
cron.schedule('0 * * * *', async () => {
  console.log('🪐 Running ephemeris sync job...');
  const result = await syncEphemeris();
  console.log('🪐 Ephemeris sync result:', result);
});

// Run once on startup
async function runStartupSync() {
  console.log('🚀 Running initial sync on startup...');
  
  try {
    const tleResult = await syncTleFromCelesTrak();
    console.log('📡 Initial TLE sync:', tleResult.success ? '✅' : '❌');
  } catch (e) {
    console.error('📡 Initial TLE sync failed:', e);
  }
  
  try {
    const ephResult = await syncEphemeris();
    console.log('🪐 Initial ephemeris sync:', ephResult.success ? '✅' : '❌');
  } catch (e) {
    console.error('🪐 Initial ephemeris sync failed:', e);
  }
}

runStartupSync();

console.log('✅ Scheduled jobs registered:');
console.log('  - TLE sync: every 15 minutes');
console.log('  - Ephemeris sync: every hour');
