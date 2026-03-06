# MVP Scope, NFRs, and Out-of-Scope List

**Document ID:** CW-001  
**Project:** Cosmic Watch (Geospatial Digital Twin Mission Control)  
**Version:** 1.0  
**Status:** Draft - Awaiting Review  
**Date:** 2026-03-06  
**Owner:** Architecture Team

---

## 1. MVP Scope Definition

### 1.1 Problem Statement
Build an accurate, secure, and scalable digital twin of near-Earth orbit + solar system context for real-time situational awareness. Cosmic Watch delivers professional-grade orbital visualization that updates in near real-time, enabling expert and non-expert users to inspect satellites and understand mission context quickly.

### 1.2 Target Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| Space Enthusiasts | Amateur astronomers, hobbyists | Easy-to-understand satellite tracking, ISS focus |
| Amateur Satellite Trackers | Hobbyists tracking passes | Real-time position, altitude, velocity data |
| Educators | Teachers, students | Educational context, solar system exploration |
| Data Analysts | Junior analysts | Curated metadata, satellite information |

### 1.3 Core Features (Must Have - P0)

| Feature ID | Feature | Description | Success Criteria |
|------------|---------|-------------|------------------|
| F-001 | 3D Globe Visualization | CesiumJS-powered Earth with orbital tracks | Globe loads within 3s, renders 10,000+ satellites |
| F-002 | Live Active Satellites | Active satellites from CelesTrak with SGP4 propagation | Data fresh within 20 min, smooth 60fps rendering |
| F-003 | ISS Highlight & Telemetry | ISS model with focused telemetry card | ISS visually distinct, clickable, shows live data |
| F-004 | Solar System Navigator | Sun/Moon/planets with fly-to navigation | All 8 planets navigable, smooth camera transitions |
| F-005 | Earth-to-Planet Distance | Live distance calculator | Accurate km display, updates in real-time |
| F-006 | SME Metadata Panel | Satellite metadata (owner, mission type, altitude, velocity) | All active satellites display available metadata |
| F-007 | APOD Splash Module | NASA Astronomy Picture of the Day integration | Daily image loads, graceful fallback |
| F-008 | Backend API Gateway | REST API for satellite, solar, metadata, APOD endpoints | p95 latency <250ms, 99.9% availability |
| F-009 | Production Deployment | CI/CD, security, observability | All SLOs met, monitoring active |

### 1.4 Nice-to-Have Features (P1 - Should Have)

| Feature ID | Feature | Description | Priority |
|------------|---------|-------------|----------|
| S-001 | Satellite Search | Search by name, NORAD ID, or operator | P1 |
| S-002 | Satellite Clustering | Group satellites at zoom levels for performance | P1 |
| S-003 | Day/Night Terminator | Visual day/night overlay on globe | P2 |
| S-004 | Ground Station Overlay | Show major ground station locations | P2 |

### 1.5 Future Features (Won't Have - Post-MVP v1)

| Feature ID | Feature | Description | Target Release |
|------------|---------|-------------|----------------|
| V2-001 | User Accounts | Authentication, saved views, RBAC dashboards | v2.0 |
| V2-002 | Historical Replay | Timeline replay over months/years | v2.0 |
| V2-003 | Collision Risk Analytics | Conjunction analysis and alerts | v2.0 |
| V2-004 | Satellite Maneuver Detection | Anomaly detection for orbit changes | v2.0 |
| V2-005 | Mobile Native App | iOS/Android native applications | v2.0 |
| V2-006 | Advanced Analytics Dashboard | Charts, trends, statistics | v2.0 |

---

## 2. Non-Functional Requirements (NFRs)

### 2.1 Performance

| Metric | Target | Measurement Method | Notes |
|--------|--------|-------------------|-------|
| Page Load Time | < 3s (P95) | Synthetic monitoring | First meaningful paint |
| Globe Initial Render | < 5s (P95) | RUM telemetry | Cesium scene ready |
| API Response Time | < 250ms (P95) | Application metrics | Cached endpoints |
| Web Worker Propagation | < 100ms (P95) | Browser metrics | For 10,000 objects |
| Frame Rate | 60 fps (median) | RUM telemetry | On modern desktop |
| Concurrent Users | 300 | Load testing | Minimum for launch |

