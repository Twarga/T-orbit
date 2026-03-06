import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/cosmic-watch.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  // Satellites master table
  db.exec(`
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

  // TLE (Two-Line Element) sets
  db.exec(`
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

  // Index for fast TLE lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tle_norad_epoch 
    ON tle_sets(norad_id, epoch_utc DESC)
  `);

  // Celestial bodies (Sun, planets, Moon)
  db.exec(`
    CREATE TABLE IF NOT EXISTS celestial_bodies (
      body_code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `);

  // Ephemeris snapshots (positions)
  db.exec(`
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

  // Index for ephemeris lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_ephemeris_body_time 
    ON ephemeris_snapshots(body_code, timestamp_utc)
  `);

  // Satellite metadata (SME curated)
  db.exec(`
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

  // Sync run audit log
  db.exec(`
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

  // Seed celestial bodies
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

  const insertBody = db.prepare(`
    INSERT OR IGNORE INTO celestial_bodies (body_code, name, category) VALUES (?, ?, ?)
  `);

  for (const [code, name, category] of bodies) {
    insertBody.run(code, name, category);
  }

  console.log('✅ Database initialized at:', DB_PATH);
}

export default db;
