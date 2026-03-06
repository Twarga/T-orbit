# Cosmic Watch - Architecture (Simplified)

**Project:** Hobby project - Single VPS  
**Stack:** SQLite + Node.js + React + CesiumJS + Caddy

---

## Simple Architecture

```
                    ┌─────────────────┐
                    │   User Browser  │
                    └────────┬────────┘
                             │
                             ▼ (HTTPS)
                    ┌─────────────────┐
                    │  Caddy Server   │
                    │ (RackNerd VPS) │
                    │  :443 → :3000  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Node.js API    │
                    │   Express       │
                    │   localhost     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │ SQLite   │  │  Cron    │  │  S3/FS   │
       │ Database │  │  Jobs    │  │  Assets  │
       └──────────┘  └──────────┘  └──────────┘
```

## Data Flow

```
CelesTrak API ──► Cron Job ──► SQLite DB ──► API ──► React ──► Cesium
JPL Horizons  ──► (runs hourly)                (read)              │
NASA APOD     ──►                                           Web Worker
                                                                   │
                                                              satellite.js
```

## File Structure

```
/home/cosmic-watch/
├── apps/
│   ├── web/           # React frontend (builds to dist/)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── pages/
│   │   └── dist/     # Static files
│   └── api/           # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   └── db/
│       └── data/      # SQLite database
├── packages/           # Shared code
└── package.json
```

## VPS Specs

| Item | Details |
|------|---------|
| Provider | RackNerd |
| Spec | 2GB RAM, 2 CPU, 50GB SSD |
| OS | Ubuntu 22.04 |
| Cost | ~$15/year |

## Cron Jobs (Simple)

```bash
# crontab -e
*/15 * * * * cd /home/cosmic-watch && node apps/api/src/jobs/sync-tle.js
0 * * * * cd /home/cosmic-watch && node apps/api/src/jobs/sync-ephemeris.js
0 8 * * * cd /home/cosmic-watch && node apps/api/src/jobs/sync-apod.js
```

## Production Run

```bash
# Using PM2
pm2 start ecosystem.config.js
pm2 save

# Auto-restart on reboot
pm2 startup
```
