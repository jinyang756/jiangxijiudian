// src/lib/config.ts
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
let supabaseUrl: string;
let supabaseAnonKey: string;

// 处理不同环境下的环境变量访问
if (typeof window !== 'undefined') {
  // 浏览器环境
  supabaseUrl = (window as any).importMetaEnv?.VITE_SUPABASE_URL;
  supabaseAnonKey = (window as any).importMetaEnv?.VITE_SUPABASE_ANON_KEY;
} else {
  // Node.js 环境
  supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
}

// 如果环境变量未设置，尝试从 import.meta.env 获取（Vite）
if (!supabaseUrl && import.meta.env) {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}

// 检查环境变量是否设置
if (!supabaseUrl) {
  console.warn('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.warn('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// 创建 Supabase 客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 导出配置用于调试
export const config = {
  supabaseUrl,
  supabaseAnonKey,
};