/**
 * Logging Utility
 * Structured logging for development and production environments
 */

enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context, error } = entry;

  // Development: Pretty formatted logs with colors
  if (process.env.NODE_ENV === "development") {
    const colors = {
      DEBUG: "\x1b[36m", // Cyan
      INFO: "\x1b[32m", // Green
      WARN: "\x1b[33m", // Yellow
      ERROR: "\x1b[31m", // Red
    };
    const reset = "\x1b[0m";

    let log = `${colors[level]}[${timestamp}] ${level}${reset}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      log += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }

    if (error) {
      log += `\n  Error: ${error.message}`;
      if (error.stack) {
        log += `\n  Stack: ${error.stack}`;
      }
    }

    return log;
  }

  // Production: JSON formatted logs
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...(context && { context }),
    ...(error && { error: { message: error.message, stack: error.stack } }),
  });
}

/**
 * Get current timestamp in ISO format
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Log debug message
 * Only shown in development
 */
export function logDebug(message: string, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === "development") {
    const entry: LogEntry = {
      timestamp: getTimestamp(),
      level: LogLevel.DEBUG,
      message,
      ...(context && { context }),
    };
    console.log(formatLogEntry(entry));
  }
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: LogLevel.INFO,
    message,
    ...(context && { context }),
  };
  console.log(formatLogEntry(entry));
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: Record<string, any>): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: LogLevel.WARN,
    message,
    ...(context && { context }),
  };
  console.warn(formatLogEntry(entry));
}

/**
 * Log error message
 */
export function logError(
  message: string,
  error?: Error,
  context?: Record<string, any>
): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: LogLevel.ERROR,
    message,
    ...(context && { context }),
    ...(error && { error }),
  };
  console.error(formatLogEntry(entry));
}

/**
 * Log GraphQL operation
 */
export function logGraphQLOperation(
  operation: string,
  userId?: number,
  context?: Record<string, any>
): void {
  logInfo(`GraphQL: ${operation}`, {
    userId,
    ...context,
  });
}

/**
 * Log database operation
 */
export function logDatabaseOperation(
  operation: string,
  model: string,
  context?: Record<string, any>
): void {
  logDebug(`Database: ${operation} on ${model}`, context);
}

/**
 * Log authentication event
 */
export function logAuth(
  event: string,
  userId?: number,
  context?: Record<string, any>
): void {
  logInfo(`Auth: ${event}`, {
    userId,
    ...context,
  });
}

/**
 * Log permission check
 */
export function logPermission(
  action: string,
  allowed: boolean,
  userId?: number,
  context?: Record<string, any>
): void {
  const level = allowed ? "info" : "warn";
  const message = `Permission: ${action} - ${allowed ? "ALLOWED" : "DENIED"}`;

  if (level === "warn") {
    logWarn(message, { userId, ...context });
  } else {
    logDebug(message, { userId, ...context });
  }
}

/**
 * Create a timer to measure operation duration
 */
export function createTimer(label: string) {
  const start = Date.now();

  return {
    end: (context?: Record<string, any>) => {
      const duration = Date.now() - start;
      logDebug(`Timer: ${label}`, {
        duration: `${duration}ms`,
        ...context,
      });
    },
  };
}
