// src/lib/storage.ts
// 安全的本地存储工具函数

import { logger } from './logger';

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined';

// 安全的localStorage getItem
export const safeLocalStorageGet = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    logger.error(`Error reading localStorage key "${key}":`, e);
    return defaultValue;
  }
};

// 安全的localStorage setItem
export const safeLocalStorageSet = <T>(key: string, value: T): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.error(`Error setting localStorage key "${key}":`, e);
  }
};

// 安全的sessionStorage getItem
export const safeSessionStorageGet = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser) return defaultValue;
  
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    logger.error(`Error reading sessionStorage key "${key}":`, e);
    return defaultValue;
  }
};

// 安全的sessionStorage setItem
export const safeSessionStorageSet = <T>(key: string, value: T): void => {
  if (!isBrowser) return;
  
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.error(`Error setting sessionStorage key "${key}":`, e);
  }
};