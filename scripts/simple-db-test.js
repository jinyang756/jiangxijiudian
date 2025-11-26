// 简单的数据库测试脚本
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const supabaseUrl = process.env.VITE_APP_DB_URL || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseAnonKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log('开始测试数据库连接...');
  
  try {
    // 测试数据库连接
    console.log('\n1. 测试数据库连接:');
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1);
      
    if (error) {
      console.error('  数据库连接失败:', error.message);
      return;
    }
    
    console.log('  数据库连接成功!');
    console.log('  categories 表查询结果:', data);
    
    // 查询 dishes 表
    console.log('\n2. 查询 dishes 表:');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id, dish_id, name, en_title, price, category_id')
      .limit(3);
      
    if (dishesError) {
      console.error('  dishes 表查询失败:', dishesError.message);
    } else {
      console.log('  dishes 表查询成功:');
      console.log('  字段:', dishes && dishes.length > 0 ? Object.keys(dishes[0]) : '无数据');
      console.log('  示例数据:', dishes);
    }
    
    // 尝试查询视图（如果已创建）
    console.log('\n3. 尝试查询 menu_view:');
    const { data: menuView, error: menuViewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(1);
      
    if (menuViewError) {
      console.log('  menu_view 查询失败（可能尚未创建）:', menuViewError.message);
    } else {
      console.log('  menu_view 查询成功:');
      console.log('  数据:', menuView);
    }
    
  } catch (error) {
    console.error('测试数据库连接时出错:', error.message);
  }
}

testDatabaseConnection();