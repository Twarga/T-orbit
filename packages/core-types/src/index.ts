// Satellite types
export interface Satellite {
  noradId: number;
  name: string;
  internationalDesignator: string;
  operatorOrg: string | null;
  missionType: string | null;
  countryCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TleSet {
  id: number;
  noradId: number;
  epochUtc: string;
  line1: string;
  line2: string;
  source: string;
  ingestedAt: string;
}

export interface SatelliteWithTle extends Satellite {
  latestTle: TleSet | null;
}

// Telemetry types
export interface Telemetry {
  noradId: number;
  timestampUtc: string;
  latitude: number;
  longitude: number;
  altitude: number; // km
  velocity: number; // km/s
}

// Celestial bodies
export type CelestialBodyCode = 
  | 'SUN' | 'MOON' | 'MERCURY' | 'VENUS' | 'EARTH' 
  | 'MARS' | 'JUPITER' | 'SATURN' | 'URANUS' | 'NEPTUNE';

export interface CelestialBody {
  bodyCode: CelestialBodyCode;
  name: string;
  category: 'sun' | 'planet' | 'moon' | 'dwarf';
}

export interface EphemerisSnapshot {
  id: number;
  bodyCode: CelestialBodyCode;
  timestampUtc: string;
  frame: string;
  xKm: number;
  yKm: number;
  zKm: number;
  vxKms: number;
  vyKms: number;
  vzKms: number;
}

// Metadata
export interface SatelliteMetadata {
  noradId: number;
  summary: string | null;
  owner: string | null;
  missionType: string | null;
  launchDate: string | null;
  status: string | null;
  factJson: Record<string, unknown> | null;
  lastReviewedAt: string | null;
}

// APOD
export interface ApodRecord {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl: string | null;
  mediaType: string;
  copyright: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  serverTimeUtc: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

// Health check
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    cache: boolean;
    upstream: Record<string, boolean>;
  };
  timestamp: string;
}

// Sync run
export interface SyncRun {
  id: number;
  sourceName: string;
  startedAt: string;
  completedAt: string | null;
  status: 'running' | 'success' | 'failure' | 'partial';
  recordsIn: number;
  recordsOut: number;
  errorSummary: string | null;
}
