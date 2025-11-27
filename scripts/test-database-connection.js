// 数据库连接测试脚本
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量 - 尝试多种方式
dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.development'), override: true });

console.log('环境变量加载结果:');
console.log('- VITE_APP_DB_URL:', process.env.VITE_APP_DB_URL);
console.log('- VITE_APP_DB_POSTGRES_PASSWORD:', process.env.VITE_APP_DB_POSTGRES_PASSWORD ? `${process.env.VITE_APP_DB_POSTGRES_PASSWORD.substring(0, 10)}...` : '未设置');

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_APP_DB_URL || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

console.log('使用的配置:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : '未设置');

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('测试数据库连接...');
  
  try {
    // 测试连接 - 获取categories表中的数据
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('数据库连接失败:', error.message);
      
      // 提供一些故障排除建议
      console.log('\n故障排除建议:');
      console.log('1. 检查 VITE_APP_DB_URL 是否正确设置为 Supabase 项目 URL (例如: https://your-project.supabase.co)');
      console.log('2. 检查 anon key 是否正确');
      console.log('3. 确保 Supabase 项目已正确配置并且数据库表已创建');
      console.log('4. 检查网络连接是否正常');
      return;
    }
    
    console.log('数据库连接成功!');
    console.log('categories表结构验证通过');
    
    // 检查是否有数据
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('查询categories表时出错:', categoriesError.message);
      return;
    }
    
    console.log(`categories表中有 ${categoriesData.length} 条记录`);
    
    // 检查dishes表
    const { data: dishesData, error: dishesError } = await supabase
      .from('dishes')
      .select('*');
    
    if (dishesError) {
      console.error('查询dishes表时出错:', dishesError.message);
      return;
    }
    
    console.log(`dishes表中有 ${dishesData.length} 条记录`);
    
    if (categoriesData.length > 0) {
      console.log('示例分类数据:');
      categoriesData.slice(0, 3).forEach(cat => {
        console.log(`  - ${cat.title_zh || cat.name || cat.key} (${cat.title_en || '无英文名称'})`);
      });
    }
    
    if (dishesData.length > 0) {
      console.log('示例菜品数据:');
      dishesData.slice(0, 3).forEach(dish => {
        console.log(`  - ${dish.name_zh || dish.name} (${dish.name_en || '无英文名称'}) - ¥${dish.price}`);
      });
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testConnection();