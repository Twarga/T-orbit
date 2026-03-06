import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'cosmic-watch.db');

let sqlDb: any = null;
let SQL: any = null;

export async function initializeDatabase() {
  if (sqlDb) return sqlDb;

  SQL = await initSqlJs();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let data: Buffer | null = null;
  if (fs.existsSync(DB_PATH)) {
    data = fs.readFileSync(DB_PATH);
  }

  sqlDb = new SQL.Database(data ? new Uint8Array(data) : undefined);

  sqlDb.run('PRAGMA foreign_keys = ON');

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS satellites (
      norad_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      international_designator TEXT,
      operator_org TEXT,
      mission_type TEXT,
      country_code TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS tle_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      norad_id INTEGER NOT NULL,
      epoch_utc TEXT NOT NULL,
      line1 TEXT NOT NULL,
      line2 TEXT NOT NULL,
      source TEXT DEFAULT 'celestrak',
      ingested_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (norad_id) REFERENCES satellites(norad_id),
      UNIQUE(norad_id, epoch_utc)
    )
  `);

  sqlDb.run(`
    CREATE INDEX IF NOT EXISTS idx_tle_norad_epoch 
    ON tle_sets(norad_id, epoch_utc DESC)
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS celestial_bodies (
      body_code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS ephemeris_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body_code TEXT NOT NULL,
      timestamp_utc TEXT NOT NULL,
      x_km REAL NOT NULL,
      y_km REAL NOT NULL,
      z_km REAL NOT NULL,
      vx_kms REAL,
      vy_kms REAL,
      vz_kms REAL,
      FOREIGN KEY (body_code) REFERENCES celestial_bodies(body_code),
      UNIQUE(body_code, timestamp_utc)
    )
  `);

  sqlDb.run(`
    CREATE INDEX IF NOT EXISTS idx_ephemeris_body_time 
    ON ephemeris_snapshots(body_code, timestamp_utc)
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS satellite_metadata (
      norad_id INTEGER PRIMARY KEY,
      summary TEXT,
      owner TEXT,
      mission_type TEXT,
      launch_date TEXT,
      status TEXT,
      fact_json TEXT,
      last_reviewed_at TEXT,
      FOREIGN KEY (norad_id) REFERENCES satellites(norad_id)
    )
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS sync_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_name TEXT NOT NULL,
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      status TEXT DEFAULT 'running',
      records_in INTEGER DEFAULT 0,
      records_out INTEGER DEFAULT 0,
      error_summary TEXT
    )
  `);

  const bodies = [
    ['SUN', 'Sun', 'star'],
    ['MOON', 'Moon', 'moon'],
    ['MERCURY', 'Mercury', 'planet'],
    ['VENUS', 'Venus', 'planet'],
    ['EARTH', 'Earth', 'planet'],
    ['MARS', 'Mars', 'planet'],
    ['JUPITER', 'Jupiter', 'planet'],
    ['SATURN', 'Saturn', 'planet'],
    ['URANUS', 'Uranus', 'planet'],
    ['NEPTUNE', 'Neptune', 'planet'],
  ];

  for (const [code, name, category] of bodies) {
    sqlDb.run(
      'INSERT OR IGNORE INTO celestial_bodies (body_code, name, category) VALUES (?, ?, ?)',
      [code, name, category]
    );
  }

  saveDatabase();
  console.log('✅ Database initialized at:', DB_PATH);
  return sqlDb;
}

export function saveDatabase() {
  if (!sqlDb) return;
  const data = sqlDb.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function rowsToObjects(stmt: any): any[] {
  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}

export const db = {
  prepare(sql: string) {
    return {
      all(...params: any[]) {
        if (!sqlDb) return [];
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        return rowsToObjects(stmt);
      },
      get(...params: any[]) {
        if (!sqlDb) return null;
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        const results = rowsToObjects(stmt);
        return results.length > 0 ? results[0] : null;
      },
      run(...params: any[]) {
        if (!sqlDb) return { changes: 0 };
        if (params.length > 0) {
          sqlDb.run(sql, params);
        } else {
          sqlDb.run(sql);
        }
        saveDatabase();
        return { changes: sqlDb.getRowsModified() };
      },
    };
  },
};

export default db;
