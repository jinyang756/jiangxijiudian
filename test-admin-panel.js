// test-admin-panel.js
// 测试管理面板和数据库连接

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 从.env文件手动加载环境变量
function loadEnvFile() {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      // 跳过注释和空行
      if (line.trim() === '' || line.startsWith('#')) return;
      
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
      
      if (key && value) {
        process.env[key.trim()] = value;
      }
    });
  }
}

loadEnvFile();

console.log('=== 管理面板和数据库连接测试 ===\n');

// 获取环境变量
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('1. 环境变量检查');
console.log('-------------------');
console.log('Supabase URL:', supabaseUrl || '未设置');
console.log('Supabase Anon Key:', supabaseAnonKey ? '已设置' : '未设置');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ 缺少必要的环境变量，无法继续测试');
  process.exit(1);
}

// 动态导入Supabase客户端
async function runTests() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 测试数据库连接
  async function testDatabaseConnection() {
    console.log('\n2. 数据库连接测试');
    console.log('-------------------');
    
    try {
      // 测试查询categories表
      console.log('测试查询categories表...');
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .limit(5);
      
      if (categoriesError) {
        console.log('❌ categories表查询失败:', categoriesError.message);
      } else {
        console.log('✅ categories表查询成功');
        console.log('  返回记录数:', categories.length);
        if (categories.length > 0) {
          console.log('  第一条记录:', JSON.stringify(categories[0], null, 2));
        }
      }
      
      // 测试查询dishes表
      console.log('\n测试查询dishes表...');
      const { data: dishes, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .limit(5);
      
      if (dishesError) {
        console.log('❌ dishes表查询失败:', dishesError.message);
      } else {
        console.log('✅ dishes表查询成功');
        console.log('  返回记录数:', dishes.length);
        if (dishes.length > 0) {
          console.log('  第一条记录:', JSON.stringify(dishes[0], null, 2));
        }
      }
      
      // 测试查询menu_view视图
      console.log('\n测试查询menu_view视图...');
      const { data: menuView, error: menuViewError } = await supabase
        .from('menu_view')
        .select('*')
        .limit(5);
      
      if (menuViewError) {
        console.log('❌ menu_view视图查询失败:', menuViewError.message);
      } else {
        console.log('✅ menu_view视图查询成功');
        console.log('  返回记录数:', menuView.length);
        if (menuView.length > 0) {
          console.log('  第一条记录:', JSON.stringify(menuView[0], null, 2));
        }
      }
      
      // 测试orders表
      console.log('\n测试查询orders表...');
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(5);
      
      if (ordersError) {
        console.log('❌ orders表查询失败:', ordersError.message);
      } else {
        console.log('✅ orders表查询成功');
        console.log('  返回记录数:', orders.length);
      }
      
      // 测试service_requests表
      console.log('\n测试查询service_requests表...');
      const { data: serviceRequests, error: serviceRequestsError } = await supabase
        .from('service_requests')
        .select('*')
        .limit(5);
      
      if (serviceRequestsError) {
        console.log('❌ service_requests表查询失败:', serviceRequestsError.message);
      } else {
        console.log('✅ service_requests表查询成功');
        console.log('  返回记录数:', serviceRequests.length);
      }
    } catch (err) {
      console.log('❌ 数据库连接测试异常:', err.message);
    }
  }

  // 测试存储访问
  async function testStorageAccess() {
    console.log('\n3. 存储访问测试');
    console.log('-------------------');
    
    try {
      // 列出admin-panel存储桶中的文件
      console.log('列出admin-panel存储桶中的文件...');
      const { data: files, error: filesError } = await supabase.storage
        .from('admin-panel')
        .list('', {
          limit: 10,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (filesError) {
        console.log('❌ 存储桶访问失败:', filesError.message);
      } else {
        console.log('✅ 存储桶访问成功');
        console.log('  文件数量:', files.length);
        if (files.length > 0) {
          console.log('  文件列表:');
          files.slice(0, 5).forEach((file, index) => {
            console.log(`    ${index + 1}. ${file.name}`);
          });
          
          // 获取第一个文件的公共URL
          const firstFile = files[0];
          const { data: urlData } = supabase.storage
            .from('admin-panel')
            .getPublicUrl(firstFile.name);
          
          console.log(`  ${firstFile.name} 的公共URL:`, urlData?.publicUrl);
        }
      }
    } catch (err) {
      console.log('❌ 存储访问测试异常:', err.message);
    }
  }

  // 运行所有测试
  await testDatabaseConnection();
  await testStorageAccess();
  console.log('\n=== 测试完成 ===');
}

// 执行测试
runTests().catch(err => {
  console.error('测试执行失败:', err);
});