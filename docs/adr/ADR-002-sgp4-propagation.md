# ADR-002: Use satellite.js SGP4 Propagation in Web Workers

## Status
Accepted

## Context
Satellite positions must be calculated from TLE (Two-Line Element) data using the SGP4 (Simplified General Perturbations) propagation model. This computation is CPU-intensive and must run frequently (every 1-2 seconds) to maintain visual accuracy.

## Decision
We will use **satellite.js** library running in **browser Web Workers** for satellite position propagation.

## Rationale

### Why satellite.js?
- **Industry standard**: Most widely used JS SGP4 library
- **Active maintenance**: Regular updates for edge cases
- **TypeScript support**: Well-typed for type safety
- **Lightweight**: ~50KB minified

### Why Web Workers?
- **Non-blocking**: Keeps main thread free for rendering
- **Parallel computation**: Can process multiple satellites simultaneously
- **60fps target**: Offloading compute ensures smooth UI

### Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Backend propagation | Centralized compute | High bandwidth, latency issues |
| WebAssembly SGP4 | Faster than JS | Less mature ecosystem |
| Static TLE positions | No compute | Inaccurate over time |

### Trade-offs
- **Browser support**: Web Workers not available in very old browsers (mitigated by feature detection)
- **Memory**: Worker overhead per tab (acceptable for MVP)
- **Debugging**: Harder to debug worker code (mitigated by logging)

## Consequences

### Positive
- Main thread stays responsive at 60fps
- Fresh positions every 1-2 seconds
- No API round-trip latency for position data
- Reduced backend costs

### Negative
- Client-side compute requirements
- TLE data must be fetched and cached client-side
- Some devices may struggle with 10k+ simultaneous propagations

## Implementation Notes
- Create dedicated worker for satellite.js
- Batch propagation: process in chunks of 500 satellites
- Use SharedArrayBuffer if performance critical (requires COOP/COEP headers)
- Implement graceful degradation: reduce update frequency on low-end devices
- Cache latest TLE dataset in IndexedDB for offline capability

## References
- [satellite.js npm](https://www.npmjs.com/package/satellite.js)
- [SGP4 Theory](https://www.celestrak.org/software/sgp4.php)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
