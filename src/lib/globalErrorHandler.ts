import { logger } from './logger';

/**
 * 全局错误处理器
 * 捕获未被 React 错误边界捕获的错误
 */

// 错误信息缓存，防止重复报告
const errorCache = new Set<string>();
const CACHE_DURATION = 5000; // 5秒内相同错误只报告一次

/**
 * 生成错误的唯一键
 */
function getErrorKey(error: Error | string, source?: string): string {
  const message = typeof error === 'string' ? error : error.message;
  return `${source || 'unknown'}:${message}`;
}

/**
 * 检查错误是否应该被忽略
 */
function shouldIgnoreError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : error.message;
  
  // 忽略的错误模式
  const ignorePatterns = [
    /ResizeObserver loop limit exceeded/i,
    /ResizeObserver loop completed with undelivered notifications/i,
    /Script error/i,
    /Non-Error promise rejection captured/i,
  ];
  
  return ignorePatterns.some(pattern => pattern.test(message));
}

/**
 * 处理全局错误
 */
function handleGlobalError(
  error: Error | string,
  source: string,
  lineno?: number,
  colno?: number,
  stack?: string
) {
  // 忽略某些错误
  if (shouldIgnoreError(error)) {
    return;
  }

  const errorKey = getErrorKey(error, source);

  // 防止重复报告
  if (errorCache.has(errorKey)) {
    return;
  }

  errorCache.add(errorKey);
  setTimeout(() => errorCache.delete(errorKey), CACHE_DURATION);

  // 记录错误
  logger.error('Global error caught:', {
    message: typeof error === 'string' ? error : error.message,
    source,
    lineno,
    colno,
    stack: stack || (typeof error !== 'string' ? error.stack : undefined),
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });

  // 生产环境发送到监控服务
  if (import.meta.env.PROD) {
    // 可以在这里集成 Sentry、LogRocket 等
    // Sentry.captureException(error);
  }
}

/**
 * 处理未捕获的 Promise 拒绝
 */
function handleUnhandledRejection(event: PromiseRejectionEvent) {
  const error = event.reason;
  
  // 忽略某些错误
  if (shouldIgnoreError(error)) {
    return;
  }

  const errorKey = getErrorKey(error, 'promise');

  // 防止重复报告
  if (errorCache.has(errorKey)) {
    return;
  }

  errorCache.add(errorKey);
  setTimeout(() => errorCache.delete(errorKey), CACHE_DURATION);

  logger.error('Unhandled promise rejection:', {
    reason: error?.message || error,
    promise: event.promise,
    stack: error?.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });

  // 生产环境发送到监控服务
  if (import.meta.env.PROD) {
    // Sentry.captureException(error);
  }
}

/**
 * 初始化全局错误处理器
 */
export function initGlobalErrorHandler() {
  // 捕获未处理的 JavaScript 错误
  window.addEventListener('error', (event) => {
    handleGlobalError(
      event.error || event.message,
      event.filename,
      event.lineno,
      event.colno,
      event.error?.stack
    );
  });

  // 捕获未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // 资源加载错误
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    
    // 只处理资源加载错误
    if (target && target.tagName) {
      const tagName = target.tagName.toLowerCase();
      
      if (['img', 'script', 'link', 'iframe'].includes(tagName)) {
        logger.warn('Resource loading error:', {
          tagName,
          src: (target as any).src || (target as any).href,
          currentSrc: (target as any).currentSrc,
          url: window.location.href
        });
      }
    }
  }, true); // 使用捕获阶段

  logger.info('Global error handler initialized');
}

/**
 * 清理全局错误处理器
 */
export function cleanupGlobalErrorHandler() {
  // 注意：这些事件监听器在实际应用中通常不需要清理
  // 因为它们应该在整个应用生命周期中保持活动
  errorCache.clear();
  logger.info('Global error handler cleaned up');
}

/**
 * 手动报告错误
 */
export function reportError(error: Error, context?: Record<string, any>) {
  logger.error('Manual error report:', {
    message: error.message,
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });

  // 生产环境发送到监控服务
  if (import.meta.env.PROD) {
    // Sentry.captureException(error, { extra: context });
  }
}

// 导出用于测试
export { errorCache, shouldIgnoreError, getErrorKey };
