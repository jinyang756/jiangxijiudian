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
  const environment = import.meta.env.MODE || 'development';
  
  // 基础配置
  const config: AppConfig = {
    supabaseUrl: import.meta.env.VITE_APP_DB_URL || '',
    supabaseAnonKey: import.meta.env.VITE_APP_DB_POSTGRES_PASSWORD || '',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    environment: environment as 'development' | 'production' | 'test',
    debug: environment === 'development'
  };

  // 验证必需的环境变量
  if (!config.supabaseUrl) {
    throw new Error('Missing VITE_APP_DB_URL environment variable');
  }

  if (!config.supabaseAnonKey) {
    throw new Error('Missing VITE_APP_DB_POSTGRES_PASSWORD environment variable');
  }

  return config;
};

// 导出配置实例
export const config = getConfig();