// 应用监控和错误追踪模块
import { config } from './config';

// 日志级别定义
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志条目接口
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  error?: Error;
}

// 错误报告接口
export interface ErrorReport {
  error: Error;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  url?: string;
}

// 监控配置接口
interface MonitoringConfig {
  enabled: boolean;
  logLevel: LogLevel;
  captureErrors: boolean;
  captureLogs: boolean;
}

// 默认监控配置
const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  enabled: true,
  logLevel: config.debug ? 'debug' : 'info',
  captureErrors: true,
  captureLogs: true
};

// 日志级别优先级
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  'debug': 0,
  'info': 1,
  'warn': 2,
  'error': 3
};

// 简化的日志和监控类
class Logger {
  private config: MonitoringConfig;
  private logs: LogEntry[] = [];

  constructor(config: MonitoringConfig = DEFAULT_MONITORING_CONFIG) {
    this.config = config;
    
    // 如果在浏览器环境中，添加错误事件监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error, {
          context: 'Global error handler',
          url: window.location.href
        });
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason, {
          context: 'Unhandled promise rejection',
          url: window.location.href
        });
      });
    }
  }

  // 检查是否应该记录指定级别的日志
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled || !this.config.captureLogs) {
      return false;
    }
    
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.logLevel];
  }

  // 记录日志条目
  private log(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
      error
    };

    // 存储日志条目（在生产环境中可能需要发送到服务器）
    this.logs.push(entry);
    
    // 在开发环境中输出到控制台
    if (config.debug) {
      this.outputToConsole(entry);
    }
    
    // 限制日志数量以避免内存问题
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
  }

  // 输出到控制台
  private outputToConsole(entry: LogEntry) {
    const consoleMethod = entry.level === 'error' ? console.error :
                         entry.level === 'warn' ? console.warn :
                         entry.level === 'info' ? console.info : console.log;
    
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] ${entry.level.toUpperCase()}:`;
    
    if (entry.error) {
      consoleMethod(prefix, entry.message, entry.error, entry.metadata || '');
    } else {
      consoleMethod(prefix, entry.message, entry.metadata || '');
    }
  }

  // 记录调试日志
  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata);
  }

  // 记录信息日志
  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  // 记录警告日志
  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  // 记录错误日志
  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log('error', message, metadata, error);
  }

  // 捕获并报告错误
  captureError(error: Error, context?: Record<string, any>) {
    if (!this.config.enabled || !this.config.captureErrors) {
      return;
    }

    const report: ErrorReport = {
      error,
      context,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    // 记录错误日志
    this.error('Captured error', error, context);
    
    // 在生产环境中，这里可能需要将错误发送到监控服务
    // 例如 Sentry、LogRocket 等
    if (!config.debug) {
      this.sendToMonitoringService(report);
    }
  }

  // 发送到监控服务（模拟实现）
  private sendToMonitoringService(report: ErrorReport) {
    // 在实际应用中，这里会将错误报告发送到监控服务
    // 例如：
    // fetch('/api/logs/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report)
    // }).catch(err => {
    //   // 静默处理发送失败
    //   console.error('Failed to send error report:', err);
    // });
    
    // 目前只是模拟，实际项目中需要实现具体的发送逻辑
    console.warn('Error report would be sent to monitoring service:', report);
  }

  // 获取日志历史
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // 清除日志
  clearLogs() {
    this.logs = [];
  }
}

// 性能监控类
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 记录性能指标
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name)!;
    metrics.push(value);
    
    // 限制存储的指标数量
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // 获取平均值
  getAverage(name: string): number {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return 0;
    
    const sum = metrics.reduce((a, b) => a + b, 0);
    return sum / metrics.length;
  }

  // 获取统计数据
  getStats(name: string): { average: number; min: number; max: number; count: number } {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }
    
    const sum = metrics.reduce((a, b) => a + b, 0);
    const average = sum / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);
    
    return { average, min, max, count: metrics.length };
  }

  // 清除指标
  clearMetrics(name?: string) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

// 导出性能监控实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 导出日志和监控类
export { Logger };

// 创建并导出日志实例
export const logger = new Logger();

