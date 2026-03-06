# Source API Validation - CW-006

**Task:** Validate source APIs (CelesTrak, JPL Horizons, NASA APOD)  
**Status:** Complete

---

## 1. CelesTrak

### Overview
Free TLE (Two-Line Element) data for satellites. The primary source for orbital data.

### Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| Active Satellites | `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json` | All active satellites |
| Stations | `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json` | ISS, Tiangong, etc. |
| Visual | `https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=json` | Bright objects |

### Rate Limits
- **No official rate limit** but be reasonable
- Data updates every **2 hours** max
- Don't poll more than every 15 minutes

### Fallback Strategy
```javascript
// If CelesTrak fails, use last cached TLE
const cachedTLE = fs.readFileSync('./data/tle-cache.json');
// Show "data may be stale" warning in UI
```

---

## 2. JPL Horizons

### Overview
Ephemeris data (position/velocity) for solar system bodies.

### API Endpoint
```
https://ssd.jpl.nasa.gov/api/horizons.api
```

### Example Query
```
https://ssd.jpl.nasa.gov/api/horizons.api?
  format=json&
  COMMAND='499'&        # Mars
  OBJ_DATA='YES'&
  MAKE_EPHEM='YES'&
  EPHEM_TYPE='OBSERVER'&
  CENTER='500@399'&    # Earth
  START_TIME=2026-01-01&
  STOP_TIME=2026-01-02&
  STEP_SIZE='1%20h'&
  QUANTITIES='1'       # RA/DEC
```

### Body Codes
| Code | Body |
|------|------|
| 10 | Sun |
| 301 | Moon |
| 199 | Mercury |
| 299 | Venus |
| 399 | Earth |
| 499 | Mars |
| 599 | Jupiter |
| 699 | Saturn |
| 799 | Uranus |
| 899 | Neptune |

### Rate Limits
- **No strict rate limit** but be respectful
- Request **once per hour** is plenty

### Fallback Strategy
```javascript
// Cache ephemeris for 1 hour
const cached = db.get('SELECT * FROM ephemeris WHERE body_code = ? ORDER BY timestamp DESC LIMIT 1');
if (cached && Date.now() - cached.timestamp < 3600000) {
  return cached;
}
```

---

## 3. NASA APOD

### Overview
Astronomy Picture of the Day from NASA.

### Endpoint
```
https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY
```

### Response
```json
{
  "date": "2026-03-06",
  "title": "Galaxy, Star, Cloud",
  "explanation": "...",
  "url": "https://apod...",
  "hdurl": "https://apod...",
  "media_type": "image",
  "copyright": "..."
}
```

### Rate Limits
- **DEMO_KEY**: 30 requests/hour
- **API Key**: 1000 requests/hour (free, just sign up)

### Fallback Strategy
```javascript
// Cache today's APOD, serve cached if API fails
const cached = db.get('SELECT * FROM apod WHERE date = ?', today);
if (cached) return cached;
// Show placeholder if no cache
```

---

## 4. Summary

| Source | Update Frequency | Our Polling | Fallback |
|--------|-----------------|-------------|----------|
| CelesTrak | ~2 hours | 15 min | Use cached TLE |
| JPL Horizons | N/A (static) | 1 hour | Use cached positions |
| NASA APOD | Daily | Daily | Show cached or placeholder |

---

## 5. Implementation Notes

### Sync Jobs (Simple Cron)

```bash
# crontab -e

# TLE sync every 15 minutes
*/15 * * * * cd /path/to/api && node src/jobs/sync-tle.js

# Ephemeris sync every hour
0 * * * * cd /path/to/api && node src/jobs/sync-ephemeris.js

# APOD sync daily at 8am
0 8 * * * cd /path/to/api && node src/jobs/sync-apod.js
```

### Error Handling
- Log all sync failures
- Don't crash if upstream API is down
- Always prefer stale cached data over no data
