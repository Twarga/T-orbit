import { z } from 'zod';

// Common schemas
export const isoDateTimeSchema = z.string().datetime();

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Satellite schemas
export const satelliteIdParamSchema = z.object({
  noradId: z.coerce.number().int().positive(),
});

export const telemetryQuerySchema = z.object({
  at: isoDateTimeSchema.optional(),
});

// API schemas
export const satellitesActiveQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  missionType: z.string().optional(),
});

export const solarDistanceQuerySchema = z.object({
  from: z.enum(['EARTH', 'MOON']),
  to: z.enum(['MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'SUN']),
  at: isoDateTimeSchema.optional(),
});

// Metadata schemas
export const metadataUpdateSchema = z.object({
  summary: z.string().max(1000).optional(),
  owner: z.string().max(255).optional(),
  missionType: z.string().max(100).optional(),
  status: z.string().max(100).optional(),
  factJson: z.record(z.unknown()).optional(),
});

// Response schemas
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
  requestId: z.string().uuid(),
});

export const healthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  checks: z.object({
    database: z.boolean(),
    cache: z.boolean(),
    upstream: z.record(z.boolean()),
  }),
  timestamp: z.string(),
});

// Type exports
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SatellitesActiveQuery = z.infer<typeof satellitesActiveQuerySchema>;
export type TelemetryQuery = z.infer<typeof telemetryQuerySchema>;
export type SolarDistanceQuery = z.infer<typeof solarDistanceQuerySchema>;
export type MetadataUpdate = z.infer<typeof metadataUpdateSchema>;
