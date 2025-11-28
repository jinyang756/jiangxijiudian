// 错误处理模块测试
import { executeWithRetry, createApiError, ERROR_CODES, isNetworkError, isHttpError } from '../src/lib/errorHandler';
import { describe, it, expect, vi } from 'vitest';

describe('Error Handler Tests', () => {
  describe('createApiError', () => {
    it('should create an API error with default values', () => {
      const error = createApiError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBeUndefined();
      expect(error.status).toBeUndefined();
      expect(error.retryable).toBe(false);
    });

    it('should create an API error with custom values', () => {
      const error = createApiError('Test error', {
        code: ERROR_CODES.NETWORK_ERROR,
        status: 500,
        retryable: true
      });
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ERROR_CODES.NETWORK_ERROR);
      expect(error.status).toBe(500);
      expect(error.retryable).toBe(true);
    });

    it('should set retryable based on error code', () => {
      const error = createApiError('Test error', {
        code: ERROR_CODES.TIMEOUT
      });
      
      expect(error.retryable).toBe(true);
    });
  });

  describe('executeWithRetry', () => {
    it('should execute function successfully without retries', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await executeWithRetry(fn, {
        maxRetries: 3,
        delay: 100,
        backoffMultiplier: 2,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR]
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(createApiError('Temporary error', { 
          code: ERROR_CODES.NETWORK_ERROR,
          retryable: true
        }))
        .mockResolvedValue('success');
      
      const result = await executeWithRetry(fn, { 
        maxRetries: 5, 
        delay: 10,
        backoffMultiplier: 2,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR]
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries exceeded', async () => {
      const fn = vi.fn().mockRejectedValue(
        createApiError('Persistent error', {
          code: ERROR_CODES.NETWORK_ERROR,
          retryable: true
        })
      );
      
      await expect(executeWithRetry(fn, { 
        maxRetries: 2, 
        delay: 10,
        backoffMultiplier: 2,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR]
      }))
        .rejects
        .toThrow('Persistent error');
      
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should not retry on non-retryable error', async () => {
      const fn = vi.fn().mockRejectedValue(
        createApiError('Non-retryable error', {
          code: ERROR_CODES.UNAUTHORIZED,
          retryable: false
        })
      );
      
      await expect(executeWithRetry(fn, { 
        maxRetries: 5, 
        delay: 10,
        backoffMultiplier: 2,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR]
      }))
        .rejects
        .toThrow('Non-retryable error');
      
      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });

    it('should respect timeout setting', async () => {
      const fn = vi.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve('success'), 100));
      });
      
      await expect(executeWithRetry(fn, { 
        maxRetries: 1, 
        delay: 10,
        backoffMultiplier: 2,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR],
        timeout: 50
      } as any))
        .rejects
        .toThrow('Request timeout');
    });
  });

  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      const error = new TypeError('Failed to fetch');
      
      expect(isNetworkError(error)).toBe(true);
    });

    it('should not identify non-network errors', () => {
      const error = new Error('Regular error');
      
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isHttpError', () => {
    it('should identify HTTP errors', () => {
      const error = { status: 500 };
      
      expect(isHttpError(error)).toBe(true);
    });

    it('should not identify non-HTTP errors', () => {
      const error = { code: 'NETWORK_ERROR' };
      
      expect(isHttpError(error)).toBe(false);
    });
  });
});