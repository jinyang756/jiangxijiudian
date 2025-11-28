import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// 检查环境变量是否存在
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn('Supabase configuration missing. Using placeholder values for testing.');
  // 在测试环境中使用占位符值，但在生产环境中应该有正确的配置
  config.supabaseUrl = config.supabaseUrl || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  config.supabaseAnonKey = config.supabaseAnonKey || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
}

// 创建 Supabase 客户端
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)