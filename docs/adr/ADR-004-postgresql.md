# ADR-004: Use PostgreSQL for Domain Data and Metadata

## Status
Accepted

## Context
Cosmic Watch must store satellite records, TLE history, ephemeris snapshots, metadata, and sync audit logs. Data has clear relationships and requires ACID transactions for consistency.

## Decision
We will use **PostgreSQL** as the primary database.

## Rationale

### Why PostgreSQL?
- **Relational integrity**: Foreign keys, constraints ensure data quality
- **JSON support**: Flexible for metadata without losing structure
- **PostGIS extension**: Future-proof for geospatial queries
- **Mature**: 30+ years of production hardening
- **Team familiarity**: Standard choice for most teams

### Data Characteristics
- **Satellites**: ~10,000 active records, structured schema
- **TLE history**: Time-series with unique constraints
- **Ephemeris**: Regular snapshots, clear relationships
- **Metadata**: Semi-structured, curated content

### Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| MongoDB | Flexible schema, document-native | Less relational integrity |
| MySQL | Simpler, good for web apps | Less feature-rich |
| CockroachDB | Distributed, global | Overkill for MVP scale |
| DynamoDB | Serverless, AWS-native | Vendor lock-in, less relational |

### Trade-offs
- **Provisioned capacity**: Need to size appropriately (mitigated by monitoring)
- **Single region MVP**: Multi-region adds complexity (deferred to v2)

## Consequences

### Positive
- Strong data integrity guarantees
- Familiar SQL for queries
- Rich indexing options
- Excellent tooling

### Negative
- Requires migration management
- Schema changes need care
- Connection pooling required

## Schema Overview

```sql
-- Core tables
satellites          -- Master satellite records
tle_sets            -- TLE history with unique epochs
satellite_metadata  -- SME-curated content
celestial_bodies    -- Solar system bodies
ephemeris_snapshots-- Position/velocity vectors
source_sync_runs   -- Audit logs for ingestion
```

## Implementation Notes
- Use connection pooling (pgBouncer in production)
- Index strategically: `tle_sets(norad_id, epoch_utc DESC)`
- Use JSONB for flexible metadata fields
- Enable pg_stat_statements for query analysis
- Consider TimescaleDB extension if time-series grows significantly

## References
- [PostgreSQL Official](https://www.postgresql.org/)
- [PostGIS](https://postgis.net/)
- [Connection Pooling Best Practices](https://github.com/brettcvz/react-pg)
