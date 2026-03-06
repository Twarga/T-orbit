# Cosmic Watch 🌌

Real-time satellite tracking dashboard. Simple hobby project.

## Quick Start

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build
```

## Stack

- **Frontend**: React + Vite + CesiumJS
- **Backend**: Node.js + Express + SQLite
- **Server**: Caddy (reverse proxy + HTTPS)
- **Hosting**: Single VPS (RackNerd)

## Deployment

```bash
# Build
npm run build

# Run with PM2
pm2 start ecosystem.config.js

# Caddy handles HTTPS automatically
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/satellites/active` | All active satellites with TLE |
| `GET /api/satellites/:noradId` | Single satellite details |
| `GET /api/solar/bodies` | Solar system bodies |
| `GET /api/solar/positions` | Current positions |
| `GET /api/apod/today` | NASA picture of the day |

## Development

```bash
# Frontend only
npm run dev --workspace=@cosmic-watch/web

# API only
npm run dev --workspace=@cosmic-watch/api
```

## License

MIT
