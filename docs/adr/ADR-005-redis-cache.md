# ADR-005: Use Redis for Hot Cache Layer

## Status
Accepted

## Context
The API must serve satellite data with p95 latency <250ms. Database queries alone cannot consistently meet this target under load. Frequent read patterns (active satellites list, ephemeris snapshots) are ideal for caching.

## Decision
We will use **Redis** as the hot cache layer.

## Rationale

### Why Redis?
- **In-memory speed**: Sub-millisecond reads
- **Rich data structures**: Strings, hashes, sorted sets
- **TTL support**: Automatic expiration for freshness
- **Pub/Sub**: Future-proof for real-time updates
- **AWS ElastiCache**: Managed offering with high availability

### Caching Strategy
- **Satellite list**: Cache active satellites JSON (TTL: 5 min)
- **TLE dataset**: Cache full TLE payload (TTL: 15 min)
- **Ephemeris snapshots**: Cache position data (TTL: 1 hour)
- **API responses**: ETag-based conditional responses

### Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Memcached | Simple, proven | Less features than Redis |
| In-memory (app) | Fastest | Not shared across instances |
| CDN (CloudFront) | Edge caching | Not suitable for API |
| PostgreSQL cache | No extra infrastructure | Slower than Redis |

### Trade-offs
- **Memory cost**: More expensive than disk (acceptable for cache layer)
- **Eviction**: Must handle cache misses gracefully (mitigated by warm-up)

## Consequences

### Positive
- Dramatically reduces database load
- Consistent sub-100ms API responses
- Reduces backend costs
- Supports future pub/sub features

### Negative
- Additional infrastructure component
- Cache invalidation complexity
- Must handle stale data scenarios

## Cache Keys Design

```
satellites:active         -- Active satellite list
tle:latest               -- Latest TLE dataset
ephemeris:{body}:{time}  -- Ephemeris snapshot
apod:latest              -- Today's APOD
```

## Implementation Notes
- Use Redis Hash for satellite data
- Implement cache-aside pattern
- Add cache warming on startup
- Monitor hit/miss ratio (target: >80%)
- Configure appropriate TTL per data type
- Use Redis Cluster for production

## References
- [Redis Official](https://redis.io/)
- [Cache-Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [ElastiCache](https://aws.amazon.com/elasticache/)
