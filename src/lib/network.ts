// 网络状态检测工具
import { logger } from './logger';

export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline: boolean;
  private listeners: Array<(online: boolean) => void> = [];
  private supabaseUrl: string;

  private constructor() {
    this.isOnline = navigator.onLine;
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.setupEventListeners();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      logger.info('Network status: online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      logger.warn('Network status: offline');
    });
  }

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  addListener(listener: (online: boolean) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (online: boolean) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  static async checkConnectionQuality(): Promise<'excellent' | 'good' | 'poor' | 'offline'> {
    if (!navigator.onLine) {
      return 'offline';
    }

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      const rtt = connection.rtt;

      logger.debug('Network info:', { effectiveType, downlink, rtt });

      if (effectiveType === '4g' && downlink > 5 && rtt < 100) {
        return 'excellent';
      }
      if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 1)) {
        return 'good';
      }
      if (effectiveType === '3g' || effectiveType === '2g') {
        return 'poor';
      }
    }

    const instance = NetworkMonitor.getInstance();
    if (instance.supabaseUrl) {
      try {
        const start = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${instance.supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache'
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - start;

        logger.debug('API response time:', duration, 'ms');

        if (response.ok || response.status === 401 || response.status === 404) {
          if (duration < 200) return 'excellent';
          if (duration < 500) return 'good';
          return 'poor';
        }
      } catch (error: any) {
        logger.warn('Network check failed:', error.message);
        if (error.name === 'AbortError') {
          return 'poor';
        }
      }
    }

    // 使用本地资源检查网络质量，避免依赖外部服务
    try {
      const start = Date.now();
      const img = new Image();
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 3000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Image load failed'));
        };

        // 使用本地 favicon 作为网络检测资源
        img.src = `${window.location.origin}/favicon.ico?t=${Date.now()}`;
      });

      const duration = Date.now() - start;
      
      if (duration < 200) return 'excellent';
      if (duration < 500) return 'good';
      return 'poor';
    } catch (error) {
      logger.warn('Local resource network test failed:', error);
      return 'poor';
    }
  }

  static getNetworkInfo(): {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData
    };
  }

  static onNetworkChange(callback: (info: any) => void): () => void {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      const handler = () => {
        callback(NetworkMonitor.getNetworkInfo());
      };

      connection.addEventListener('change', handler);

      return () => {
        connection.removeEventListener('change', handler);
      };
    }

    return () => {};
  }
}