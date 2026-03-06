import * as satellite from 'satellite.js';

export interface Position {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface Velocity {
  x: number;
  y: number;
  z: number;
}

export interface OrbitalState {
  position: Position;
  velocity: Velocity;
  timestamp: Date;
}

export interface TleData {
  name: string;
  line1: string;
  line2: string;
}

/**
 * Parse TLE lines into a satellite.js compatible structure
 */
export function parseTle(line1: string, line2: string): satellite.Tle {
  return {
    name: '',
    line1,
    line2,
  };
}

/**
 * Propagate satellite position using SGP4
 */
export function propagate(tleLine1: string, tleLine2: string, timestamp: Date): OrbitalState | null {
  try {
    const tle = parseTle(tleLine1, tleLine2);
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    
    if (!satrec) {
      return null;
    }

    const position = satellite.propagate(satrec, timestamp);
    
    if (!position.position) {
      return null;
    }

    const gmst = satellite.gstime(timestamp);
    const positionEcf = satellite.eciToEcf(position.position as satellite.EciVec3<number>, gmst);
    const location = satellite.ecfToGeodetic(positionEcf);

    return {
      position: {
        latitude: satellite.degreesLat(location.latitude),
        longitude: satellite.degreesLong(location.longitude),
        altitude: location.height,
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0,
      },
      timestamp,
    };
  } catch (error) {
    console.error('SGP4 propagation error:', error);
    return null;
  }
}

/**
 * Batch propagate multiple satellites
 */
export function propagateBatch(
  satellites: Array<{ noradId: number; tleLine1: string; tleLine2: string }>,
  timestamp: Date
): Map<number, OrbitalState | null> {
  const results = new Map<number, OrbitalState | null>();
  
  for (const sat of satellites) {
    const state = propagate(sat.tleLine1, sat.tleLine2, timestamp);
    results.set(sat.noradId, state);
  }
  
  return results;
}

/**
 * Calculate distance between two positions (simplified)
 */
export function calculateDistance(
  lat1: number, lon1: number, alt1: number,
  lat2: number, lon2: number, alt2: number
): number {
  const R = 6371; // Earth's radius in km
  
  const toRad = (deg: number) => deg * Math.PI / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c + (alt2 - alt1);
  
  return Math.round(distance);
}
