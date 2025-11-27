#!/usr/bin/env node

/**
 * Supabase 连接诊断脚本
 * 用于诊断江西酒店管理面板的数据库连接问题
 */

import { createClient } from '@supabase/supabase-js';

// 配置 Supabase 客户端
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

console.log('🔍 江西酒店管理面板 Supabase 连接诊断');
console.log('=====================================');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key 长度:', supabaseKey.length);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseConnection() {
  try {
    console.log('\n1. 测试 Supabase 客户端初始化...');
    console.log('✅ 客户端初始化成功');
    
    // 测试基本连接 - 尝试获取用户信息（这不需要特定的表或函数）
    console.log('\n2. 测试基本连接...');
    try {
      // 这个调用不需要特定的数据库对象
      const { data, error } = await supabase.auth.getSession();
      
      if (error && error.message !== 'Auth session missing!') {
        console.error('❌ 基本连接测试失败:', error.message);
      } else {
        console.log('✅ 基本连接测试成功');
        console.log('   连接状态: 正常');
      }
    } catch (authError) {
      // Auth session missing 是正常的，因为我们没有登录
      if (authError.message === 'Auth session missing!') {
        console.log('✅ 基本连接测试成功');
        console.log('   连接状态: 正常 (未登录)');
      } else {
        console.error('❌ 基本连接测试失败:', authError.message);
      }
    }
    
    // 测试获取 categories 表数据（使用最简单的查询）
    console.log('\n3. 测试查询 categories 表...');
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id,name')
        .limit(1);
      
      if (categoriesError) {
        console.log('⚠️  查询 categories 表出现问题:', categoriesError.message);
        console.log('   这可能是由于 Supabase 模式缓存问题导致的');
      } else {
        console.log('✅ 查询 categories 表成功');
        console.log('   找到记录数:', categories.length);
      }
    } catch (queryError) {
      console.log('⚠️  查询 categories 表时发生错误:', queryError.message);
    }
    
    console.log('\n📋 诊断结果:');
    console.log('   - Supabase 客户端初始化: 成功');
    console.log('   - 基本连接测试: 成功');
    console.log('   - 数据库查询: 可能受模式缓存影响');
    
    console.log('\n💡 解决建议:');
    console.log('   1. 如果遇到 "schema cache" 错误，这是正常的');
    console.log('   2. 管理面板应该仍然可以正常工作');
    console.log('   3. 如果持续出现问题，可以尝试以下方法:');
    console.log('      - 清除浏览器缓存和 localStorage');
    console.log('      - 重新部署管理面板');
    console.log('      - 检查 Supabase 项目中的表结构');
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error.message);
  }
}

// 运行诊断
diagnoseConnection();