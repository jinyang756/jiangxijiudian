// scripts/init-database.js
// 初始化数据库结构

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function initDatabase() {
  console.log('初始化数据库结构...');
  
  try {
    // 1. 创建 menu_view 视图
    console.log('创建 menu_view 视图...');
    
    // 首先检查视图是否已存在
    const { data: existingViews, error: viewsError } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_name', 'menu_view');
    
    if (viewsError) {
      console.error('检查视图是否存在时出错:', viewsError);
    } else if (existingViews && existingViews.length > 0) {
      console.log('menu_view 视图已存在');
    } else {
      // 创建视图的 SQL（适配当前表结构）
      const createViewSQL = `
        CREATE OR REPLACE VIEW menu_view AS
        SELECT 
          c.id as category_id,
          c.name as category_name,
          json_agg(
            json_build_object(
              'id', d.id,
              'dish_id', d.dish_id,
              'name_zh', d.name_zh,
              'name_en', d.name_en,
              'price', d.price,
              'is_spicy', d.is_spicy,
              'is_vegetarian', d.is_vegetarian,
              'available', d.available
            ) ORDER BY d.name_zh
          ) FILTER (WHERE d.id IS NOT NULL) as items
        FROM categories c
        LEFT JOIN dishes d ON c.id = d.category_id
        GROUP BY c.id, c.name
        ORDER BY c.name;
      `;
      
      // 注意：我们无法直接通过 Supabase JS 客户端执行 DDL 语句
      // 需要通过 Supabase 控制台或其他方式执行
      
      console.log('请在 Supabase 控制台中执行以下 SQL 来创建 menu_view 视图:');
      console.log(createViewSQL);
    }
    
    // 2. 检查并更新行级安全策略
    console.log('检查行级安全策略...');
    
    // 检查 categories 表的策略
    const { data: categoriesPolicies, error: categoriesPoliciesError } = await supabase
      .from('information_schema.policy_table')
      .select('*')
      .eq('table_name', 'categories');
    
    if (categoriesPoliciesError) {
      console.error('检查 categories 表策略时出错:', categoriesPoliciesError);
    } else {
      console.log('categories 表策略:', categoriesPolicies);
    }
    
    // 检查 dishes 表的策略
    const { data: dishesPolicies, error: dishesPoliciesError } = await supabase
      .from('information_schema.policy_table')
      .select('*')
      .eq('table_name', 'dishes');
    
    if (dishesPoliciesError) {
      console.error('检查 dishes 表策略时出错:', dishesPoliciesError);
    } else {
      console.log('dishes 表策略:', dishesPolicies);
    }
    
    console.log('数据库初始化检查完成!');
    
  } catch (error) {
    console.error('初始化过程中发生错误:', error);
  }
}

// 执行初始化
initDatabase();