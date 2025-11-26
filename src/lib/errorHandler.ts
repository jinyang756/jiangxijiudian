// 错误处理和重试机制模块
export interface ApiError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
}

// 错误分类
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR' as const,
  TIMEOUT_ERROR: 'TIMEOUT_ERROR' as const,
  SERVER_ERROR: 'SERVER_ERROR' as const,
  UNAUTHORIZED: 'UNAUTHORIZED' as const,
  NOT_FOUND: 'NOT_FOUND' as const
};

// 可重试的错误类型
const RETRYABLE_ERRORS: readonly string[] = [
  ERROR_CODES.NETWORK_ERROR,
  ERROR_CODES.TIMEOUT_ERROR,
  ERROR_CODES.SERVER_ERROR
] as const;

// 创建API错误
export const createApiError = (
  message: string,
  options: {
    status?: number;
    code?: string;
    retryable?: boolean;
  } = {}
): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = options.status;
  error.code = options.code;
  error.retryable = options.retryable ?? (options.code ? RETRYABLE_ERRORS.includes(options.code) : false);
  return error;
};

// 重试机制配置
interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
  timeout: number;
}

// 默认重试配置
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  delay: 1000,
  backoffMultiplier: 2,
  timeout: 10000
};

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 检查是否应该重试
const shouldRetry = (error: ApiError, attempt: number, maxRetries: number): boolean => {
  return !!error.retryable && attempt < maxRetries;
};

// 带重试机制的异步函数执行器
export const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(createApiError('Request timeout', {
            code: ERROR_CODES.TIMEOUT_ERROR,
            retryable: true
          }));
        }, config.timeout);
      });

      // 执行函数并设置超时
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error: any) {
      lastError = createApiError(
        error.message || 'Unknown error',
        {
          status: error.status,
          code: error.code || ERROR_CODES.NETWORK_ERROR,
          retryable: error.retryable
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