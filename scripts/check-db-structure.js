// 检查数据库表结构和数据
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.development') });

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_APP_DB_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('检查数据库表结构和数据...');
  
  try {
    // 检查categories表结构
    console.log('\n=== categories表结构 ===');
    const { data: categoriesSample, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('查询categories表时出错:', categoriesError.message);
    } else if (categoriesSample && categoriesSample.length > 0) {
      console.log('表结构:');
      console.log(Object.keys(categoriesSample[0]));
      console.log('示例数据:');
      console.log(categoriesSample[0]);
    } else {
      console.log('categories表为空或不存在');
    }
    
    // 检查dishes表结构
    console.log('\n=== dishes表结构 ===');
    const { data: dishesSample, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .limit(1);
    
    if (dishesError) {
      console.error('查询dishes表时出错:', dishesError.message);
    } else if (dishesSample && dishesSample.length > 0) {
      console.log('表结构:');
      console.log(Object.keys(dishesSample[0]));
      console.log('示例数据:');
      console.log(dishesSample[0]);
    } else {
      console.log('dishes表为空或不存在');
    }
    
  } catch (error) {
    console.error('检查过程中发生错误:', error);
  }
}

// 执行检查
checkDatabaseStructure();