type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

function emit(entry: LogEntry): void {
  const output = JSON.stringify(entry);
  switch (entry.level) {
    case "error":
      // eslint-disable-next-line no-console -- structured logger output
      console.error(output);
      break;
    case "warn":
      // eslint-disable-next-line no-console -- structured logger output
      console.warn(output);
      break;
    default:
      // eslint-disable-next-line no-console -- structured logger output
      console.info(output);
  }
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>): void {
    emit(createLogEntry("debug", message, data));
  },
  info(message: string, data?: Record<string, unknown>): void {
    emit(createLogEntry("info", message, data));
  },
  warn(message: string, data?: Record<string, unknown>): void {
    emit(createLogEntry("warn", message, data));
  },
  error(message: string, data?: Record<string, unknown>): void {
    emit(createLogEntry("error", message, data));
  },
};
