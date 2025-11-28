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
    // 检查是否在浏览器环境
    const isBrowser = typeof window !== 'undefined';
    
    // 获取环境变量
    let isDev: boolean;
    let mode: string;
    
    if (isBrowser) {
      // 浏览器环境
      isDev = (window as any).importMetaEnv?.DEV || false;
      mode = (window as any).importMetaEnv?.MODE || 'production';
    } else {
      // Node.js环境
      isDev = process.env.NODE_ENV === 'development';
      mode = process.env.NODE_ENV || 'production';
    }
    
    const isDebugMode = mode === 'debug';
    
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
    const isBrowser = typeof window !== 'undefined';
    let isDev: boolean;
    let mode: string;
    
    if (isBrowser) {
      isDev = (window as any).importMetaEnv?.DEV || false;
      mode = (window as any).importMetaEnv?.MODE || 'production';
    } else {
      isDev = process.env.NODE_ENV === 'development';
      mode = process.env.NODE_ENV || 'production';
    }
    
    if (isDev && this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', `[SENSITIVE] ${message}`, data ? '***' : ''));
      if (data && mode === 'debug') {
        console.log('详细数据:', data);
      }
    }
  }
}

// 导出单例
export const logger = new Logger();

// 便捷导出
export const { debug, info, warn, error } = logger;