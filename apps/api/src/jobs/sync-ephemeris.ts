import axios from 'axios';
import db from '../db/index.js';

const JPL_HORIZONS_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';

const BODY_CODES: Record<string, string> = {
  SUN: "'10'",
  MERCURY: "'199'",
  VENUS: "'299'",
  EARTH: "'399'",
  MARS: "'499'",
  JUPITER: "'599'",
  SATURN: "'699'",
  URANUS: "'799'",
  NEPTUNE: "'899'",
  MOON: "'301'",
};

interface EphemerisPosition {
  bodyCode: string;
  xKm: number;
  yKm: number;
  zKm: number;
}

async function fetchBodyPosition(bodyCode: string, horizonsCode: string): Promise<EphemerisPosition | null> {
  const now = new Date();
  const startTime = now.toISOString().replace('T', ' ').split('.')[0] + ' UTC';
  const stopTime = new Date(now.getTime() + 3600000).toISOString().replace('T', ' ').split('.')[0] + ' UTC';

  const params = new URLSearchParams({
    format: 'json',
    COMMAND: horizonsCode,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTOR',
    CENTER: "'500@399'",
    START_TIME: startTime,
    STOP_TIME: stopTime,
    STEP_SIZE: "'1 h'",
  });

  try {
    const response = await axios.get(`${JPL_HORIZONS_URL}?${params}`, {
      timeout: 30000,
    });

    // Handle JSON response format
    const data = response.data;
    
    if (data.result) {
      // JSON with result string
      const lines = data.result.split('\n');
      let inVectorSection = false;

      for (const line of lines) {
        if (line.includes('$$SOF')) {
          inVectorSection = true;
          continue;
        }
        if (line.includes('$$EOE')) break;
        if (inVectorSection && line.trim()) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            return {
              bodyCode,
              xKm: parseFloat(parts[0]) * 149597870.7,
              yKm: parseFloat(parts[1]) * 149597870.7,
              zKm: parseFloat(parts[2]) * 149597870.7,
            };
          }
        }
      }
    } else if (data.verifier) {
      // Alternative JSON format
      const lines = data.verifier.split('\n');
      let inVectorSection = false;

      for (const line of lines) {
        if (line.includes('$$SOF')) {
          inVectorSection = true;
          continue;
        }
        if (line.includes('$$EOE')) break;
        if (inVectorSection && line.trim()) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            return {
              bodyCode,
              xKm: parseFloat(parts[0]) * 149597870.7,
              yKm: parseFloat(parts[1]) * 149597870.7,
              zKm: parseFloat(parts[2]) * 149597870.7,
            };
          }
        }
      }
    }

    console.warn(`⚠️ No vector data for ${bodyCode}`);
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to fetch ${bodyCode}:`, message);
    return null;
  }
}

export async function syncEphemeris(): Promise<{ success: boolean; records: number; error?: string }> {
  console.log('🔄 Starting ephemeris sync from JPL Horizons...');

  const syncRun = db.prepare(`
    INSERT INTO sync_runs (source_name, status) VALUES ('jpl', 'running')
  `).run();

  const lastRun = db.prepare(`SELECT last_insert_rowid() as id`).get();
  const syncRunId = lastRun?.id || 1;

  try {
    const bodyEntries = Object.entries(BODY_CODES);
    console.log(`📡 Fetching ephemeris for ${bodyEntries.length} bodies...`);

    let recordsUpserted = 0;

    for (const [bodyCode, horizonsCode] of bodyEntries) {
      if (bodyCode === 'EARTH') continue;

      const position = await fetchBodyPosition(bodyCode, horizonsCode);

      if (position) {
        db.prepare(`
          INSERT INTO ephemeris_snapshots (body_code, timestamp_utc, x_km, y_km, z_km)
          VALUES (?, datetime('now', 'utc'), ?, ?, ?)
        `).run(bodyCode, position.xKm, position.yKm, position.zKm);

        recordsUpserted++;
        console.log(`✅ ${bodyCode}: (${position.xKm.toFixed(0)}, ${position.yKm.toFixed(0)}, ${position.zKm.toFixed(0)}) km`);
      }
    }

    db.prepare(`
      UPDATE sync_runs 
      SET status = 'success', 
          completed_at = datetime('now', 'utc'),
          records_in = ?,
          records_out = ?
      WHERE id = ?
    `).run(bodyEntries.length - 1, recordsUpserted, syncRunId);

    console.log(`✅ Ephemeris sync complete: ${recordsUpserted} positions`);

    return { success: true, records: recordsUpserted };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    db.prepare(`
      UPDATE sync_runs 
      SET status = 'failure', 
          completed_at = datetime('now', 'utc'),
          error_summary = ?
      WHERE id = ?
    `).run(message, syncRunId);

    console.error('❌ Ephemeris sync failed:', message);

    return { success: false, records: 0, error: message };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncEphemeris()
    .then(result => {
      console.log('Sync result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}