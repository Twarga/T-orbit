# ADR-001: Use CesiumJS for Globe and Orbital Rendering

## Status
Accepted

## Context
Cosmic Watch requires real-time 3D visualization of Earth with satellite orbital tracks. The visualization must render 10,000+ satellite objects with smooth 60fps interaction on modern browsers.

## Decision
We will use **CesiumJS** as the primary 3D globe and visualization engine.

## Rationale

### Why CesiumJS?
- **Proven at scale**: Used by NASA, DARPA, and commercial aerospace
- **WGS84 compliant**: Accurate geodetic reference for orbital mechanics
- **WebGL native**: Hardware-accelerated rendering, 60fps achievable
- **Active maintenance**: Open source with commercial backing (Cesium Inc)
- **Orbital mechanics support**: Built-in CZML format for time-dynamic data

### Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Three.js | Flexible, popular | Requires custom Earth implementation |
| Mapbox GL JS | Good basemap | Not designed for orbital visualization |
| Globe.js | Lightweight | Limited aerospace features |
| deck.gl | Performance | Requires custom Earth integration |

### Trade-offs
- **Bundle size**: CesiumJS is ~15MB (mitigated by lazy loading)
- **Learning curve**: New API to learn (mitigated by comprehensive docs)
- **Cesium Ion**: Requires account for default imagery (mitigated by using free alternatives)

## Consequences

### Positive
- Accurate orbital visualization out of the box
- Time-dynamic animations with CZML
- Built-in camera controls and terrain
- Large community and examples

### Negative
- Large initial bundle size
- Requires WebGL support
- Dependency on external imagery providers

## Implementation Notes
- Use Cesium Ion for terrain/imagery or configure self-hosted
- Implement pointPrimitives for satellite rendering (more performant than entities)
- Use Web Workers for position calculations to avoid blocking main thread
- Configure LOD (Level of Detail) for zoom-dependent detail

## References
- [CesiumJS Official](https://cesium.com/)
- [Cesium Ion](https://ion.cesium.com/)
- [CZML Specification](https://github.com/AnalyticalGraphicsInc/czml-writer/wiki/CZML-Structure)
