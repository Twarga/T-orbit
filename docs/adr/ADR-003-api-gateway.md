# ADR-003: Use Node.js + TypeScript API Gateway with Modular Monolith

## Status
Accepted

## Context
The backend must serve satellite data, ephemeris positions, metadata, and APOD content with p95 latency <250ms. The system should support future service extraction as the system scales.

## Decision
We will use **Node.js + Express + TypeScript** with a **modular monolith** architecture.

## Rationale

### Why Node.js + Express?
- **Team expertise**: JavaScript/TypeScript consistency with frontend
- **Non-blocking I/O**: Excellent for concurrent API requests
- **Ecosystem**: Rich libraries for geospatial and API work
- **Express**: Mature, predictable, well-documented

### Why Modular Monolith?
- **Clear boundaries**: Modules can be extracted later as services
- **Simpler operations**: Single deployment vs distributed system
- **Fast iteration**: No network overhead between modules
- **Team size fit**: Small team (2-4) can manage monolith

### Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Python FastAPI | Fast, great for data processing | Separate ecosystem from frontend |
| Go | High performance, single binary | Steeper learning curve for team |
| NestJS | Structured, enterprise-ready | More complexity than needed |
| Next.js API routes | Simpler, unified repo | Less control over backend |

### Trade-offs
- **Single point of scaling**: Mitigated by stateless design + horizontal scaling
- **Failure domain**: Single crash takes all services (acceptable for MVP)

## Consequences

### Positive
- Single language/framework across stack
- Easy to refactor boundaries later
- Fast local development
- Good TypeScript support

### Negative
- All modules deploy together
- Memory leaks affect entire system
- Cannot scale modules independently

## Module Boundaries

```
apps/api/
├── src/
│   ├── modules/
│   │   ├── satellite/     # TLE data, active satellites
│   │   ├── ephemeris/     # Solar system positions
│   │   ├── metadata/      # SME content
│   │   ├── apod/          # NASA picture of day
│   │   └── health/        # Liveness/readiness
│   ├── middleware/        # Shared middleware
│   ├── lib/              # Shared utilities
│   └── index.ts          # Entry point
```

## Implementation Notes
- Each module has its own routes, controllers, services, repositories
- Shared database connection pool
- Redis for cross-module caching
- All modules share same PostgreSQL instance initially

## References
- [Modular Monolith](https://www.youtube.com/watch?v=5OjqDyrfoH0)
- [Express.js](https://expressjs.com/)
- [Node.js Performance](https://nodejs.org/en/docs/guides/)
