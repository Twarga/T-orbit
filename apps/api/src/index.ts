import express from 'express';
import cors from 'cors';
import db, { initializeDatabase } from './db/index.js';
import './jobs/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  const tleSync = db.prepare(`
    SELECT * FROM sync_runs WHERE source_name = 'celestrak' ORDER BY started_at DESC LIMIT 1
  `).get();
  
  const ephSync = db.prepare(`
    SELECT * FROM sync_runs WHERE source_name = 'jpl' ORDER BY started_at DESC LIMIT 1
  `).get();
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    lastSync: {
      tle: tleSync,
      ephemeris: ephSync
    }
  });
});

// Get active satellites
app.get('/api/satellites/active', (req, res) => {
  const satellites = db.prepare(`
    SELECT s.*, t.line1, t.line2, t.epoch_utc
    FROM satellites s
    LEFT JOIN tle_sets t ON s.norad_id = t.norad_id
    WHERE s.is_active = 1
    AND t.epoch_utc = (
      SELECT MAX(epoch_utc) FROM tle_sets WHERE norad_id = s.norad_id
    )
  `).all();
  
  res.json({ data: satellites, serverTimeUtc: new Date().toISOString() });
});

// Get single satellite
app.get('/api/satellites/:noradId', (req, res) => {
  const noradId = parseInt(req.params.noradId);
  
  const satellite = db.prepare(`
    SELECT s.*, t.line1, t.line2, t.epoch_utc
    FROM satellites s
    LEFT JOIN tle_sets t ON s.norad_id = t.norad_id
    WHERE s.norad_id = ?
    ORDER BY t.epoch_utc DESC
    LIMIT 1
  `).get(noradId);
  
  if (!satellite) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Satellite not found' } });
  }
  
  res.json({ data: satellite, serverTimeUtc: new Date().toISOString() });
});

// Get satellite metadata
app.get('/api/metadata/satellites/:noradId', (req, res) => {
  const noradId = parseInt(req.params.noradId);
  
  const metadata = db.prepare('SELECT * FROM satellite_metadata WHERE norad_id = ?').get(noradId);
  
  res.json({ data: metadata || null, serverTimeUtc: new Date().toISOString() });
});

// Get celestial bodies
app.get('/api/solar/bodies', (req, res) => {
  const bodies = db.prepare('SELECT * FROM celestial_bodies').all();
  res.json({ data: bodies, serverTimeUtc: new Date().toISOString() });
});

// Get ephemeris positions
app.get('/api/solar/positions', (req, res) => {
  const positions = db.prepare(`
    SELECT e.body_code, e.timestamp_utc, e.x_km, e.y_km, e.z_km
    FROM ephemeris_snapshots e
    INNER JOIN (
      SELECT body_code, MAX(timestamp_utc) as max_time
      FROM ephemeris_snapshots
      GROUP BY body_code
    ) latest ON e.body_code = latest.body_code AND e.timestamp_utc = latest.max_time
  `).all();
  
  res.json({ data: positions, serverTimeUtc: new Date().toISOString() });
});

// Get distance between two bodies
app.get('/api/solar/distance', (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ 
      error: { code: 'MISSING_PARAMS', message: 'from and to query params required' } 
    });
  }
  
  const fromPos = db.prepare(`
    SELECT * FROM ephemeris_snapshots 
    WHERE body_code = ? 
    ORDER BY timestamp_utc DESC LIMIT 1
  `).get(from as string);
  
  const toPos = db.prepare(`
    SELECT * FROM ephemeris_snapshots 
    WHERE body_code = ? 
    ORDER BY timestamp_utc DESC LIMIT 1
  `).get(to as string);
  
  if (!fromPos || !toPos) {
    return res.status(404).json({ 
      error: { code: 'NOT_FOUND', message: 'Body position not found' } 
    });
  }
  
  const dx = toPos.x_km - fromPos.x_km;
  const dy = toPos.y_km - fromPos.y_km;
  const dz = toPos.z_km - fromPos.z_km;
  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
  
  res.json({ 
    data: { 
      from: from,
      to: to,
      distanceKm: Math.round(distance),
      distanceAu: Math.round(distance / 149597870.7)
    },
    serverTimeUtc: new Date().toISOString() 
  });
});

// Initialize and start
initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Cosmic Watch API running on port ${PORT}`);
});
