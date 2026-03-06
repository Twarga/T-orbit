# Cosmic Watch - Start-to-MVP Task Assignment

## 1) Team Roles
- Architecture
- Frontend
- Backend
- Fullstack
- QA
- DevOps
- SecOps
- AI/ML
- Data

## 2) Planning Assumptions
- Timeline: 12 weeks (6 sprints, 2 weeks each)
- Method: Agile delivery with weekly architecture/security checkpoints
- Rule: Each task has exactly one primary owner

## 3) MVP Exit Criteria
- Live visualization of active satellites from fresh TLE data
- ISS highlighted with selectable telemetry panel
- Solar system navigator with Earth-to-planet distance
- SME panel with curated satellite metadata
- Production deployment with CI/CD, monitoring, and security gates

## 4) Sprint Plan
- Sprint 1: Project bootstrap, architecture, baseline risk controls
- Sprint 2: Infrastructure, CI/CD, security baseline
- Sprint 3: Data ingestion and storage foundation
- Sprint 4: Core backend APIs and contracts
- Sprint 5: Mission UI and feature integration
- Sprint 6: Hardening, release readiness, MVP launch

## 5) Task Backlog With Ownership

| ID | Task | Owner | Sprint | SP | Depends On | Done When |
|---|---|---|---|---:|---|---|
| CW-001 | Define MVP scope, NFRs, and explicit out-of-scope list | Architecture | 1 | 5 | - | Approved scope/NFR doc shared and signed off |
| CW-002 | Publish context/component/deployment architecture diagrams | Architecture | 1 | 5 | CW-001 | Diagrams in docs and reviewed by all leads |
| CW-003 | Initialize monorepo skeleton (`apps/web`, `apps/api`, `apps/worker`, `packages`) | Fullstack | 1 | 5 | CW-001 | Repo boots locally with baseline scripts |
| CW-004 | Create ADR set (stack, data, hosting, propagation strategy) | Architecture | 1 | 3 | CW-002 | ADR-001..ADR-008 created and accepted |
| CW-005 | Run STRIDE threat model and risk register kickoff | SecOps | 1 | 5 | CW-001 | Threat model + prioritized mitigations published |
| CW-006 | Define test strategy (unit/integration/e2e/perf/security) | QA | 1 | 3 | CW-001 | Test strategy and quality gates approved |
| CW-007 | Validate source contracts and limits for CelesTrak/JPL/APOD | Data | 1 | 3 | CW-001 | Source validation report and fallback rules documented |
| CW-008 | Define AI/ML scope for MVP (safe assistive features only) | AI/ML | 1 | 3 | CW-001 | AI/ML scope doc with success metrics approved |
| CW-009 | Produce UI information architecture and wireframes | Frontend | 1 | 5 | CW-001 | Wireframes for globe, panel, and navigator approved |
| CW-010 | Define backend domain boundaries and module ownership | Backend | 1 | 3 | CW-002 | Module map for satellite/solar/metadata/apod finalized |
| CW-011 | Create Terraform structure and remote state strategy | DevOps | 2 | 5 | CW-002 | IaC scaffold merged and state backend configured |
| CW-012 | Provision `dev` networking and baseline security groups | DevOps | 2 | 5 | CW-011 | `dev` network resources live and validated |
| CW-013 | Provision PostgreSQL with backups, encryption, and monitoring | DevOps | 2 | 5 | CW-011 | DB reachable from app network with backups enabled |
| CW-014 | Provision Redis, S3, and KMS keys for data/caching | DevOps | 2 | 5 | CW-011 | Cache/object store live with encryption settings |
| CW-015 | Implement PR CI workflow (lint, typecheck, unit tests, build) | DevOps | 2 | 5 | CW-003 | CI required checks pass and are branch-protected |
| CW-016 | Implement CD to `dev` using GitHub OIDC to cloud roles | DevOps | 2 | 5 | CW-015 | Merge to main deploys automatically to `dev` |
| CW-017 | Set secret management policy and rotation workflow | SecOps | 2 | 3 | CW-011 | Secrets policy enforced with no plaintext secrets |
| CW-018 | Add security gates (SAST, SCA, IaC, image scanning, SBOM) | SecOps | 2 | 5 | CW-015 | Pipeline blocks critical/high vulnerabilities |
| CW-019 | Configure API edge protections (WAF baseline, CORS, rate limits) | SecOps | 2 | 3 | CW-012 | Edge protection policies tested and active |
| CW-020 | Set logging/metrics/tracing baseline for all services | DevOps | 2 | 5 | CW-016 | Dashboards show service health and request traces |
| CW-021 | Design relational schema for satellites, TLE, ephemeris, metadata | Data | 3 | 5 | CW-010, CW-013 | Schema reviewed by backend and architecture |
| CW-022 | Implement DB migration framework and initial migrations | Backend | 3 | 3 | CW-021 | Migration commands work in CI and `dev` |
| CW-023 | Build CelesTrak client with retry, timeout, and backoff | Data | 3 | 5 | CW-007 | Robust client handles transient failures |
| CW-024 | Build TLE normalization and deduplication pipeline | Data | 3 | 5 | CW-023, CW-021 | Clean TLE rows stored with unique epoch constraints |
| CW-025 | Build JPL Horizons client and parser to state vectors | Data | 3 | 5 | CW-007 | Ephemeris payload parsed and persisted correctly |
| CW-026 | Build APOD ingestion and metadata/media capture | Backend | 3 | 3 | CW-007 | APOD daily record available via storage layer |
| CW-027 | Implement scheduled worker runtime for ingestion jobs | Backend | 3 | 3 | CW-003, CW-016 | Jobs run on schedule and emit structured logs |
| CW-028 | Add data quality checks (schema, ranges, epoch sanity) | Data | 3 | 3 | CW-024, CW-025 | Invalid records rejected and reason logged |
| CW-029 | Build sync-run audit logs and freshness metrics | Data | 3 | 3 | CW-024, CW-025, CW-026 | Freshness dashboard shows each source age |
| CW-030 | Materialize and serve hot cache for active satellite sets | Backend | 3 | 5 | CW-024, CW-014 | Cache-hit path works and latency target achievable |
| CW-031 | Build baseline mission-type classifier for unknown satellites | AI/ML | 3 | 5 | CW-024, CW-021 | Classifier outputs confidence + label candidates |
| CW-032 | Build analyst-facing metadata suggestion generator (human-in-loop) | AI/ML | 3 | 3 | CW-031 | Suggestions generated and stored as draft only |
| CW-033 | Scaffold API modules (`satellite`, `solar`, `metadata`, `apod`, `health`) | Backend | 4 | 5 | CW-010, CW-022 | API module structure and base handlers merged |
| CW-034 | Publish OpenAPI spec and request/response schema validation | Fullstack | 4 | 3 | CW-033 | OpenAPI generated and validated in CI |
| CW-035 | Implement `GET /api/v1/satellites/active` | Backend | 4 | 5 | CW-030, CW-033 | Endpoint returns active list with cache support |
| CW-036 | Implement `GET /api/v1/satellites/:noradId` | Backend | 4 | 3 | CW-033, CW-024 | Endpoint returns profile + latest TLE |
| CW-037 | Implement `GET /api/v1/satellites/:noradId/telemetry?at=` | Backend | 4 | 5 | CW-036 | Endpoint returns computed telemetry values |
| CW-038 | Implement `GET /api/v1/solar/bodies` and `/solar/positions` | Backend | 4 | 5 | CW-025, CW-033 | Solar endpoints return normalized body positions |
| CW-039 | Implement `GET /api/v1/solar/distance` | Backend | 4 | 3 | CW-038 | Distance endpoint returns km in consistent frame |
| CW-040 | Implement protected `PUT /api/v1/metadata/satellites/:noradId` | Fullstack | 4 | 3 | CW-033, CW-032 | Authorized metadata updates persist with audit trail |
| CW-041 | Add ETag, pagination limits, and cache headers for read APIs | Fullstack | 4 | 3 | CW-035, CW-038 | API response caching behavior verified |
| CW-042 | Implement authn/authz controls for protected routes | SecOps | 4 | 5 | CW-040, CW-017 | Protected endpoints reject unauthorized access |
| CW-043 | Bootstrap React mission app shell and app state layers | Frontend | 5 | 5 | CW-003, CW-009 | Web app runs with environment-driven config |
| CW-044 | Integrate Cesium globe, Earth layers, and camera presets | Frontend | 5 | 8 | CW-043 | Globe renders correctly with baseline controls |
| CW-045 | Build Web Worker bridge for `satellite.js` propagation loop | Frontend | 5 | 8 | CW-044, CW-035 | Propagation off main thread with stable FPS |
| CW-046 | Render active satellite layer with clustering/LOD controls | Frontend | 5 | 5 | CW-045 | 10k+ objects display with usable interaction |
| CW-047 | Implement object selection, highlighting, and focus behavior | Frontend | 5 | 3 | CW-046 | Clicking object updates selection state reliably |
| CW-048 | Build SME sidebar using API metadata and telemetry endpoints | Fullstack | 5 | 5 | CW-036, CW-037, CW-047 | Sidebar shows owner/mission/altitude/velocity |
| CW-049 | Implement ISS special mode (model, trail, one-click focus) | Frontend | 5 | 3 | CW-046, CW-047 | ISS has distinct rendering and fast navigation |
| CW-050 | Build solar system navigator and fly-to interactions | Frontend | 5 | 5 | CW-038, CW-044 | User can jump to body targets from controls |
| CW-051 | Integrate AI/ML draft suggestions into analyst review flow | AI/ML | 5 | 5 | CW-032, CW-040 | Suggestions visible but require human approval |
| CW-052 | Implement Earth-to-selected-body live distance display | Frontend | 5 | 3 | CW-039, CW-050 | Distance updates correctly in km at current time |
| CW-053 | Integrate APOD splash module and fallback behavior | Frontend | 5 | 3 | CW-026, CW-043 | APOD card loads with graceful fallback |
| CW-054 | Run responsive and accessibility compliance pass | Frontend | 5 | 3 | CW-048, CW-050 | Keyboard nav and core WCAG checks pass |
| CW-055 | Build unit test suites for API/worker/core packages | QA | 6 | 5 | CW-033, CW-027 | Coverage target met for critical modules |
| CW-056 | Build integration tests for DB/cache/ingestion pipelines | QA | 6 | 5 | CW-024, CW-030, CW-038 | Integration suite green in CI |
| CW-057 | Build E2E flows (open app, track ISS, open panel, fly to Mars) | QA | 6 | 5 | CW-049, CW-050, CW-052 | E2E smoke and regression suites stable |
| CW-058 | Execute load tests and tune API/cache thresholds | QA | 6 | 5 | CW-041, CW-056 | p95/p99 targets verified under expected load |
| CW-059 | Optimize frontend performance for 10k-20k entity rendering | Frontend | 6 | 5 | CW-046, CW-058 | Frame drops reduced; target interaction quality met |
| CW-060 | Run DAST + manual security validation and remediation cycle | SecOps | 6 | 5 | CW-042, CW-054 | No open critical/high security findings |
| CW-061 | Run incident game-day drills and finalize runbooks | DevOps | 6 | 3 | CW-020, CW-060 | Runbooks validated with drill evidence |
| CW-062 | Validate data outputs against known authoritative samples | Data | 6 | 3 | CW-029, CW-038 | Data quality report signed off |
| CW-063 | Evaluate AI/ML precision/recall and set production thresholds | AI/ML | 6 | 3 | CW-051, CW-062 | Model thresholds documented and accepted |
| CW-064 | Define go/no-go checklist and release acceptance criteria | Architecture | 6 | 3 | CW-061, CW-062, CW-063 | Release checklist approved by leads |
| CW-065 | Execute staging dress rehearsal and rollback test | DevOps | 6 | 3 | CW-064 | Rehearsal completed with verified rollback |
| CW-066 | Finalize SLO dashboards, alerts, and on-call routing | DevOps | 6 | 3 | CW-065 | Alerting and escalation tested end-to-end |
| CW-067 | Cut release branch, lock MVP scope, publish release notes | Fullstack | 6 | 2 | CW-064 | Scope freeze and release notes complete |
| CW-068 | Deploy MVP to production with phased traffic ramp | DevOps | 6 | 5 | CW-066, CW-067 | Production release healthy through ramp window |
| CW-069 | Run 7-day hypercare triage and defect burn-down | Fullstack | 6 | 3 | CW-068 | P0/P1 launch defects resolved or mitigated |
| CW-070 | Run post-launch retrospective and create MVP+1 backlog | Architecture | 6 | 3 | CW-069 | Retro outcomes and next backlog prioritized |

