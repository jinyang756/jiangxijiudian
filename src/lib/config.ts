// 环境配置管理模块
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
}

// 根据环境变量创建配置对象
export const getConfig = (): AppConfig => {
  // 检查是否在浏览器环境
  const isBrowser = typeof window !== 'undefined';
  
  // 获取环境变量
  let environment: string;
  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;
  
  if (isBrowser) {
    // 浏览器环境
    environment = (window as any).importMetaEnv?.MODE || 'development';
    supabaseUrl = (window as any).importMetaEnv?.VITE_APP_DB_URL;
    supabaseAnonKey = (window as any).importMetaEnv?.VITE_APP_DB_POSTGRES_PASSWORD;
  } else {
    // Node.js环境
    environment = process.env.NODE_ENV || 'development';
    supabaseUrl = process.env.VITE_APP_DB_URL;
    supabaseAnonKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD;
  }
  
  // 基础配置
  const config: AppConfig = {
    supabaseUrl: supabaseUrl || '',
    supabaseAnonKey: supabaseAnonKey || '',
    apiBaseUrl: isBrowser ? 
      ((window as any).importMetaEnv?.VITE_API_BASE_URL || '/api') : 
      (process.env.VITE_API_BASE_URL || '/api'),
    environment: environment as 'development' | 'production' | 'test',
    debug: environment === 'development'
  };

  // 验证必需的环境变量
  if (!config.supabaseUrl) {
    console.warn('Missing VITE_APP_DB_URL environment variable');
  }

  if (!config.supabaseAnonKey) {
    console.warn('Missing VITE_APP_DB_POSTGRES_PASSWORD environment variable');
  }

  return config;
};

// 导出配置实例 - 注意：这个导出可能会在环境变量加载之前执行
// 在Node.js环境中，应该在需要时调用getConfig()而不是直接使用这个导出
export const config = getConfig();