### 2.2 Scalability

| Metric | Initial | 6 Months | 1 Year |
|--------|---------|----------|--------|
| Monthly Active Users (MAU) | 5,000 | 20,000 | 50,000 |
| Daily Active Users (DAU) | 500 | 2,000 | 5,000 |
| Peak Concurrent Users | 100 | 300 | 1,000 |
| Satellite Objects Rendered | 10,000 | 15,000 | 20,000 |
| Data Storage | 50 GB | 100 GB | 200 GB |
| API Requests per Second | 50 | 150 | 300 |

### 2.3 Availability & Reliability

| Metric | Target | Rationale |
|--------|--------|-----------|
| Uptime | 99.9% (8.76h downtime/year) | Public dashboard SLO |
| Scheduled Maintenance | < 4h/month | Off-peak hours only |
| RTO (Recovery Time Objective) | 4 hours | Maximum acceptable downtime |
| RPO (Recovery Point Objective) | 1 hour | Maximum data loss |
| Error Rate | < 0.1% | Application errors only |
| TLE Freshness | < 20 minutes | Data age threshold |
| APOD Freshness | < 24 hours | Daily content |

### 2.4 Data Ingestion

| Metric | Target | Measurement |
|--------|--------|-------------|
| CelesTrak Sync Interval | 5-15 minutes | Scheduled job frequency |
| JPL Horizons Sync Interval | 1 hour | Scheduled job frequency |
| APOD Sync Interval | Daily | Scheduled job frequency |
| Sync Success Rate | > 99% | Audit log metrics |

### 2.5 Security

| Requirement | Implementation | Notes |
|-------------|----------------|-------|
| Authentication | OAuth 2.0 / JWT | For protected endpoints only |
| Authorization | RBAC (Role-Based) | Admin, Editor, Viewer roles |
| Data Encryption at Rest | AES-256 | RDS, Redis, S3 |
| Data Encryption in Transit | TLS 1.3 | All API communications |
| Input Validation | Zod/Joi | All API endpoints |
| Rate Limiting | 100 req/min per IP | Public endpoints |
| CORS | Strict allowlist | Configured per environment |
| Security Headers | Helmet + CSP | Nonce-based CSP |
| Dependency Scanning | npm audit / Snyk | CI gate |
| Container Scanning | Trivy/Grype | CI gate |
| IaC Scanning | Checkov | Terraform validation |

### 2.6 Browser/Device Support

| Platform | Support Level | Versions |
|----------|--------------|----------|
| Chrome | Full | Last 2 versions |
| Firefox | Full | Last 2 versions |
| Safari | Full | Last 2 versions |
| Edge | Full | Last 2 versions |
| Mobile Web | Basic | iOS Safari, Chrome Android |
| IE 11 | Not supported | - |

### 2.7 Operational

| Requirement | Target |
|-------------|--------|
| Deployment Frequency | On-demand (CI trigger) |
| Deployment Downtime | Zero-downtime (blue-green) |
| Monitoring Coverage | 100% of critical paths |
| Alert Response Time | < 15 minutes (P1) |
| Documentation | All public APIs documented |
| Runbooks | All critical systems |

---

## 3. Explicit Out-of-Scope List

### 3.1 Features Out of Scope

| Feature | Reason | Future Consideration |
|---------|--------|---------------------|
| User authentication/accounts | MVP focuses on public read-only access | v2.0 with RBAC |
| Saved views/bookmarks | User personalization not MVP | v2.0 |
| Historical replay timeline | Complex feature, adds scope | v2.0 |
| Collision risk analytics | Advanced analysis beyond MVP | v2.0 |
| Satellite maneuver detection | Requires ML/proprietary data | v2.0 |
| Mobile native apps (iOS/Android) | Web-first strategy | v2.0 |
| Third-party integrations | Beyond auth (NASA APIs are data sources, not integrations) | Phase 2 |
| Real-time notifications | WebSocket not MVP scope | Future |

### 3.2 Technical Out of Scope

