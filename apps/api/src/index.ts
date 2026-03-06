import express from 'express';
import cors from 'cors';
import db, { initializeDatabase } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
  const { at } = req.query;
  const timestamp = at || new Date().toISOString();
  
  // Get closest snapshot for each body
  const positions = db.prepare(`
    SELECT e.* FROM ephemeris_snapshots e
    WHERE e.body_code = ?
    AND e.timestamp_utc <= ?
    ORDER BY e.timestamp_utc DESC
    LIMIT 1
  `).all(timestamp);
  
  res.json({ data: positions, serverTimeUtc: new Date().toISOString() });
});

// Get today's APOD
app.get('/api/apod/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const apod = db.prepare('SELECT * FROM apod WHERE date = ?').get(today);
  
  res.json({ data: apod || null, serverTimeUtc: new Date().toISOString() });
});

// Initialize and start
initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Cosmic Watch API running on port ${PORT}`);
});
