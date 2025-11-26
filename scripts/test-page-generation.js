// 测试页面生成逻辑
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

// 模拟页面生成逻辑
const ITEMS_PER_PAGE = 6;

async function testPageGeneration() {
  console.log('测试页面生成逻辑...');
  
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
    
    // 转换数据结构以匹配应用逻辑
    const menuData = categories.map((cat) => {
      // Find dishes belonging to this category
      const catDishes = dishes.filter(d => d.category_id === cat.id);
      
      const items = catDishes.map((record) => {
        return {
          id: record.dish_id || record.id,
          zh: record.name || record.name_norm || '',
          en: record.en_title || '',
          price: record.price || 0,
          spicy: record.is_spicy || false,
          vegetarian: record.is_vegetarian || false,
          available: record.available !== undefined ? record.available : true,
          imageUrl: record.image_url || undefined,
        };
      });
      
      return {
        key: cat.id,
        titleZh: cat.name || '',
        titleEn: cat.name || '', // 暂时使用name字段，因为没有单独的英文字段
        items: items,
      };
    });
    
    console.log('\n--- 转换后的菜单数据 ---');
    console.log('菜单数据长度:', menuData.length);
    console.log('菜单数据:', JSON.stringify(menuData, null, 2));
    
    // 模拟页面生成逻辑
    console.log('\n--- 模拟页面生成 ---');
    const generatedPages = [];
    const catMap = {};
    const keys = ['cover'];
    
    // 1. Cover Page
    generatedPages.push({ type: 'cover', id: 'cover', categoryKey: 'cover' });
    catMap['cover'] = 0;
    
    // 2. Content Pages
    if (menuData.length > 0) {
      console.log('开始生成内容页面');
      let globalPageCount = 1;
      menuData.forEach((category) => {
        console.log('处理分类:', category.titleZh);
        keys.push(category.key);
        catMap[category.key] = generatedPages.length;
        
        const items = category.items;
        const totalCatPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        console.log(`分类 ${category.titleZh} 有 ${items.length} 个菜品，需要 ${totalCatPages} 页`);
        
        for (let i = 0; i < totalCatPages; i++) {
          const start = i * ITEMS_PER_PAGE;
          const end = start + ITEMS_PER_PAGE;
          const pageItems = items.slice(start, end);
          console.log(`页面 ${i+1} 有 ${pageItems.length} 个菜品`);
          
          generatedPages.push({
            type: 'content',
            id: `${category.key}-${i}`,
            categoryKey: category.key,
            items: pageItems,
            categoryTitleZh: category.titleZh,
            categoryTitleEn: category.titleEn,
            pageNumber: globalPageCount++,
            totalPages: totalCatPages,
            categoryIndex: i + 1
          });
        }
      });
    }
    
    // 3. Back Cover
    keys.push('back');
    catMap['back'] = generatedPages.length;
    generatedPages.push({ type: 'back', id: 'back', categoryKey: 'back' });
    
    console.log('\n--- 生成的页面 ---');
    console.log('总页面数:', generatedPages.length);
    console.log('页面列表:');
    generatedPages.forEach((page, index) => {
      if (page.type === 'content') {
        console.log(`  ${index}. ${page.type} - ${page.categoryTitleZh} (${page.items.length} 个菜品)`);
      } else {
        console.log(`  ${index}. ${page.type}`);
      }
    });
    
    console.log('\n--- 分类映射 ---');
    console.log('分类映射:', catMap);
    console.log('分类键:', keys);
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testPageGeneration();