#!/usr/bin/env node

/**
 * 验证数据库初始化结果
 * 检查表结构和数据是否正确创建
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 配置 Supabase 客户端
const supabaseUrl = process.env.VITE_APP_DB_URL;
const supabaseAnonKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('错误: 请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
  console.log('🔍 开始验证数据库初始化结果...');
  
  try {
    // 1. 检查 categories 表
    console.log('\n📋 检查 categories 表...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('❌ 查询 categories 表失败:', categoriesError.message);
    } else {
      console.log(`✅ categories 表查询成功，共有 ${categories.length} 条记录`);
      console.log('categories 表数据:');
      categories.forEach(category => {
        console.log(`  - ${category.key}: ${category.title_zh} (${category.title_en})`);
      });
    }
    
    // 2. 检查 dishes 表
    console.log('\n🍽️ 检查 dishes 表...');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id');
    
    if (dishesError) {
      console.error('❌ 查询 dishes 表失败:', dishesError.message);
    } else {
      console.log(`✅ dishes 表查询成功，共有 ${dishes.length} 条记录`);
    }
    
    // 3. 检查 orders 表
    console.log('\n📝 检查 orders 表...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id');
    
    if (ordersError) {
      console.error('❌ 查询 orders 表失败:', ordersError.message);
    } else {
      console.log(`✅ orders 表查询成功，共有 ${orders.length} 条记录`);
    }
    
    // 4. 检查 service_requests 表
    console.log('\n🔧 检查 service_requests 表...');
    const { data: serviceRequests, error: serviceRequestsError } = await supabase
      .from('service_requests')
      .select('id');
    
    if (serviceRequestsError) {
      console.error('❌ 查询 service_requests 表失败:', serviceRequestsError.message);
    } else {
      console.log(`✅ service_requests 表查询成功，共有 ${serviceRequests.length} 条记录`);
    }
    
    console.log('\n🎉 数据库验证完成');
  } catch (error) {
    console.error('❌ 验证数据库时出错:', error.message);
    process.exit(1);
  }
}

// 执行验证
verifyDatabase().catch(error => {
  console.error('❌ 验证过程中发生未捕获的错误:', error.message);
  process.exit(1);
});