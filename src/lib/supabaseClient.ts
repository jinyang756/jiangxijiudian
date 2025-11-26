import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// 创建 Supabase 客户端
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)