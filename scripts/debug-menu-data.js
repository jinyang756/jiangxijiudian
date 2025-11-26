// 调试菜单数据加载
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

async function debugMenuData() {
  console.log('调试菜单数据加载...');
  
  try {
    // 获取所有分类
    console.log('\n--- 获取 categories ---');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (categoriesError) {
      console.error('获取categories失败:', categoriesError.message);
      return;
    }
    
    console.log(`成功获取 ${categories.length} 个分类:`);
    categories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (ID: ${cat.id})`);
    });
    
    // 获取所有菜品
    console.log('\n--- 获取 dishes ---');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (dishesError) {
      console.error('获取dishes失败:', dishesError.message);
      return;
    }
    
    console.log(`成功获取 ${dishes.length} 个菜品:`);
    
    // 按分类组织菜品
    const dishesByCategory = {};
    categories.forEach(cat => {
      dishesByCategory[cat.id] = dishes.filter(dish => dish.category_id === cat.id);
    });
    
    // 显示每个分类的菜品
    categories.forEach((cat, index) => {
      const catDishes = dishesByCategory[cat.id] || [];
      console.log(`\n  分类 ${index + 1}: ${cat.name} (${catDishes.length} 个菜品)`);
      catDishes.slice(0, 3).forEach((dish, dishIndex) => {
        console.log(`    ${dishIndex + 1}. ${dish.name} - ¥${dish.price} (ID: ${dish.dish_id || dish.id})`);
      });
      if (catDishes.length > 3) {
        console.log(`    ... 还有 ${catDishes.length - 3} 个菜品`);
      }
    });
    
  } catch (error) {
    console.error('调试过程中发生错误:', error);
  }
}

// 执行调试
debugMenuData();