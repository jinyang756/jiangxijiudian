// 检查数据库表结构
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

async function checkDatabaseStructure() {
  console.log('检查数据库表结构...');
  
  try {
    // 检查categories表结构
    console.log('\n--- 检查 categories 表 ---');
    const { data: categoriesSample, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('查询categories表时出错:', categoriesError.message);
    } else {
      console.log('categories表结构:');
      if (categoriesSample && categoriesSample.length > 0) {
        console.log(JSON.stringify(categoriesSample[0], null, 2));
      } else {
        console.log('categories表为空');
      }
    }
    
    // 检查dishes表结构
    console.log('\n--- 检查 dishes 表 ---');
    const { data: dishesSample, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .limit(1);
    
    if (dishesError) {
      console.error('查询dishes表时出错:', dishesError.message);
    } else {
      console.log('dishes表结构:');
      if (dishesSample && dishesSample.length > 0) {
        console.log(JSON.stringify(dishesSample[0], null, 2));
      } else {
        console.log('dishes表为空');
      }
    }
    
    // 检查特定字段是否存在
    console.log('\n--- 检查字段是否存在 ---');
    const { data: categoriesFields, error: categoriesFieldsError } = await supabase
      .from('categories')
      .select('id, key, title_zh, title_en, sort')
      .limit(1);
    
    if (categoriesFieldsError) {
      console.error('查询categories字段时出错:', categoriesFieldsError.message);
    } else {
      console.log('categories字段查询成功');
    }
    
    const { data: dishesFields, error: dishesFieldsError } = await supabase
      .from('dishes')
      .select('id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, image_url')
      .limit(1);
    
    if (dishesFieldsError) {
      console.error('查询dishes字段时出错:', dishesFieldsError.message);
    } else {
      console.log('dishes字段查询成功');
    }
    
  } catch (error) {
    console.error('检查过程中发生错误:', error);
  }
}

// 执行检查
checkDatabaseStructure();