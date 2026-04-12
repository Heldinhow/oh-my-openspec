export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private logs: LogEntry[] = [];
  private component: string;

  constructor(component: string = 'orchestration') {
    this.component = component;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Debug, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Info, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Warn, message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Error, message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      component: this.component,
      message,
      context
    };
    this.logs.push(entry);
    this.output(entry);
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}] [${entry.level.toUpperCase()}] [${entry.component}]`;
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    console.log(`${prefix} ${entry.message}${contextStr}`);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

export const orchestrationLogger = new Logger('orchestration');
export const spawnLogger = new Logger('spawn');
export const violationLogger = new Logger('violation');
