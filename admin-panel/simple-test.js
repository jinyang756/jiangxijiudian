#!/usr/bin/env node

/**
 * 简单的 Supabase 连接测试脚本
 * 用于测试江西酒店管理面板的数据库连接
 */

import { createClient } from '@supabase/supabase-js';

// 配置 Supabase 客户端
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

console.log('🚀 开始测试 Supabase 连接...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key 长度:', supabaseKey.length);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBasicConnection() {
  try {
    console.log('\n1. 测试 Supabase 客户端初始化...');
    
    // 测试基本连接 - 获取当前时间
    console.log('\n2. 测试基本数据库连接...');
    const { data, error } = await supabase.rpc('now');
    
    if (error) {
      console.error('❌ 基本连接测试失败:', error.message);
      return;
    }
    
    console.log('✅ 基本连接测试成功');
    console.log('   当前数据库时间:', data);
    
    // 测试获取 categories 表数据（使用简单查询）
    console.log('\n3. 测试查询 categories 表 (简单查询)...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id,name');
    
    if (categoriesError) {
      console.error('❌ 查询 categories 表失败:', categoriesError.message);
    } else {
      console.log('✅ 查询 categories 表成功');
      console.log('   找到记录数:', categories.length);
      if (categories.length > 0) {
        console.log('   第一条记录:', JSON.stringify(categories[0], null, 2));
      }
    }
    
    // 测试获取 orders 表数据（使用简单查询）
    console.log('\n4. 测试查询 orders 表 (简单查询)...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id');
    
    if (ordersError) {
      console.error('❌ 查询 orders 表失败:', ordersError.message);
    } else {
      console.log('✅ 查询 orders 表成功');
      console.log('   找到记录数:', orders.length);
    }
    
    console.log('\n🎉 基本连接测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testBasicConnection();