// create-view-only.js
import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

console.log('使用Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createMenuView() {
  console.log('🚀 开始创建menu_view视图...');
  
  try {
    // 创建menu_view视图的SQL
    const createViewSql = `
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
    
    // 注意：Supabase JavaScript客户端不直接支持执行原始SQL
    // 我们需要通过其他方式创建视图
    console.log('请在Supabase SQL Editor中执行以下SQL语句:');
    console.log(createViewSql);
    
    console.log('\n或者，您可以使用Supabase CLI:');
    console.log('1. 将上面的SQL保存到文件中');
    console.log('2. 运行: npx supabase db push');
    
  } catch (error) {
    console.error('💥 创建视图过程中发生错误:', error.message);
  }
}

createMenuView();