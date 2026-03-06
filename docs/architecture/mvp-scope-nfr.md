# MVP Scope, NFRs, and Out-of-Scope List

**Document ID:** CW-001  
**Project:** Cosmic Watch (Hobby Project - Single VPS)  
**Version:** 2.0 (Simplified)  
**Status:** Approved  
**Date:** 2026-03-06

---

## 1. MVP Scope Definition

### 1.1 Problem Statement
Build a real-time satellite tracking dashboard for space enthusiasts. Single hobby project, deploy on RackNerd VPS with simple stack.

### 1.2 Target Users
- Space enthusiasts
- Amateur satellite trackers
- Anyone curious about what's orbiting Earth

### 1.3 Core Features (P0)

| Feature | Description |
|---------|-------------|
| F-001 | 3D Globe with CesiumJS |
| F-002 | Live satellite tracking (10,000+ objects) |
| F-003 | ISS highlighted with telemetry |
| F-004 | Solar system navigator |
| F-005 | Earth-to-planet distance |
| F-006 | SME metadata panel |
| F-007 | APOD splash |

---

## 2. Simple Stack

| Component | Technology |
|-----------|------------|
| **VPS** | RackNerd ($10-15/year) |
| **OS** | Ubuntu 22.04 |
| **Web Server** | Caddy (auto HTTPS) |
| **Backend** | Node.js + Express |
| **Database** | SQLite (better-sqlite3) |
| **Frontend** | React + Vite |
| **Globe** | CesiumJS |
| **Propagation** | satellite.js in Web Worker |

---

## 3. Non-Functional Requirements (Simplified)

### Performance
| Metric | Target |
|--------|--------|
| Page load | < 5s |
| API response | < 500ms |
| Globe render | < 3s |

### Availability
| Metric | Target |
|--------|--------|
| Uptime | 99% (occasional restarts OK) |
| Backup | Daily SQLite copy to S3 |

### Security
- Caddy with Let's Encrypt (auto HTTPS)
- No user authentication (public site)
- Basic rate limiting in Caddy

---

## 4. Out of Scope

### Features
- User accounts / authentication
- Saved views / bookmarks
- Historical replay
- Collision analytics
- Mobile app

### Tech (Not Using)
- ❌ AWS / Cloudflare
- ❌ PostgreSQL
- ❌ Redis
- ❌ Docker / Kubernetes
- ❌ Complex CI/CD
- ❌ Microservices
- ❌ GraphQL
- ❌ WebSockets (polling OK)

---

## 5. Deployment

### Single VPS Setup
```bash
# On RackNerd VPS (Ubuntu 22.04)

# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# 2. Clone and setup
git clone https://github.com/yourusername/cosmic-watch.git
cd cosmic-watch
npm install

# 3. Build
npm run build

# 4. Run with PM2
pm2 start ecosystem.config.js

# 5. Caddy handles reverse proxy + HTTPS
```

### Caddyfile
```
cosmic-watch.yourdomain.com {
    reverse_proxy localhost:3000
    encode gzip
}
```

---

## 6. Data Sources

| Source | Purpose | Rate Limit |
|--------|---------|------------|
| CelesTrak | TLE data | ~15 min refresh |
| JPL Horizons | Ephemeris | ~1 hour |
| NASA APOD | Daily image | 1/day |

---

## Success Criteria
- [ ] Satellites render on 3D globe
- [ ] ISS is clickable with live data
- [ ] Can navigate to planets
- [ ] Works on mobile browser
- [ ] Deployable on single VPS
