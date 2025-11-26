// 数据库连接测试脚本
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_APP_DB_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

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
        console.log(`  - ${cat.title_zh} (${cat.title_en})`);
      });
    }
    
    if (dishesData.length > 0) {
      console.log('示例菜品数据:');
      dishesData.slice(0, 3).forEach(dish => {
        console.log(`  - ${dish.name_zh} (${dish.name_en}) - ¥${dish.price}`);
      });
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testConnection();