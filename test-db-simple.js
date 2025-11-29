#!/usr/bin/env node

// 简单的数据库连接测试脚本
// 注意：此脚本仅用于开发环境，不应在生产环境中使用

const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// 检查环境变量
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_SUPABASE_PROJECT') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.error('❌ 请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量');
  console.error('   可以在 .env.local 文件中设置这些变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('🚀 开始数据库测试...');
  
  try {
    // 测试categories表
    console.log('\n1. 测试categories表...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      console.error('❌ categories表查询失败:', categoriesError.message);
    } else {
      console.log('✅ categories表查询成功');
      console.log('   返回记录数:', categories.length);
    }
    
    // 测试dishes表
    console.log('\n2. 测试dishes表...');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .limit(5);
    
    if (dishesError) {
      console.error('❌ dishes表查询失败:', dishesError.message);
    } else {
      console.log('✅ dishes表查询成功');
      console.log('   返回记录数:', dishes.length);
    }
    
    // 测试menu_view视图
    console.log('\n3. 测试menu_view视图...');
    const { data: menuView, error: menuViewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(5);
    
    if (menuViewError) {
      console.warn('⚠️  menu_view视图查询失败:', menuViewError.message);
      console.log('   这可能是因为视图尚未创建');
    } else {
      console.log('✅ menu_view视图查询成功');
      console.log('   返回记录数:', menuView.length);
    }
    
    console.log('\n🎉 数据库测试完成!');
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message);
  }
}

testDatabase();