| Item | Status | Rationale |
|------|--------|-----------|
| Multi-region deployment | MVP Only | Single region sufficient for initial launch |
| WebSocket/Server-Sent Events | MVP Only | Polling acceptable for v1 |
| GraphQL API | MVP Only | REST sufficient for MVP |
| Advanced analytics dashboard | Post-MVP | Basic reporting only for MVP |
| Machine learning/AI features | Limited Scope | Classifier for satellite types only |
| Automated testing >80% | Stretch goal | 60% minimum for MVP |
| Multi-language support | MVP Only | English only for v1 |
| Offline support/PWA | MVP Only | Online-only for v1 |

### 3.3 Scale Out of Scope

| Limitation | Value | When It Changes |
|------------|-------|-----------------|
| Maximum concurrent users | 300 | v2 planning |
| Maximum satellite objects | 20,000 | Performance tuning |
| Maximum API requests/sec | 100 | v2 planning |
| Maximum data storage | 200 GB | When approaching 80% |

---

## 4. Assumptions & Dependencies

### 4.1 Assumptions

1. **Upstream Data Availability**: CelesTrak, JPL Horizons, and NASA APOD APIs remain accessible and maintain their current rate limits
2. **Browser Performance**: Target users have modern browsers capable of WebGL rendering
3. **Network Connectivity**: Users have stable internet for real-time updates
4. **TLE Accuracy**: SGP4 propagation provides sufficient accuracy for visualization purposes (not physics-grade predictions)
5. **Team Size**: Small team (2-4 engineers) can maintain monolith pace

### 4.2 External Dependencies

| Dependency | Owner | Status | Risk Level | Fallback |
|------------|-------|--------|------------|----------|
| CelesTrak API | CelesTrak | Active | Medium | Cache last known good, show stale warning |
| JPL Horizons API | NASA/JPL | Active | Medium | Cache last known good snapshot |
| NASA APOD API | NASA | Active | Low | Show placeholder/cached image |
| CesiumJS | Cesium | Active | Low | Well-maintained open source |
| satellite.js | External | Active | Low | Well-maintained, browser-based propagation |

### 4.3 Internal Dependencies

| Dependency | Owner | Status | Risk Level |
|------------|-------|--------|------------|
| CW-003: Monorepo skeleton | Fullstack | Blocked by CW-001 | High |
| CW-002: Architecture diagrams | Architecture | Blocked by CW-001 | High |
| CW-004: ADR set | Architecture | Blocked by CW-001 | Medium |

---

## 5. Success Criteria

### 5.1 Launch Criteria

- [ ] All P0 features complete and tested
- [ ] All P1 NFRs met (performance, availability, security)
- [ ] Security review passed (SAST, SCA, DAST)
- [ ] Performance testing passed (load test at 300 concurrent users)
- [ ] Documentation complete (API docs, runbooks)
- [ ] Monitoring and alerting configured
- [ ] Rollback plan tested
- [ ] SLO dashboards operational

### 5.2 MVP Success Metrics (30 days post-launch)

| Metric | Target |
|--------|--------|
| User adoption | 1,000 signups |
| Daily active users | 200 DAU |
| Error rate | < 0.5% |
| TLE data freshness | < 20 minutes (95%) |
| Customer satisfaction | > 4.0/5 |
| System uptime | > 99.5% |
| Page load time | < 3s P95 |

---

## 6. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Engineering Lead | | | |
| Architecture | | | |
| Security Review | | | |
| Stakeholder | | | |

---

## Appendix A: Glossary

- **APOD**: Astronomy Picture of the Day (NASA)
- **CesiumJS**: Open-source 3D globe and map engine
- **CelesTrak**: Source for satellite TLE data
- **JPL Horizons**: NASA Jet Propulsion Laboratory ephemeris system
- **MAU**: Monthly Active Users
- **MVP**: Minimum Viable Product
- **NFR**: Non-Functional Requirements
- **NORAD**: North American Aerospace Defense Command (satellite catalog)
- **RPO**: Recovery Point Objective
- **RTO**: Recovery Time Objective
- **SGP4**: Simplified General Perturbations (satellite orbit propagation)
- **SLO**: Service Level Objective
- **TLE**: Two-Line Element (satellite orbital data)
- **Web Worker**: Browser background thread for computation

## Appendix B: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-06 | Architecture | Initial draft based on plan.md and tasks.md |
