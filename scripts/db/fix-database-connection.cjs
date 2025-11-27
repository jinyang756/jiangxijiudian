// fix-database-connection.js
// 修复数据库连接和视图问题的脚本

const { createClient } = require('@supabase/supabase-js');

// 数据库配置 - 使用正确的anon key格式
const SUPABASE_URL = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
// 使用JWT格式的anon key
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

console.log('=== 修复数据库连接和视图问题 ===');
console.log('Supabase URL:', SUPABASE_URL);

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixDatabaseConnection() {
  try {
    console.log('\n1. 测试数据库连接...');
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .single();

    if (error) {
      console.error('❌ 连接测试失败:', error.message);
      console.log('尝试使用环境变量中的anon key...');
      
      // 如果JWT格式失败，尝试使用简单的anon key
      const simpleSupabase = createClient(
        SUPABASE_URL, 
        'J2nkgp0cGZYF8iHk'
      );
      
      const { data: simpleData, error: simpleError } = await simpleSupabase
        .from('categories')
        .select('count')
        .single();
        
      if (simpleError) {
        console.error('❌ 简单anon key连接也失败:', simpleError.message);
        return false;
      } else {
        console.log('✅ 使用简单anon key连接成功');
        return true;
      }
    } else {
      console.log('✅ 数据库连接成功');
      return true;
    }
  } catch (error) {
    console.error('❌ 连接测试异常:', error.message);
    return false;
  }
}

async function checkAndCreateViews() {
  try {
    console.log('\n2. 检查菜单视图是否存在...');
    
    // 检查menu_view是否存在
    const { data: viewData, error: viewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(1);

    if (viewError && viewError.message.includes('not found') || viewError.message.includes('relation')) {
      console.log('❌ 菜单视图不存在，需要创建');
      console.log('请运行以下SQL来创建视图:');
      console.log(`
-- 创建 menu_view 视图
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    c.id AS category_id,
    c.title_zh AS category_name,
    json_agg(
        json_build_object(
            'id', d.dish_id,
            'zh', d.name_zh,
            'en', d.name_en,
            'price', d.price,
            'spicy', d.is_spicy,
            'vegetarian', d.is_vegetarian,
            'available', d.available,
            'imageUrl', d.image_url
        ) ORDER BY d.created_at
    ) AS items
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.title_zh
ORDER BY c.sort;
      `);
      return false;
    } else {
      console.log('✅ 菜单视图存在');
      console.log('视图数据示例:');
      console.table(viewData);
      return true;
    }
  } catch (error) {
    console.error('❌ 检查视图时发生异常:', error.message);
    return false;
  }
}

async function checkTableData() {
  try {
    console.log('\n3. 检查表数据...');
    
    // 检查categories表
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ 查询categories表失败:', categoriesError.message);
    } else {
      console.log(`✅ categories表有 ${categories.length} 条记录`);
      console.table(categories.slice(0, 3)); // 显示前3条
    }

    // 检查dishes表
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .limit(5);

    if (dishesError) {
      console.error('❌ 查询dishes表失败:', dishesError.message);
    } else {
      console.log(`✅ dishes表有 ${dishes.length} 条记录`);
      console.table(dishes);
    }
  } catch (error) {
    console.error('❌ 检查表数据时发生异常:', error.message);
  }
}

async function main() {
  console.log('开始修复数据库连接和视图问题...\n');
  
  const connectionSuccess = await fixDatabaseConnection();
  if (!connectionSuccess) {
    console.log('\n❌ 数据库连接失败，请检查配置');
    return;
  }
  
  await checkAndCreateViews();
  await checkTableData();
  
  console.log('\n=== 修复完成 ===');
  console.log('如果连接成功但视图不存在，请手动创建视图');
  console.log('如果数据为空，请导入初始数据');
}

// 执行主函数
main();