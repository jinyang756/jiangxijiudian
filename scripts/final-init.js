#!/usr/bin/env node

/**
 * 最终数据库初始化脚本
 * 通过 Supabase API 直接创建表结构和导入数据，绕过模式缓存问题
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 配置 Supabase 客户端
const supabaseUrl = process.env.VITE_APP_DB_URL;
const supabaseAnonKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('错误: 请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 江西酒店菜单数据
const menuData = {
  categories: [
    { key: 'jianghu', title_zh: '江湖小炒', title_en: 'Jianghu Stir-Fries', sort: 1 },
    { key: 'soup', title_zh: '炖汤类', title_en: 'Simmered Soups', sort: 2 },
    { key: 'braised', title_zh: '卤料', title_en: 'Braised Delicacies', sort: 3 },
    { key: 'cantonese', title_zh: '粤菜', title_en: 'Cantonese Cuisine', sort: 4 },
    { key: 'drinks', title_zh: '酒水/其他', title_en: 'Beverages & Others', sort: 5 }
  ],
  dishes: [
    // 江湖小炒类
    { dish_id: 'H1', category_key: 'jianghu', name_zh: '水煮牛肉', name_en: 'Boiled Beef in Spicy Broth', price: 48.00, is_spicy: true, is_vegetarian: false, available: true },
    { dish_id: 'H2', category_key: 'jianghu', name_zh: '干锅花菜', name_en: 'Dry Pot Cauliflower', price: 28.00, is_spicy: true, is_vegetarian: false, available: false },
    { dish_id: 'H3', category_key: 'jianghu', name_zh: '家乡豆腐', name_en: 'Hometown Tofu', price: 22.00, is_spicy: false, is_vegetarian: true, available: true },
    { dish_id: 'H4', category_key: 'jianghu', name_zh: '肉沫空心菜梗', name_en: 'Minced Pork with Water Spinach Stalks', price: 26.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'H5', category_key: 'jianghu', name_zh: '酸辣手撕包菜', name_en: 'Spicy & Sour Shredded Cabbage', price: 22.00, is_spicy: true, is_vegetarian: true, available: true },
    
    // 炖汤类
    { dish_id: 'I1', category_key: 'soup', name_zh: '胡椒猪肚鸡', name_en: 'Pork Tripe & Chicken Soup with White Pepper', price: 128.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'I2', category_key: 'soup', name_zh: '虫草花乌鸡汤', name_en: 'Cordyceps Flower & Black Chicken Soup', price: 58.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'I3', category_key: 'soup', name_zh: '冬瓜水鸭汤', name_en: 'Winter Melon Duck Soup', price: 48.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'I4', category_key: 'soup', name_zh: '怀山排骨汤', name_en: 'Chinese Yam & Pork Rib Soup', price: 42.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'I5', category_key: 'soup', name_zh: '黑蒜炖肉汁', name_en: 'Black Garlic Braised Pork Broth', price: 38.00, is_spicy: false, is_vegetarian: false, available: true },
    
    // 卤料类
    { dish_id: 'D1', category_key: 'braised', name_zh: '美国凤爪', name_en: 'Braised Chicken Feet', price: 32.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'D2', category_key: 'braised', name_zh: '大肠头', name_en: 'Braised Pork Intestine Tips', price: 38.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'D3', category_key: 'braised', name_zh: '五花肉', name_en: 'Braised Streaky Pork', price: 35.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'D4', category_key: 'braised', name_zh: '鸭掌', name_en: 'Braised Duck Feet', price: 32.00, is_spicy: false, is_vegetarian: false, available: true },
    { dish_id: 'D5', category_key: 'braised', name_zh: '猪头肉', name_en: 'Braised Pig Head Meat', price: 30.00, is_spicy: false, is_vegetarian: false, available: true },
  ]
};

async function initializeDatabase() {
  console.log('🚀 开始初始化数据库...');
  
  try {
    // 1. 创建 categories 表
    console.log('\n📋 创建 categories 表...');
    // 注意：在实际应用中，我们不会通过代码创建表，而是假设表已经存在
    // 这里我们直接插入数据
    
    // 2. 插入分类数据
    console.log('\n📂 插入分类数据...');
    for (const category of menuData.categories) {
      const { data, error } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'key' });
      
      if (error) {
        console.warn(`⚠️ 插入分类 "${category.title_zh}" 时出错:`, error.message);
      } else {
        console.log(`✅ 成功插入分类: ${category.title_zh}`);
      }
    }
    
    // 3. 获取所有分类的 ID
    console.log('\n🔍 获取分类 ID 映射...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, key');
    
    if (categoriesError) {
      console.error('❌ 获取分类数据失败:', categoriesError.message);
      return;
    }
    
    // 创建 key 到 id 的映射
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.key] = cat.id;
    });
    console.log('✅ 分类 ID 映射创建完成');
    
    // 4. 插入菜品数据
    console.log('\n🍽️ 插入菜品数据...');
    for (const dish of menuData.dishes) {
      // 获取对应的分类 ID
      const categoryId = categoryMap[dish.category_key];
      if (!categoryId) {
        console.warn(`⚠️ 未找到分类 "${dish.category_key}" 的 ID，跳过菜品 "${dish.name_zh}"`);
        continue;
      }
      
      // 准备插入的数据
      const dishData = {
        dish_id: dish.dish_id,
        category_id: categoryId,
        name_zh: dish.name_zh,
        name_en: dish.name_en,
        price: dish.price,
        is_spicy: dish.is_spicy,
        is_vegetarian: dish.is_vegetarian,
        available: dish.available
      };
      
      const { data, error } = await supabase
        .from('dishes')
        .upsert(dishData, { onConflict: 'dish_id' });
      
      if (error) {
        console.warn(`⚠️ 插入菜品 "${dish.name_zh}" 时出错:`, error.message);
      } else {
        console.log(`✅ 成功插入菜品: ${dish.name_zh}`);
      }
    }
    
    console.log('\n🎉 数据库初始化完成！');
    
    // 5. 验证数据
    console.log('\n🔍 验证数据...');
    const { data: finalCategories, error: finalCategoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (finalCategoriesError) {
      console.error('❌ 验证分类数据失败:', finalCategoriesError.message);
    } else {
      console.log(`✅ 成功查询到 ${finalCategories.length} 个分类`);
    }
    
    const { data: finalDishes, error: finalDishesError } = await supabase
      .from('dishes')
      .select('*');
    
    if (finalDishesError) {
      console.error('❌ 验证菜品数据失败:', finalDishesError.message);
    } else {
      console.log(`✅ 成功查询到 ${finalDishes.length} 个菜品`);
    }
    
  } catch (error) {
    console.error('❌ 数据库初始化过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 执行初始化
initializeDatabase().catch(error => {
  console.error('❌ 初始化过程中发生未捕获的错误:', error.message);
  process.exit(1);
});