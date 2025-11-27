#!/usr/bin/env node

/**
 * 验证数据库连接和 menu_view 视图
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 配置 Supabase 客户端
const supabaseUrl = process.env.VITE_APP_DB_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少必要的环境变量');
  console.error('请确保设置 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

console.log('🔍 验证数据库连接和 menu_view 视图');
console.log('=====================================');
console.log('Supabase URL:', supabaseUrl);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseConnection() {
  try {
    console.log('\n1. 测试数据库连接...');
    
    // 测试基本连接
    const { data, error } = await supabase.rpc('now');
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 数据库连接成功');
    console.log('   数据库时间:', data);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接测试异常:', error.message);
    return false;
  }
}

async function verifyMenuView() {
  try {
    console.log('\n2. 验证 menu_view 视图...');
    
    // 查询 menu_view
    const { data, error } = await supabase
      .from('menu_view')
      .select('category_id, category_name')
      .limit(1);
    
    if (error) {
      console.error('❌ menu_view 查询失败:', error.message);
      
      // 提供解决建议
      console.log('\n💡 解决建议:');
      console.log('   1. 确保已运行数据库初始化脚本: npm run init-db-optimized');
      console.log('   2. 手动创建视图: npm run verify-menu-view-db');
      console.log('   3. 检查数据库权限设置');
      return false;
    }
    
    console.log('✅ menu_view 视图可用');
    if (data && data.length > 0) {
      console.log('   示例数据:', data[0]);
    } else {
      console.log('   视图为空');
    }
    return true;
  } catch (error) {
    console.error('❌ menu_view 验证异常:', error.message);
    return false;
  }
}

async function verifyTables() {
  try {
    console.log('\n3. 验证基础表结构...');
    
    // 检查 categories 表
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, key, title_zh')
      .limit(1);
    
    if (categoriesError) {
      console.error('❌ categories 表访问失败:', categoriesError.message);
      return false;
    }
    
    console.log('✅ categories 表可用');
    
    // 检查 dishes 表
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id, dish_id, name_zh')
      .limit(1);
    
    if (dishesError) {
      console.error('❌ dishes 表访问失败:', dishesError.message);
      return false;
    }
    
    console.log('✅ dishes 表可用');
    return true;
  } catch (error) {
    console.error('❌ 表结构验证异常:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 开始数据库验证...\n');
  
  const connectionSuccess = await verifyDatabaseConnection();
  if (!connectionSuccess) {
    process.exit(1);
  }
  
  const tablesSuccess = await verifyTables();
  if (!tablesSuccess) {
    process.exit(1);
  }
  
  const viewSuccess = await verifyMenuView();
  if (!viewSuccess) {
    process.exit(1);
  }
  
  console.log('\n🎉 所有验证通过！');
  console.log('   数据库连接正常');
  console.log('   基础表结构完整');
  console.log('   menu_view 视图可用');
}

// 运行验证
main().catch(error => {
  console.error('❌ 验证过程中发生未预期的错误:', error.message);
  process.exit(1);
});