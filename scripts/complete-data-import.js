// 完整数据导入脚本 - 创建表结构并导入所有数据
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_APP_DB_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

console.log('正在使用以下配置连接到 Supabase:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : '未设置');

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 菜品分类数据
const categories = [
  { key: 'appetizers', title_zh: '开胃菜', title_en: 'Appetizers', sort: 1 },
  { key: 'main_courses', title_zh: '主菜', title_en: 'Main Courses', sort: 2 },
  { key: 'soups', title_zh: '汤类', title_en: 'Soups', sort: 3 },
  { key: 'desserts', title_zh: '甜品', title_en: 'Desserts', sort: 4 },
  { key: 'beverages', title_zh: '饮品', title_en: 'Beverages', sort: 5 }
];

// 菜品数据
const dishes = [
  // 开胃菜
  { dish_id: 'A001', name_zh: '春卷', name_en: 'Spring Rolls', price: 25.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'appetizers' },
  { dish_id: 'A002', name_zh: '炸鸡翅', name_en: 'Fried Chicken Wings', price: 35.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'appetizers' },
  
  // 主菜
  { dish_id: 'M001', name_zh: '宫保鸡丁', name_en: 'Kung Pao Chicken', price: 48.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'main_courses' },
  { dish_id: 'M002', name_zh: '麻婆豆腐', name_en: 'Mapo Tofu', price: 28.00, is_spicy: true, is_vegetarian: true, available: true, category_key: 'main_courses' },
  { dish_id: 'M003', name_zh: '红烧肉', name_en: 'Braised Pork', price: 58.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'main_courses' },
  { dish_id: 'M004', name_zh: '糖醋里脊', name_en: 'Sweet and Sour Pork', price: 52.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'main_courses' },
  
  // 汤类
  { dish_id: 'S001', name_zh: '酸辣汤', name_en: 'Hot and Sour Soup', price: 18.00, is_spicy: true, is_vegetarian: true, available: true, category_key: 'soups' },
  { dish_id: 'S002', name_zh: '西红柿鸡蛋汤', name_en: 'Tomato and Egg Soup', price: 15.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'soups' },
  
  // 甜品
  { dish_id: 'D001', name_zh: '红豆沙', name_en: 'Red Bean Soup', price: 15.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'desserts' },
  { dish_id: 'D002', name_zh: '芒果布丁', name_en: 'Mango Pudding', price: 20.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'desserts' },
  
  // 饮品
  { dish_id: 'B001', name_zh: '绿茶', name_en: 'Green Tea', price: 12.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'beverages' },
  { dish_id: 'B002', name_zh: '可乐', name_en: 'Coca Cola', price: 15.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'beverages' }
];

// 创建表结构的SQL语句
const createTablesSQL = `
-- 创建categories表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建dishes表
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  dish_id TEXT UNIQUE NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price NUMERIC NOT NULL,
  is_spicy BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建orders表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建service_requests表
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  type TEXT NOT NULL,
  type_name TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

async function createTables() {
  console.log('正在创建数据库表结构...');
  
  try {
    // 注意：在Supabase中，直接执行DDL语句可能需要特殊的权限
    // 这里我们假设表结构已经通过Supabase SQL Editor创建
    console.log('表结构创建完成（假设已通过Supabase SQL Editor创建）');
    return true;
  } catch (error) {
    console.error('创建表结构时出错:', error.message);
    return false;
  }
}

async function importCategories() {
  console.log('正在导入分类数据...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'key' });
    
    if (error) {
      console.error('导入分类数据时出错:', error);
      return false;
    }
    
    console.log(`成功导入 ${data?.length || categories.length} 个分类`);
    return true;
  } catch (error) {
    console.error('导入分类数据时发生错误:', error);
    return false;
  }
}

async function importDishes() {
  console.log('正在导入菜品数据...');
  
  try {
    // 首先获取所有分类的ID
    const { data: allCategories, error: fetchError } = await supabase
      .from('categories')
      .select('id, key');

    if (fetchError) {
      console.error('获取分类数据时出错:', fetchError);
      return false;
    }
    
    // 创建分类键到ID的映射
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.key] = cat.id;
    });
    
    // 为每个菜品添加category_id
    const dishesWithCategoryId = dishes.map(dish => ({
      ...dish,
      category_id: categoryMap[dish.category_key]
    })).filter(dish => dish.category_id); // 过滤掉找不到分类的菜品
    
    // 导入菜品数据
    const { data, error } = await supabase
      .from('dishes')
      .upsert(dishesWithCategoryId, { onConflict: 'dish_id' });
    
    if (error) {
      console.error('导入菜品数据时出错:', error);
      return false;
    }
    
    console.log(`成功导入 ${dishesWithCategoryId.length} 道菜品`);
    return true;
  } catch (error) {
    console.error('导入菜品数据时发生错误:', error);
    return false;
  }
}

async function verifyImport() {
  console.log('正在验证导入结果...');
  
  try {
    // 检查分类数据
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('验证分类数据时出错:', categoriesError);
      return false;
    }
    
    // 检查菜品数据
    const { data: dishesData, error: dishesError } = await supabase
      .from('dishes')
      .select('*');
    
    if (dishesError) {
      console.error('验证菜品数据时出错:', dishesError);
      return false;
    }
    
    console.log(`验证结果: ${categoriesData.length} 个分类, ${dishesData.length} 道菜品`);
    return true;
  } catch (error) {
    console.error('验证导入结果时发生错误:', error);
    return false;
  }
}

async function completeImport() {
  console.log('开始完整数据导入...');
  
  try {
    // 1. 创建表结构
    // 注意：在实际使用中，这一步通常通过Supabase SQL Editor手动完成
    // await createTables();
    
    // 2. 导入分类数据
    const categoriesSuccess = await importCategories();
    if (!categoriesSuccess) {
      console.error('分类数据导入失败，终止导入过程');
      return;
    }
    
    // 3. 导入菜品数据
    const dishesSuccess = await importDishes();
    if (!dishesSuccess) {
      console.error('菜品数据导入失败');
      return;
    }
    
    // 4. 验证导入结果
    const verifySuccess = await verifyImport();
    if (!verifySuccess) {
      console.error('数据验证失败');
      return;
    }
    
    console.log('完整数据导入完成!');
  } catch (error) {
    console.error('导入过程中发生错误:', error);
    
    // 提供故障排除建议
    console.log('\n故障排除建议:');
    console.log('1. 检查网络连接是否正常');
    console.log('2. 确保 Supabase 项目 URL 和密钥配置正确');
    console.log('3. 检查数据库表是否已创建');
    console.log('4. 确认有足够的权限执行数据库操作');
    console.log('5. 确保 VITE_APP_DB_POSTGRES_PASSWORD 是有效的 anon key 或 service role key');
  }
}

// 执行完整导入
completeImport();