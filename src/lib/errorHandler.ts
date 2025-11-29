// src/lib/errorHandler.ts
// 错误处理和重试机制

import { logger } from './logger';

export interface ApiError extends Error {
  code?: string;
  status?: number;
  retryable?: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT: 'TIMEOUT'
} as const;

// 创建API错误
export const createApiError = (
  message: string, 
  options: { code?: string; status?: number; retryable?: boolean } = {}
): ApiError => {
  const error = new Error(message) as ApiError;
  error.code = options.code;
  error.status = options.status;
  
  // 如果显式设置了retryable，则使用该值
  // 否则根据错误代码自动判断
  if (options.retryable !== undefined) {
    error.retryable = options.retryable;
  } else if (options.code === ERROR_CODES.TIMEOUT || options.code === ERROR_CODES.NETWORK_ERROR) {
    error.retryable = true;
  } else {
    error.retryable = false;
  }
  
  return error;
};

// 延迟函数
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 判断是否应该重试
export const shouldRetry = (error: ApiError, attempt: number, maxRetries: number): boolean => {
  // 超过最大重试次数
  if (attempt >= maxRetries) {
    return false;
  }

  // 如果明确标记为不可重试
  if (error.retryable === false) {
    return false;
  }

  // 网络错误通常可以重试
  if (error.code === ERROR_CODES.NETWORK_ERROR) {
    return true;
  }

  // 服务器错误（5xx）通常可以重试
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  // 请求超时可以重试
  if (error.code === ERROR_CODES.TIMEOUT) {
    return true;
  }

  return false;
};

// 执行带重试机制的异步操作
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> => {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as ApiError;
      
      logger.warn(
        `Operation failed (attempt ${attempt + 1}/${config.maxRetries + 1}):`, 
        error,
        {
          status: error instanceof Error && 'status' in error ? (error as any).status : undefined,
          code: error instanceof Error && 'code' in error ? (error as any).code : ERROR_CODES.NETWORK_ERROR,
          retryable: error instanceof Error && 'retryable' in error ? (error as any).retryable : undefined
        }
      );

      // 如果不应该重试，立即抛出错误
      if (!shouldRetry(lastError, attempt, config.maxRetries)) {
        throw lastError;
      }

      // 如果是最后一次尝试，抛出错误
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // 计算延迟时间（指数退避）
      const delayTime = config.delay * Math.pow(config.backoffMultiplier, attempt);
      
      // 等待后重试
      await delay(delayTime);
    }
  }

  throw lastError || new Error('Unknown error occurred');
};

// 网络错误检查
export const isNetworkError = (error: any): boolean => {
  return error instanceof TypeError && 
         (error.message.includes('fetch') || 
          error.message.includes('network') ||
          error.message.includes('Failed to fetch'));
};

// HTTP错误检查
export const isHttpError = (error: any): boolean => {
  return error.status !== undefined && error.status >= 400;
};