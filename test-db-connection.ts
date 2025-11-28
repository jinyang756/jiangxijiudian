#!/usr/bin/env tsx

// 测试数据库连接和menu_view视图
import dotenv from 'dotenv';
// 直接从环境变量创建 Supabase 客户端，而不是导入现有的客户端
import { createClient } from '@supabase/supabase-js';
import { api } from './services/api';

// 加载环境变量
dotenv.config();

// 直接创建 Supabase 客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log('🚀 开始数据库连接测试...\n');
  
  // 显示环境变量信息
  console.log('环境变量信息:');
  console.log('  VITE_SUPABASE_URL:', supabaseUrl);
  console.log('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');
  console.log('');
  
  try {
    // 1. 测试基本数据库连接
    console.log('1. 测试基本数据库连接...');
    const { error } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ 基本连接测试失败:', error.message);
      process.exit(1);
    }
    
    console.log('✅ 基本连接测试成功');
    console.log('📊 返回数据:', '成功');
    console.log('');
    
    // 2. 检查表是否存在
    console.log('2. 检查必要表是否存在...');
    const tablesToCheck = ['categories', 'dishes'];
    
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ 表 ${table} 不存在或无法访问:`, error.message);
        } else {
          console.log(`  ✅ 表 ${table} 存在`);
        }
      } catch (tableError: any) {
        console.log(`  ❌ 表 ${table} 检查失败:`, tableError.message);
      }
    }
    console.log('');
    
    // 3. 测试menu_view视图
    console.log('3. 测试menu_view视图...');
    const { data: viewData, error: viewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(1);
    
    if (viewError) {
      console.warn('⚠️  menu_view视图测试失败:', viewError.message);
      console.log('💡 提示: menu_view视图是一个可选的优化视图，即使不存在也不会影响应用的基本功能');
      console.log('   应用会自动回退到直接查询表的方式');
    } else {
      console.log('✅ menu_view视图测试成功');
      console.log('📊 返回数据:', viewData?.length || 0, '条记录');
    }
    console.log('');
    
    // 4. 测试API服务
    console.log('4. 测试API服务...');
    try {
      const menuResult = await api.getMenu();
      if (menuResult.code === 200) {
        console.log('✅ API服务测试成功');
        console.log('📊 返回菜单数据:', menuResult.data?.length || 0, '个分类');
      } else {
        console.error('❌ API服务测试失败:', menuResult.message);
      }
    } catch (apiError: any) {
      console.error('❌ API服务测试失败:', apiError.message);
    }
    console.log('');
    
    console.log('==================================================');
    console.log('🎉 数据库连接测试完成！');
    console.log('==================================================');
    
  } catch (error: any) {
    console.error('💥 测试过程中发生错误:', error.message);
    console.log('==================================================');
    console.log('💥 测试失败！请检查错误信息并修复问题。');
    console.log('==================================================');
    process.exit(1);
  }
}

testDatabaseConnection();