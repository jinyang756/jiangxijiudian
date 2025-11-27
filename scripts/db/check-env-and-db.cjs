// check-env-and-db.cjs
// 检查环境变量并测试数据库连接

// 加载环境变量
require('dotenv').config({ path: '.env.development' });
require('dotenv').config({ path: '.env' });

console.log('=== 环境变量和数据库连接检查 ===');

// 显示环境变量
console.log('VITE_APP_DB_URL:', process.env.VITE_APP_DB_URL || '未设置');
console.log('VITE_APP_DB_POSTGRES_PASSWORD:', process.env.VITE_APP_DB_POSTGRES_PASSWORD || '未设置');

// 获取配置
const SUPABASE_URL = process.env.VITE_APP_DB_URL || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const SUPABASE_KEY = process.env.VITE_APP_DB_POSTGRES_PASSWORD || 'J2nkgp0cGZYF8iHk';

console.log('\n=== 使用的配置 ===');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key (前10位):', SUPABASE_KEY.substring(0, Math.min(10, SUPABASE_KEY.length)) + (SUPABASE_KEY.length > 10 ? '...' : ''));

// 测试数据库连接
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('\n=== 数据库连接测试 ===');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // 测试基本连接
    console.log('正在测试连接...');
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .single();

    if (error) {
      console.error('❌ 连接测试失败:', error.message);
      console.log('\n=== 故障排除建议 ===');
      console.log('1. 检查anon key是否正确');
      console.log('2. 确认Supabase项目URL是否正确');
      console.log('3. 检查网络连接');
      console.log('4. 确认Supabase项目是否正常运行');
      
      // 尝试使用JWT格式的anon key
      console.log('\n尝试使用JWT格式的anon key...');
      const JWT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';
      const supabaseJWT = createClient(SUPABASE_URL, JWT_KEY);
      
      const { data: jwtData, error: jwtError } = await supabaseJWT
        .from('categories')
        .select('count')
        .single();
        
      if (jwtError) {
        console.error('❌ JWT key连接也失败:', jwtError.message);
      } else {
        console.log('✅ JWT key连接成功');
        console.log('建议在环境变量中使用JWT格式的anon key');
      }
    } else {
      console.log('✅ 数据库连接成功');
      console.log('categories表记录数:', data.count);
    }
  } catch (error) {
    console.error('❌ 连接测试异常:', error.message);
  }
}

// 执行测试
testConnection();