## 6) Workload Summary
- Architecture: CW-001, CW-002, CW-004, CW-064, CW-070
- Frontend: CW-009, CW-043, CW-044, CW-045, CW-046, CW-047, CW-049, CW-050, CW-052, CW-053, CW-054, CW-059
- Backend: CW-010, CW-022, CW-026, CW-027, CW-030, CW-033, CW-035, CW-036, CW-037, CW-038, CW-039
- Fullstack: CW-003, CW-034, CW-040, CW-041, CW-048, CW-067, CW-069
- QA: CW-006, CW-055, CW-056, CW-057, CW-058
- DevOps: CW-011, CW-012, CW-013, CW-014, CW-015, CW-016, CW-020, CW-061, CW-065, CW-066, CW-068
- SecOps: CW-005, CW-017, CW-018, CW-019, CW-042, CW-060
- AI/ML: CW-008, CW-031, CW-032, CW-051, CW-063
- Data: CW-007, CW-021, CW-023, CW-024, CW-025, CW-028, CW-029, CW-062

## 7) Immediate Start (Next 5 Working Days)
1. Start CW-001 to CW-010 in parallel by owner.
2. Complete CW-011, CW-015, CW-017 first in Sprint 2 to unblock all engineering streams.
3. Hold architecture + security checkpoint before Sprint 3 commitment.
