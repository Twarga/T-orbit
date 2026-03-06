# SQLite Schema - CW-007

## Tables

### satellites
Master list of all tracked objects.

| Column | Type | Description |
|--------|------|-------------|
| norad_id | INTEGER | Primary key (NORAD catalog number) |
| name | TEXT | Satellite name |
| international_designator | TEXT | Launch designation (e.g., "1998-067A") |
| operator_org | TEXT | Operating organization |
| mission_type | TEXT | Mission classification |
| country_code | TEXT | Country of origin |
| is_active | INTEGER | 1 = active, 0 = inactive |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

---

### tle_sets
Orbital elements for propagating positions.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| norad_id | INTEGER | FK → satellites |
| epoch_utc | TEXT | Element set epoch (ISO timestamp) |
| line1 | TEXT | TLE line 1 |
| line2 | TEXT | TLE line 2 |
| source | TEXT | Data source ("celestrak") |
| ingested_at | TEXT | When fetched |

**Index:** `(norad_id, epoch_utc DESC)` - for latest TLE lookup

---

### celestial_bodies
Solar system objects.

| Column | Type | Description |
|--------|------|-------------|
| body_code | TEXT | Primary key (SUN, MOON, MARS, etc.) |
| name | TEXT | Display name |
| category | TEXT | star, moon, planet |

---

### ephemeris_snapshots
Stored positions for planets.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| body_code | TEXT | FK → celestial_bodies |
| timestamp_utc | TEXT | Position timestamp |
| x_km | REAL | X position (km) |
| y_km | REAL | Y position (km) |
| z_km | REAL | Z position (km) |
| vx_kms | REAL | X velocity (km/s) |
| vy_kms | REAL | Y velocity (km/s) |
| vz_kms | REAL | Z velocity (km/s) |

**Index:** `(body_code, timestamp_utc)` - for position lookups

---

### satellite_metadata
Curated info for satellites.

| Column | Type | Description |
|--------|------|-------------|
| norad_id | INTEGER | FK → satellites (PK) |
| summary | TEXT | Brief description |
| owner | TEXT | Operating entity |
| mission_type | TEXT | Mission classification |
| launch_date | TEXT | Launch date |
| status | TEXT | Operational status |
| fact_json | TEXT | Additional facts (JSON) |
| last_reviewed_at | TEXT | Last update |

---

### sync_runs
Audit log for data ingestion.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| source_name | TEXT | "celestrak", "jpl" |
| started_at | TEXT | Start timestamp |
| completed_at | TEXT | End timestamp |
| status | TEXT | running, success, failure |
| records_in | INTEGER | Records fetched |
| records_out | INTEGER | Records saved |
| error_summary | TEXT | Error message if failed |

---

## Relationships

```
satellites (1) ──< (N) tle_sets
satellites (1) ──< (N) satellite_metadata
celestial_bodies (1) ──< (N) ephemeris_snapshots
```

---

## Example Queries

### Get latest TLE for a satellite
```sql
SELECT s.*, t.line1, t.line2, t.epoch_utc
FROM satellites s
LEFT JOIN tle_sets t ON s.norad_id = t.norad_id
WHERE s.norad_id = 25544  -- ISS
ORDER BY t.epoch_utc DESC
LIMIT 1;
```

### Get all active satellites
```sql
SELECT * FROM satellites WHERE is_active = 1;
```

### Get planet position
```sql
SELECT * FROM ephemeris_snapshots
WHERE body_code = 'MARS'
ORDER BY timestamp_utc DESC
LIMIT 1;
```
