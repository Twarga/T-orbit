# Cosmic Watch - Start-to-MVP Task Assignment

## 1) Team Roles
- Architecture
- Frontend
- Backend
- Fullstack

## 2) Planning Assumptions
- Timeline: 8 weeks (4 sprints, 2 weeks each)
- Method: Simple agile with weekly check-ins
- Single VPS deployment (RackNerd)
- Simple stack: SQLite + Node.js + Caddy

## 3) MVP Exit Criteria
- Live visualization of active satellites from fresh TLE data
- ISS highlighted with selectable telemetry panel
- Solar system navigator with Earth-to-planet distance
- SME panel with curated satellite metadata
- Production deployment on single VPS

## 4) Sprint Plan
- Sprint 1: Project bootstrap, architecture, simple infrastructure
- Sprint 2: Data ingestion and storage (SQLite)
- Sprint 3: Core backend APIs  
- Sprint 4: Mission UI and MVP launch

Note: NASA APOD moved to post-MVP feature

## 5) Task Backlog With Ownership

| ID | Task | Owner | Sprint | SP | Depends On | Status |
|---|---|---|---|---:|---|---|
| CW-001 | Define MVP scope, NFRs, and explicit out-of-scope list | Architecture | 1 | 5 | - | ✅ Done |
| CW-002 | Publish architecture diagrams (simplified) | Architecture | 1 | 3 | CW-001 | ✅ Done |
| CW-003 | Initialize monorepo skeleton | Fullstack | 1 | 5 | CW-001 | ✅ Done |
| CW-004 | Create ADR set (simplified stack) | Architecture | 1 | 3 | CW-002 | ✅ Done |
| CW-005 | Define test strategy (simple) | Backend | 1 | 2 | CW-001 | ✅ Done |
| CW-006 | Validate source APIs (CelesTrak, JPL) | Backend | 1 | 3 | CW-001 | ✅ Done |
| CW-007 | Design SQLite schema for satellites/TLE/ephemeris | Backend | 2 | 3 | CW-003 | ✅ Done |
| CW-008 | Build TLE ingestion pipeline | Backend | 2 | 5 | CW-006 | ✅ Done |
| CW-009 | Build ephemeris ingestion pipeline | Backend | 2 | 5 | CW-006 | |
| CW-010 | Implement scheduled jobs runtime | Backend | 2 | 3 | CW-003 | |
| CW-011 | Build satellite API endpoints | Backend | 3 | 5 | CW-007 | |
| CW-012 | Build solar system API endpoints | Backend | 3 | 3 | CW-007 | |
| CW-013 | Build metadata API endpoints | Backend | 3 | 3 | CW-007 | |
| CW-014 | Bootstrap React + Cesium app | Frontend | 4 | 5 | CW-003 | |
| CW-015 | Implement satellite rendering layer | Frontend | 4 | 8 | CW-014 | |
| CW-016 | Implement Web Worker SGP4 propagation | Frontend | 4 | 5 | CW-015 | |
| CW-017 | Implement ISS focus mode | Frontend | 4 | 3 | CW-015 | |
| CW-018 | Build solar system navigator | Frontend | 4 | 5 | CW-012 | |
| CW-019 | Build SME sidebar panel | Frontend | 4 | 3 | CW-013 | |
| CW-020 | Configure Caddy for production | Fullstack | 4 | 3 | CW-010 | |
| CW-021 | Deploy to VPS and verify | Fullstack | 4 | 3 | CW-020 | |

## 6) Simple Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Database | SQLite | Simple, file-based, no setup |
| Backend | Node.js + Express | Same language as frontend |
| Frontend | React + Vite | Fast dev, modern DX |
| Globe | CesiumJS | Best for orbital visualization |
| Propagation | satellite.js | Standard JS SGP4 |
| Server | Node.js + Caddy | Reverse proxy + HTTPS |
| Hosting | Single VPS (RackNerd) | $10-15/year |

## 7) Architecture (Simplified)

```
┌─────────────────────────────────────────┐
│              RackNerd VPS               │
│  ┌─────────────────────────────────┐   │
│  │           Caddy                 │   │
│  │      (Reverse Proxy + HTTPS)    │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │         Node.js API              │   │
│  │   (Express + better-sqlite3)    │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │          SQLite                  │   │
│  │   (satellites, TLE, ephemeris) │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         User Browser                    │
│  ┌─────────────────────────────────┐   │
│  │   React + Cesium + Web Worker   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 8) Out-of-Scope (Hobby Project)
- No AWS / cloud complexity
- No Redis (SQLite is fast enough)
- No PostgreSQL (SQLite simpler)
- No Docker/Kubernetes
- No complex CI/CD
- No microservices
- No user accounts/auth (public only for MVP)
- No mobile app

## 9) Immediate Start (Next 5 Days)
1. CW-001 to CW-004 (Sprint 1 foundation)
2. Design simple SQLite schema (CW-007)
3. Start ingestion pipeline (CW-008)
