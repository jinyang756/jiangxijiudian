// 日志管理模块
// 根据环境自动控制日志输出

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix: string;
}

class Logger {
  private config: LoggerConfig;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor() {
    // 根据环境配置日志
    const isDev = import.meta.env.DEV;
    const isDebugMode = import.meta.env.MODE === 'debug';
    
    this.config = {
      enabled: isDev || isDebugMode,
      level: isDev ? 'debug' : 'warn',
      prefix: '[江西酒店]'
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return this.levels[level] >= this.levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): any[] {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `${this.config.prefix} [${level.toUpperCase()}] ${timestamp}`;
    return [prefix, message, ...args];
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', message, ...args));
    }
  }

  // 用于敏感信息的日志（仅开发环境）
  sensitive(message: string, data?: any): void {
    if (import.meta.env.DEV && this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', `[SENSITIVE] ${message}`, data ? '***' : ''));
      if (data && import.meta.env.MODE === 'debug') {
        console.log('详细数据:', data);
      }
    }
  }
}

// 导出单例
export const logger = new Logger();

// 便捷导出
export const { debug, info, warn, error } = logger;
