import pino, { Logger, LoggerOptions } from 'pino';

export interface LogContext {
  [key: string]: unknown;
}

export interface Metrics {
  increment: (name: string, value?: number) => void;
  gauge: (name: string, value: number) => void;
  timing: (name: string, duration: number) => void;
}

let logger: Logger | null = null;
let metrics: Metrics | null = null;

/**
 * Initialize logger with configuration
 */
export function initLogger(options?: LoggerOptions): Logger {
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      bindings: () => ({
        service: 'cosmic-watch',
        environment: process.env.NODE_ENV || 'development',
      }),
    },
    ...options,
  });
  
  return logger;
}

/**
 * Get logger instance
 */
export function getLogger(): Logger {
  if (!logger) {
    logger = initLogger();
  }
  return logger;
}

/**
 * Create a child logger with context
 */
export function childLogger(context: LogContext): Logger {
  return getLogger().child(context);
}

/**
 * Initialize metrics (no-op for MVP)
 */
export function initMetrics(): Metrics {
  metrics = {
    increment: (name, value = 1) => {
      // In production, this would send to Prometheus/DataDog
      getLogger().debug({ metric: name, value }, 'metric.increment');
    },
    gauge: (name, value) => {
      getLogger().debug({ metric: name, value }, 'metric.gauge');
    },
    timing: (name, duration) => {
      getLogger().debug({ metric: name, duration }, 'metric.timing');
    },
  };
  
  return metrics;
}

/**
 * Get metrics instance
 */
export function getMetrics(): Metrics {
  if (!metrics) {
    metrics = initMetrics();
  }
  return metrics;
}

/**
 * Generate correlation ID
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Request logging middleware helper
 */
export interface RequestLogParams {
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  error?: Error;
}

export function logRequest(params: RequestLogParams): void {
  const { method, path, statusCode, duration, error } = params;
  
  if (error) {
    getLogger().error({
      method,
      path,
      statusCode: 500,
      error: {
        message: error.message,
        stack: error.stack,
      },
    }, 'request.error');
  } else if (statusCode && statusCode >= 400) {
    getLogger().warn({
      method,
      path,
      statusCode,
      duration,
    }, 'request.warning');
  } else {
    getLogger().info({
      method,
      path,
      statusCode,
      duration,
    }, 'request.complete');
  }
}
