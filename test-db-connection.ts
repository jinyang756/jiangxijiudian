#!/usr/bin/env tsx

// 测试数据库连接和menu_view视图
import dotenv from 'dotenv';
import { supabase } from './src/lib/supabaseClient';
import { api } from './services/api';

// 加载环境变量
dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...\n');
  
  // 显示环境变量信息
  console.log('环境变量信息:');
  console.log('  VITE_APP_DB_URL:', process.env.VITE_APP_DB_URL);
  console.log('  VITE_APP_DB_POSTGRES_PASSWORD:', process.env.VITE_APP_DB_POSTGRES_PASSWORD ? 'SET' : 'NOT SET');
  console.log('');
  
  try {
    // 1. 测试基本连接
    console.log('1. 测试基本数据库连接...');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ 基本连接测试失败:', error.message);
      console.log('💡 提示:');
      console.log('   1. 确保已在 .env 文件中设置正确的 Supabase 凭据');
      console.log('   2. 检查网络连接');
      console.log('   3. 确认 Supabase 项目已正确配置');
      return false;
    }
    console.log('✅ 基本连接测试成功');
    console.log('📊 返回数据:', data ? `${data.length} 条记录` : '无数据');
    
    // 2. 测试menu_view视图
    console.log('\n2. 测试menu_view视图...');
    const viewResult = await supabase
      .from('menu_view')
      .select('*')
      .limit(1);
    
    if (viewResult.error) {
      console.error('❌ menu_view视图测试失败:', viewResult.error.message);
      console.log('💡 提示: 请确保已运行 sql/create-menu-view.sql 脚本创建视图');
      return false;
    }
    console.log('✅ menu_view视图测试成功');
    console.log('📊 视图返回数据:', viewResult.data ? `${viewResult.data.length} 条记录` : '无数据');
    
    // 3. 测试API服务
    console.log('\n3. 测试API服务 getMenu 方法...');
    const menuResult = await api.getMenu();
    
    if (menuResult.code === 200) {
      console.log('✅ API服务测试成功');
      console.log('📊 菜单数据:', menuResult.data ? `${menuResult.data.length} 个分类` : '无数据');
    } else {
      console.error('❌ API服务测试失败:', menuResult.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
    console.log('💡 提示:');
    console.log('   1. 确保已在 .env 文件中设置正确的 Supabase 凭据');
    console.log('   2. 检查网络连接');
    console.log('   3. 确认 Supabase 项目已正确配置');
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始数据库连接测试...\n');
  
  const success = await testDatabaseConnection();
  
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 所有测试通过！数据库连接和menu_view视图工作正常。');
  } else {
    console.log('💥 测试失败！请检查错误信息并修复问题。');
  }
  console.log('='.repeat(50));
}

runTests();