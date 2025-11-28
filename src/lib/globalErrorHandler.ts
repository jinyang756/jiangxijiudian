// src/lib/globalErrorHandler.ts
// 全局错误处理器

import { logger } from './logger';

// 错误缓存，防止重复报告
const errorCache = new Set<string>();
const CACHE_DURATION = 5000; // 5秒内相同错误只报告一次

/**
 * 生成错误唯一键
 */
function getErrorKey(error: any, source: string): string {
  const message = typeof error === 'string' ? error : error?.message || 'Unknown error';
  return `${source}:${message}`;
}

/**
 * 判断是否应该忽略错误
 */
function shouldIgnoreError(error: any): boolean {
  // 忽略网络中断错误
  if (error?.name === 'AbortError') {
    return true;
  }
  
  // 忽略某些特定的错误消息
  const ignoredMessages = [
    'ResizeObserver loop limit exceeded',
    'Script error',
    'Network Error',
    'Failed to fetch'
  ];
  
  const message = typeof error === 'string' ? error : error?.message || '';
  return ignoredMessages.some(ignored => message.includes(ignored));
}

/**
 * 处理全局 JavaScript 错误
 */
function handleGlobalError(
  error: any,
  source?: string,
  lineno?: number,
  colno?: number,
  stack?: string
) {
  // 忽略某些错误
  if (shouldIgnoreError(error)) {
    return;
  }

  const errorKey = getErrorKey(error, source || 'unknown');

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
  });

  logger.info('Global error handler initialized');
}