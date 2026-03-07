import express from 'express';
import cors from 'cors';
import db, { initializeDatabase, saveDatabase } from './db/index.js';
import './jobs/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Seed sample data - fetch real TLE from CelesTrak
app.post('/api/seed', async (req, res) => {
  try {
    const axios = await import('axios');
    
    // Fetch ISS
    const issRes = await axios.default.get(
      'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=json'
    );
    
    // Fetch Starlink (first 10)
    const starlinkRes = await axios.default.get(
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json'
    );
    
    const iss = issRes.data?.[0];
    const starlinks = (starlinkRes.data?.data || starlinkRes.data || []).slice(0, 5);
    
    let count = 0;
    
    // Insert ISS
    if (iss) {
      const line1 = `1 ${String(iss.NORAD_CAT_ID).padStart(5,'0')}  0 ${iss.EPOCH?.slice(2,10) || '24001.00000000'} ${(iss.MEAN_MOTION_DOT||'0').toString().padStart(10,' ')} ${(iss.BSTAR||'0').toString().padStart(10,' ')} 0 99999  0`;
      const line2 = `2 ${String(iss.NORAD_CAT_ID).padStart(5,'0')}  ${String(iss.INCLINATION||0).padStart(8,' ')} ${String(iss.RA_OF_ASC_NODE||0).padStart(8,' ')} ${String((iss.ECCENTRICITY||'0').toString().slice(2)).padStart(7,' ')} ${String(iss.ARG_OF_PERICENTER||0).padStart(8,' ')} ${String(iss.MEAN_ANOMALY||0).padStart(8,' ')} ${String(iss.MEAN_MOTION||0).padStart(11,' ')} 0`;
      
      db.prepare(`INSERT OR REPLACE INTO satellites (norad_id, name, is_active) VALUES (?, ?, 1)`).run(iss.NORAD_CAT_ID, iss.OBJECT_NAME);
      db.prepare(`INSERT OR REPLACE INTO tle_sets (norad_id, epoch_utc, line1, line2, source) VALUES (?, datetime('now'), ?, ?, 'celestrak')`).run(iss.NORAD_CAT_ID, line1, line2);
      count++;
    }
    
    // Insert Starlink
    for (const sat of starlinks) {
      if (!sat.NORAD_CAT_ID || !sat.OBJECT_NAME) continue;
      const line1 = `1 ${String(sat.NORAD_CAT_ID).padStart(5,'0')}  0 ${sat.EPOCH?.slice(2,10) || '24001.00000000'} ${(sat.MEAN_MOTION_DOT||'0').toString().padStart(10,' ')} ${(sat.BSTAR||'0').toString().padStart(10,' ')} 0 99999  0`;
      const line2 = `2 ${String(sat.NORAD_CAT_ID).padStart(5,'0')} ${String(sat.INCLINATION||0).padStart(8,' ')} ${String(sat.RA_OF_ASC_NODE||0).padStart(8,' ')} ${String((sat.ECCENTRICITY||'0').toString().slice(2)).padStart(7,' ')} ${String(sat.ARG_OF_PERICENTER||0).padStart(8,' ')} ${String(sat.MEAN_ANOMALY||0).padStart(8,' ')} ${String(sat.MEAN_MOTION||0).padStart(11,' ')} 0`;
      
      db.prepare(`INSERT OR REPLACE INTO satellites (norad_id, name, is_active) VALUES (?, ?, 1)`).run(sat.NORAD_CAT_ID, sat.OBJECT_NAME);
      db.prepare(`INSERT OR REPLACE INTO tle_sets (norad_id, epoch_utc, line1, line2, source) VALUES (?, datetime('now'), ?, ?, 'celestrak')`).run(sat.NORAD_CAT_ID, line1, line2);
      count++;
    }
    
    saveDatabase();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to seed' });
  }
});

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

// Update satellite metadata (for SME content)
app.put('/api/metadata/satellites/:noradId', (req, res) => {
  const noradId = parseInt(req.params.noradId);
  const { summary, owner, mission_type, status, fact_json } = req.body;
  
  // Check satellite exists
  const satellite = db.prepare('SELECT norad_id FROM satellites WHERE norad_id = ?').get(noradId);
  if (!satellite) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Satellite not found' } });
  }
  
  db.prepare(`
    INSERT INTO satellite_metadata (norad_id, summary, owner, mission_type, status, fact_json, last_reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(norad_id) DO UPDATE SET
      summary = excluded.summary,
      owner = excluded.owner,
      mission_type = excluded.mission_type,
      status = excluded.status,
      fact_json = excluded.fact_json,
      last_reviewed_at = datetime('now')
  `).run(noradId, summary || null, owner || null, mission_type || null, status || null, fact_json ? JSON.stringify(fact_json) : null);
  
  const updated = db.prepare('SELECT * FROM satellite_metadata WHERE norad_id = ?').get(noradId);
  res.json({ data: updated, serverTimeUtc: new Date().toISOString() });
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
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Cosmic Watch API running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
