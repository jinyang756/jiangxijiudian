// 简单的数据库测试
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env') });

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_APP_DB_URL;
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD;

console.log('正在使用以下配置连接到 Supabase:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : '未设置');

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleQuery() {
  console.log('测试简单查询...');
  
  try {
    // 测试categories查询
    console.log('\n--- 测试 categories 查询 ---');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, created_at')
      .limit(3);
    
    if (categoriesError) {
      console.error('Categories查询错误:', categoriesError.message);
    } else {
      console.log('Categories查询成功:');
      console.log(JSON.stringify(categories, null, 2));
    }
    
    // 测试dishes查询
    console.log('\n--- 测试 dishes 查询 ---');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id, dish_id, name, en_title, price, category_id, created_at')
      .limit(3);
    
    if (dishesError) {
      console.error('Dishes查询错误:', dishesError.message);
    } else {
      console.log('Dishes查询成功:');
      console.log(JSON.stringify(dishes, null, 2));
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testSimpleQuery();