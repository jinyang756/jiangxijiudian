// 网络状态检测工具
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline: boolean;
  private listeners: Array<(online: boolean) => void> = [];

  private constructor() {
    this.isOnline = navigator.onLine;
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
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
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

  // 检测网络连接质量
  static async checkConnectionQuality(): Promise<'excellent' | 'good' | 'poor' | 'offline'> {
    if (!navigator.onLine) {
      return 'offline';
    }

    try {
      // 简单的网络延迟测试
      const start = Date.now();
      await fetch('https://httpbin.org/get?test=1', { 
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const end = Date.now();
      const duration = end - start;

      if (duration < 100) return 'excellent';
      if (duration < 300) return 'good';
      return 'poor';
    } catch (e) {
      return 'offline';
    }
  }
}