import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// 检查环境变量是否存在
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn('Supabase configuration missing. Using placeholder values for testing.');
  // 在测试环境中使用占位符值
  config.supabaseUrl = config.supabaseUrl || 'https://placeholder.supabase.co';
  config.supabaseAnonKey = config.supabaseAnonKey || 'placeholder-key';
}

// 创建 Supabase 客户端
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)