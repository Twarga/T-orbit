# Cosmic Watch

Real-time satellite tracking mission control.

## Getting Started

```bash
# Install dependencies
npm install

# Start all apps
npm run dev

# Or start individual apps
npm run dev --workspace=@cosmic-watch/web    # Frontend on port 3000
npm run dev --workspace=@cosmic-watch/api     # API on port 4000
```

## Project Structure

```
cosmic-watch/
├── apps/
│   ├── web/           # React + Cesium mission UI
│   ├── api/           # Node.js API gateway
│   └── worker/        # Scheduled ingestion jobs
├── packages/
│   ├── core-types/    # Shared TypeScript types
│   ├── orbital-engine/ # SGP4 propagation
│   ├── validation/    # Zod schemas
│   └── observability/ # Logger/metrics
└── package.json       # Workspace root
```

## Tech Stack

- **Frontend**: React, Vite, CesiumJS
- **API**: Express, TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Infrastructure**: AWS (via Terraform)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# External APIs
CELESTRAK_URL=https://celestrak.org/...
JPL Horizons_URL=https:// Horizons-api.jpl.nasa.gov/...
NASA_APOD_URL=https://api.nasa.gov/planetary/apod
NASA_API_KEY=your_key
```
