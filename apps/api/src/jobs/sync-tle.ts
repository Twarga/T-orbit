import axios from 'axios';
import db from '../db/index.js';

interface CelesTrakSatellite {
  OBJECT_NAME: string;
  NORAD_CAT_ID: number;
  INTERNATIONAL_DESIGNATOR: string;
  EPOCH?: string;
  MEAN_MOTION?: string;
  ECCENTRICITY?: string;
  INCLINATION?: string;
  RAAN?: string;
  ARG_OF_PERICENTER?: string;
  MEAN_ANOMALY?: string;
  MEAN_MOTION_DOT?: string;
  BSTAR?: string;
}

interface TleData {
  noradId: number;
  name: string;
  line1: string;
  line2: string;
}

function formatNumber(num: string | undefined, decimals: number, width: number): string {
  const value = parseFloat(num || '0');
  const formatted = value.toFixed(decimals);
  return formatted.padStart(width);
}

function buildTleFromCelesTrak(sat: CelesTrakSatellite): TleData | null {
  const norad = sat.NORAD_CAT_ID;
  const name = sat.OBJECT_NAME;
  const designator = sat.INTERNATIONAL_DESIGNATOR || '';
  
  if (!norad || !name) return null;
  
  // Extract launch year/day from international designator (e.g., "1998-067A")
  let launchYear = '24';
  let launchDay = '001';
  if (designator.length >= 5) {
    const yearPart = designator.substring(0, 2);
    const dayPart = designator.substring(2, 5);
    const fullYear = parseInt(yearPart);
    launchYear = (fullYear > 50 ? '19' : '20') + yearPart;
    launchDay = dayPart;
  }
  
  // Format epoch - use current time if not provided
  const epochStr = sat.EPOCH || new Date().toISOString();
  const epochMatch = epochStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  let epochYear = '24';
  let epochDayOfYear = '001';
  if (epochMatch) {
    const year = epochMatch[1].substring(2);
    const month = parseInt(epochMatch[2]);
    const day = parseInt(epochMatch[3]);
    epochYear = year;
    // Approximate day of year
    const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 1; i < month; i++) dayOfYear += days[i];
    epochDayOfYear = dayOfYear.toString().padStart(3, '0');
  }
  
  // Format TLE fields
  const inc = formatNumber(sat.INCLINATION, 4, 8);
  const ecc = formatNumber(sat.ECCENTRICITY, 7, 7).substring(2); // Remove "0."
  const raan = formatNumber(sat.RAAN || sat.ARG_OF_PERICENTER, 4, 8);
  const argPe = formatNumber(sat.ARG_OF_PERICENTER, 4, 8);
  const meanAnom = formatNumber(sat.MEAN_ANOMALY, 4, 8);
  const meanMotion = formatNumber(sat.MEAN_MOTION, 8, 11);
  const meanMotionDot = formatNumber(sat.MEAN_MOTION_DOT, 8, 10);
  const bstar = (sat.BSTAR || '0').padStart(10);
  
  const checksum1 = '0';
  const checksum2 = '0';
  
  // TLE line 1
  const line1 = [
    '1 ',
    String(norad).padStart(5, '0'),
    checksum1,
    'U ',
    launchYear + launchDay + '.00000000',
    ' ',
    meanMotionDot,
    bstar,
    ' 0',
    ' 99999',
    '  0',
  ].join('');
  
  // TLE line 2
  const line2 = [
    '2 ',
    String(norad).padStart(5, '0'),
    ' ',
    inc,
    ' ',
    raan,
    ' ',
    ecc,
    ' ',
    argPe,
    ' ',
    meanAnom,
    meanMotion,
    checksum2,
    String(norad).padStart(5, '0'),
  ].join('');
  
  return { noradId: norad, name, line1, line2 };
}

export async function syncTleFromCelesTrak(): Promise<{ success: boolean; records: number; error?: string }> {
  console.log('🔄 Starting TLE sync from CelesTrak...');
  
  const syncRun = db.prepare(`
    INSERT INTO sync_runs (source_name, status) VALUES ('celestrak', 'running')
  `).run();
  
  const syncRunId = syncRun.lastInsertRowid;
  
  try {
    const response = await axios.get<{ data: CelesTrakSatellite[] }>(
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json',
      { timeout: 60000 }
    );
    
    const satellites = response.data;
    console.log(`📡 Received ${satellites.length} satellites from CelesTrak`);
    
    let satellitesUpserted = 0;
    let tleUpserted = 0;
    
    const upsertSatellite = db.prepare(`
      INSERT INTO satellites (norad_id, name, international_designator, is_active, updated_at)
      VALUES (?, ?, ?, 1, datetime('now'))
      ON CONFLICT(norad_id) DO UPDATE SET
        name = excluded.name,
        international_designator = excluded.international_designator,
        is_active = 1,
        updated_at = datetime('now')
    `);
    
    const upsertTle = db.prepare(`
      INSERT INTO tle_sets (norad_id, epoch_utc, line1, line2, source)
      VALUES (?, datetime('now', 'utc'), ?, ?, 'celestrak')
      ON CONFLICT(norad_id, epoch_utc) DO NOTHING
    `);
    
    const transaction = db.transaction(() => {
      for (const sat of satellites) {
        if (!sat.NORAD_CAT_ID || !sat.OBJECT_NAME) continue;
        
        const result = upsertSatellite.run(
          sat.NORAD_CAT_ID,
          sat.OBJECT_NAME,
          sat.INTERNATIONAL_DESIGNATOR || null
        );
        
        if (result.changes > 0) {
          satellitesUpserted++;
        }
        
        const tle = buildTleFromCelesTrak(sat);
        if (tle) {
          const tleResult = upsertTle.run(
            tle.noradId,
            tle.line1,
            tle.line2
          );
          if (tleResult.changes > 0) {
            tleUpserted++;
          }
        }
      }
    });
    
    transaction();
    
    db.prepare(`
      UPDATE sync_runs 
      SET status = 'success', 
          completed_at = datetime('now', 'utc'),
          records_in = ?,
          records_out = ?
      WHERE id = ?
    `).run(satellites.length, tleUpserted, syncRunId);
    
    console.log(`✅ TLE sync complete: ${satellitesUpserted} satellites, ${tleUpserted} new TLE sets`);
    
    return { success: true, records: tleUpserted };
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    db.prepare(`
      UPDATE sync_runs 
      SET status = 'failure', 
          completed_at = datetime('now', 'utc'),
          error_summary = ?
      WHERE id = ?
    `).run(message, syncRunId);
    
    console.error('❌ TLE sync failed:', message);
    
    return { success: false, records: 0, error: message };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncTleFromCelesTrak()
    .then(result => {
      console.log('Sync result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
