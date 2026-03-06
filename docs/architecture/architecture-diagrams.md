# Cosmic Watch - Architecture Diagrams

**Document ID:** CW-002  
**Related:** CW-001 (MVP Scope & NFRs)  
**Status:** Draft - Ready for Review  
**Date:** 2026-03-06

---

## 1. System Context Diagram

### 1.1 High-Level Context

```mermaid
graph TD
    subgraph External_Systems
        CT[CelesTrak API]
        JPL[JPL Horizons API]
        APOD[NASA APOD API]
    end
    
    subgraph Cosmic_Watch
        FE[Mission Control UI]
        API[API Gateway]
        WK[Web Worker<br/>satellite.js]
        CZ[CesiumJS Viewer]
        
        subgraph Backend
            ING[Ingestion Jobs]
            SAT[Satellite Module]
            EPH[Ephemeris Module]
            META[SME Metadata Module]
            APODM[APOD Module]
        end
        
        subgraph Data_Layer
            REDIS[(Redis Cache)]
            PG[(PostgreSQL)]
            S3[(S3 Object Storage)]
        end
    end
    
    USERS[Users / Public Visitors]
    ANALYST[Data Analysts<br/>Internal]
    
    USERS --> FE
    ANALYST --> API
    
    FE --> CZ
    FE --> WK
    FE --> API
    
    API --> SAT
    API --> EPH
    API --> META
    API --> APODM
    
    SAT --> PG
    SAT --> REDIS
    EPH --> PG
    EPH --> REDIS
    META --> PG
    APODM --> S3
    
    ING --> CT
    ING --> JPL
    ING --> APOD
    ING --> PG
    ING --> REDIS
    ING --> S3
```

### 1.2 External Data Sources

| Source | Purpose | Data Type |
|--------|---------|-----------|
| CelesTrak | Active satellite TLE data | Two-line elements |
| JPL Horizons | Solar system ephemeris | Position/velocity vectors |
| NASA APOD | Astronomy picture of the day | Image + metadata |

---

## 2. Component Diagram (Backend Modules)

### 2.1 API Gateway Modules

```mermaid
graph LR
    GW[API Gateway<br/>: Express/Node.js] --> SAT[Satellite<br/>Module]
    GW --> EPH[Ephemeris<br/>Module]
    GW --> META[Metadata<br/>Module]
    GW --> APODM[APOD<br/>Module]
    GW --> HEALTH[Health<br/>Module]
    
    SAT --> PG[(PostgreSQL)]
    SAT --> REDIS[(Redis)]
    EPH --> PG
    EPH --> REDIS
    META --> PG
    APODM --> S3[(S3)]
```

### 2.2 Module Responsibilities

| Module | Responsibility | Key Endpoints |
|--------|---------------|---------------|
| **Satellite** | TLE data, active satellite list, telemetry | `/satellites/active`, `/satellites/:noradId`, `/satellites/:noradId/telemetry` |
| **Ephemeris** | Solar system bodies, positions, distances | `/solar/bodies`, `/solar/positions`, `/solar/distance` |
| **Metadata** | SME-curated satellite info | `/metadata/satellites/:noradId`, PUT for updates |
| **APOD** | NASA picture of the day | `/apod/today` |
| **Health** | Liveness/readiness checks | `/health/live`, `/health/ready` |

---

## 3. Data Flow Diagram (Satellite Tracking)

### 3.1 Ingestion Flow

```mermaid
sequenceDiagram
    participant Cron as Scheduler
    participant Ingest as TLE Ingestion Job
    participant Cel as CelesTrak
    participant DB as PostgreSQL
    participant Cache as Redis
    participant FE as Browser Frontend
    participant Worker as Web Worker (SGP4)

    Cron->>Ingest: Trigger every 5-15 min
    Ingest->>Cel: GET ACTIVE TLE JSON
    Cel-->>Ingest: TLE payload (10k+ satellites)
    Ingest->>DB: Upsert satellites + TLE set
    Ingest->>Cache: Refresh hot cache

    Note over FE,Worker: Client-side propagation
    FE->>Cache: API fetch current TLE dataset
    Cache-->>FE: Cached dataset
    FE->>Worker: Send TLE + current UTC
    Worker->>Worker: SGP4 propagation
    Worker-->>FE: lat/lon/alt/velocity vectors
    FE->>FE: Render Cesium entities
```

### 3.2 API Request Flow

