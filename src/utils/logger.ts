/**
 * Logging utility for extension
 * Handles console logging with proper formatting and levels
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  timestamp: number;
  message: string;
  data?: unknown;
}

const logs: LogEntry[] = [];
const MAX_LOGS = 500;

/**
 * Log a message
 * @param level - Log level
 * @param message - Log message
 * @param data - Optional data to log
 */
function log(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    timestamp: Date.now(),
    message,
    data,
  };

  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // Always log to console for debugging
  const prefix = `[Debounce Network] [${level.toUpperCase()}]`;
  if (data !== undefined) {
    console[level === "debug" ? "log" : level](prefix, message, data);
  } else {
    console[level === "debug" ? "log" : level](prefix, message);
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log("debug", message, data),
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
};
