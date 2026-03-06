# Cosmic Watch - Architecture Decision Records (ADRs)

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-globe-rendering.md) | Use CesiumJS for Globe and Orbital Rendering | Accepted | 2026-03-06 |
| [ADR-002](ADR-002-sgp4-propagation.md) | Use satellite.js SGP4 Propagation in Web Workers | Accepted | 2026-03-06 |
| [ADR-003](ADR-003-api-gateway.md) | Use Node.js + TypeScript API Gateway with Modular Monolith | Accepted | 2026-03-06 |
| [ADR-004](ADR-004-postgresql.md) | Use PostgreSQL for Domain Data and Metadata | Accepted | 2026-03-06 |
| [ADR-005](ADR-005-redis-cache.md) | Use Redis for Hot Cache Layer | Accepted | 2026-03-06 |
| [ADR-006](ADR-006-aws-runtime.md) | Use AWS as Primary Cloud Runtime | Accepted | 2026-03-06 |
| [ADR-007](ADR-007-github-actions.md) | Use GitHub Actions with OIDC for CI/CD | Accepted | 2026-03-06 |
| [ADR-008](ADR-008-devsecops-gates.md) | Enforce DevSecOps Pipeline Gates | Accepted | 2026-03-06 |

## Format

Each ADR follows the standard format:
- **Status**: Proposed, Accepted, Deprecated, or Superseded
- **Context**: The situation driving the decision
- **Decision**: What we decided to do
- **Rationale**: Why this choice was made
- **Alternatives**: What else was considered
- **Trade-offs**: Benefits and drawbacks
- **Consequences**: What happens after this decision
- **Implementation Notes**: How to put this into practice

## Creating New ADRs

When making significant technical decisions:

1. Copy the ADR template
2. Fill in all sections
3. Discuss with team
4. Update status as needed
5. Update this index

## Review Cycle

Review ADRs:
- When architecture changes significantly
- Before major refactoring
- When adopting new technologies
- Annually for currency
