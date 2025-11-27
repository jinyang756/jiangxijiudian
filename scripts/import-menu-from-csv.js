// 脚本用于从CSV文件导入菜单数据到数据库
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_APP_DB_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function importMenuData() {
  try {
    // 读取CSV文件
    const csvFilePath = path.join(process.cwd(), 'menu_data.csv');
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // 解析CSV数据
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    // 移除标题行
    records.shift();
    
    console.log(`开始导入 ${records.length} 条菜品数据...`);
    
    // 收集所有分类
    const categories = new Map();
    const dishes = [];
    
    for (const record of records) {
      // 构建分类对象
      const category = {
        key: record.category_key,
        title_zh: record.category_title_zh,
        title_en: record.category_title_en
      };
      
      // 将分类添加到Map中（自动去重）
      categories.set(category.key, category);
      
      // 构建菜品对象
      const dish = {
        dish_id: record.dish_id,
        category_key: record.category_key,
        name_zh: record.name_zh,
        name_en: record.name_en,
        price: parseFloat(record.price),
        is_spicy: record.is_spicy === 'true',
        is_vegetarian: record.is_vegetarian === 'true',
        available: record.available === 'true'
      };
      
      dishes.push(dish);
    }
    
    console.log(`发现 ${categories.size} 个分类和 ${dishes.length} 个菜品`);
    
    // 导入分类数据
    console.log('正在导入分类数据...');
    const categoryArray = Array.from(categories.values());
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert(categoryArray, {
        onConflict: 'key',
        returning: 'minimal'
      });
    
    if (categoryError) {
      console.error('导入分类数据时出错:', categoryError);
      return;
    }
    
    console.log('分类数据导入完成');
    
    // 获取所有分类的ID映射
    const { data: allCategories, error: fetchCategoriesError } = await supabase
      .from('categories')
      .select('id, key');
    
    if (fetchCategoriesError) {
      console.error('获取分类数据时出错:', fetchCategoriesError);
      return;
    }
    
    // 创建分类key到id的映射
    const categoryMap = new Map();
    allCategories.forEach(cat => {
      categoryMap.set(cat.key, cat.id);
    });
    
    // 更新菜品数据，添加category_id
    const dishesWithCategoryId = dishes.map(dish => ({
      ...dish,
      category_id: categoryMap.get(dish.category_key)
    })).filter(dish => dish.category_id); // 过滤掉找不到分类的菜品
    
    // 导入菜品数据
    console.log('正在导入菜品数据...');
    const { data: dishData, error: dishError } = await supabase
      .from('dishes')
      .upsert(dishesWithCategoryId, {
        onConflict: 'dish_id',
        returning: 'minimal'
      });
    
    if (dishError) {
      console.error('导入菜品数据时出错:', dishError);
      return;
    }
    
    console.log('菜品数据导入完成');
    
    // 创建menu_view视图
    console.log('正在创建menu_view视图...');
    const createViewSQL = `
      CREATE OR REPLACE VIEW menu_view AS
      SELECT 
          c.id AS category_id,
          c.name AS category_name,
          json_agg(
              json_build_object(
                  'id', d.dish_id,
                  'zh', d.name_zh,
                  'en', d.name_en,
                  'price', d.price,
                  'spicy', COALESCE(d.is_spicy, false),
                  'vegetarian', COALESCE(d.is_vegetarian, false),
                  'available', COALESCE(d.is_available, true),
                  'imageUrl', d.image_url
              ) ORDER BY d.created_at
          ) AS items
      FROM categories c
      LEFT JOIN dishes d ON c.id = d.category_id
      GROUP BY c.id, c.name
      ORDER BY c.created_at;
    `;
    
    const { error: viewError } = await supabase.rpc('execute_sql', { sql: createViewSQL });
    
    if (viewError) {
      console.error('创建menu_view视图时出错:', viewError);
      return;
    }
    
    console.log('menu_view视图创建完成');
    
    console.log('所有数据导入完成！');
    
  } catch (error) {
    console.error('导入过程中发生错误:', error);
  }
}

// 执行导入
importMenuData();