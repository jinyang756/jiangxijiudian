// 菜品数据导入脚本
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

async function importData() {
  console.log('开始导入菜品数据...');
  
  try {
    // 1. 导入分类数据
    console.log('正在导入分类数据...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'key' });
    
    if (categoryError) {
      console.error('导入分类数据时出错:', categoryError);
      return;
    }
    console.log('分类数据导入完成');
    
    // 2. 获取所有分类的ID
    const { data: allCategories, error: fetchError } = await supabase
      .from('categories')
      .select('id, key');
    
    if (fetchError) {
      console.error('获取分类数据时出错:', fetchError);
      return;
    }
    
    // 创建分类键到ID的映射
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.key] = cat.id;
    });
    
    // 3. 为每个菜品添加category_id
    const dishesWithCategoryId = dishes.map(dish => ({
      ...dish,
      category_id: categoryMap[dish.category_key]
    })).filter(dish => dish.category_id); // 过滤掉找不到分类的菜品
    
    // 4. 导入菜品数据
    console.log('正在导入菜品数据...');
    const { data: dishData, error: dishError } = await supabase
      .from('dishes')
      .upsert(dishesWithCategoryId, { onConflict: 'dish_id' });
    
    if (dishError) {
      console.error('导入菜品数据时出错:', dishError);
      return;
    }
    
    console.log(`成功导入 ${dishesWithCategoryId.length} 道菜品`);
    console.log('数据导入完成!');
    
  } catch (error) {
    console.error('导入过程中发生错误:', error);
  }
}

// 执行导入
importData();