```mermaid
sequenceDiagram
    participant User as User Browser
    participant LB as Load Balancer
    participant API as API Gateway
    participant Cache as Redis
    participant DB as PostgreSQL

    User->>LB: GET /api/v1/satellites/active
    LB->>API: Forward request
    API->>Cache: Check cache (ETag)
    
    alt Cache Hit
        Cache-->>API: Cached response
        API-->>User: 304 Not Modified + headers
    else Cache Miss
        API->>DB: Query active satellites
        DB-->>API: Satellite data
        API->>Cache: Store in cache
        API-->>User: 200 OK + JSON + ETag
    end
```

---

## 4. Deployment Topology

### 4.1 Infrastructure Diagram

```mermaid
graph TD
    GH[GitHub Actions] --> ECR[ECR Images]
    GH --> TF[Terraform Apply]

    subgraph AWS_Cloud
        subgraph VPC
            ALB[ALB / API Gateway]
            ECS[ECS Fargate<br/>API Service]
            WKR[ECS Scheduled<br/>Workers]
            RDS[(RDS PostgreSQL<br/>Multi-AZ)]
            REDIS[(ElastiCache<br/>Redis Cluster)]
            S3[(S3 Bucket)]
        end
        
        subgraph Security
            WAF[WAF v2]
            IAM[IAM Roles<br/>OIDC]
            KMS[KMS Keys]
        end
        
        subgraph Observability
            CW[CloudWatch]
            XR[X-Ray]
            SH[Security Hub]
        end
    end

    FEV[Vercel / CloudFront<br/>Frontend CDN]
    USERS[Internet Users]

    GH --> ECR
    GH --> TF
    TF --> VPC
    TF --> Security
    
    FEV --> WAF
    FEV --> ALB
    USERS --> FEV
    
    ALB --> ECS
    ECS --> RDS
    ECS --> REDIS
    ECS --> S3
    WKR --> RDS
    WKR --> REDIS
    WKR --> S3
    
    ECS --> CW
    ECS --> XR
    WKR --> CW
    SH --> ECS
    SH --> WKR
```

### 4.2 Environment Strategy

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| `dev` | Development testing | Single AZ, minimal scaling, relaxed security |
| `staging` | Release candidate testing | Production-like, reduced capacity |
| `prod` | Production traffic | Multi-AZ, full security, autoscaling |

---

## 5. Security Architecture

### 5.1 Security Layers

```mermaid
graph TB
    subgraph Edge
        WAF[WAF v2 Rules]
        DDOS[AWS Shield]
        CORS[CORS Allowlist]
    end
    
    subgraph Application
        AUTH[JWT Auth]
        RATE[Rate Limiting<br/>100 req/min]
        VALID[Input Validation<br/>Zod/Joi]
        HEADERS[Helmet + CSP]
    end
    
    subgraph Data
        TLS[TLS 1.3]
        ENC[Encryption at Rest<br/>AES-256]
        KMS[KMX Key Management]
    end
    
    subgraph Supply_Chain
        SAST[SAST Scan]
        SCA[SCA / Dependency]
        CONTAINER[Container Scan]
        SBOM[SBOM Generation]
    end
    
    USER[User Request] --> WAF
    WAF --> DDOS
    DDOS --> CORS
    CORS --> AUTH
    AUTH --> RATE
    RATE --> VALID
    VALID --> HEADERS
    HEADERS --> TLS
    TLS --> ENC
    ENC --> KMS
```

---

## 6. Component Legend

| Symbol | Meaning |
|--------|---------|
| `[Name]` | Service/Component |
| `[(Name)]` | Database/Storage |
| `-->` | Data Flow |
| `subgraph` | Logical grouping |

---

## 7. Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + CesiumJS |
| Propagation | satellite.js (Web Worker) |
| API Gateway | Node.js + Express + TypeScript |
| Database | PostgreSQL (RDS) |
| Cache | Redis (ElastiCache) |
| Object Storage | S3 |
| Infrastructure | AWS (ECS Fargate, Terraform) |
| CI/CD | GitHub Actions + OIDC |
| Security | WAF, KMS, IAM |

---

## 8. Review Checklist

- [ ] Context diagram accurately represents all external dependencies
- [ ] Component diagram reflects modular monolith boundaries
- [ ] Deployment topology matches environment strategy
- [ ] Security layers cover all required controls
- [ ] Data flows are consistent with API contracts
- [ ] All leads have reviewed and provided feedback

---

**Diagrams Version:** 1.0  
**Reviewers:** Engineering Lead, Architecture, SecOps, DevOps
