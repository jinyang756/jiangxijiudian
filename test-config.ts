#!/usr/bin/env tsx

/**
 * 配置测试脚本
 * 验证环境变量和配置是否正确设置
 */

import dotenv from 'dotenv';
import { config } from './src/lib/config';

// 加载环境变量
dotenv.config();

console.log('🔍 配置测试');
console.log('============');

console.log('Supabase URL:', config.supabaseUrl ? '✅ 已设置' : '❌ 未设置');
console.log('Supabase Anon Key:', config.supabaseAnonKey ? '✅ 已设置' : '❌ 未设置');

// 检查环境变量
console.log('\n环境变量:');
console.log('  VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
console.log('  VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置');

console.log('\n配置对象:');
console.log('  Supabase URL:', config.supabaseUrl || '未设置');
console.log('  Supabase Anon Key:', config.supabaseAnonKey || '未设置');

// 直接检查环境变量（绕过config模块的逻辑）
const directSupabaseUrl = process.env.VITE_SUPABASE_URL;
const directSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n直接环境变量检查:');
console.log('  VITE_SUPABASE_URL:', directSupabaseUrl || '未设置');
console.log('  VITE_SUPABASE_ANON_KEY:', directSupabaseAnonKey || '未设置');

// 检查必需的配置
if (directSupabaseUrl && directSupabaseAnonKey) {
  console.log('\n🎉 所有必需配置均已正确设置');
  process.exit(0);
} else {
  console.log('\n⚠️  缺少必需的配置');
  console.log('   这在开发环境中是正常的，只要确保在生产环境中设置了这些变量即可。');
  process.exit(0); // 在开发环境中我们不希望脚本失败
}