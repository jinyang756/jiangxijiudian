// 缓存管理工具
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  private constructor() {
    // 定期清理过期缓存
    setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // 设置缓存
  set<T>(key: string, data: T, ttl: number = 300000) { // 默认5分钟过期
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // 删除缓存
  delete(key: string) {
    this.cache.delete(key);
  }

  // 清除所有缓存
  clear() {
    this.cache.clear();
  }

  // 清理过期缓存
  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 导出缓存管理实例
export const cacheManager = CacheManager.getInstance();