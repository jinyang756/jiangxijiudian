// create-menu-view.js
import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createMenuView() {
  console.log('🚀 开始创建menu_view视图...');
  
  try {
    // 先删除已存在的视图（如果有的话）
    console.log('\n1. 删除已存在的menu_view视图...');
    const { error: dropError } = await supabase
      .rpc('execute_sql', { sql: 'DROP VIEW IF EXISTS menu_view;' });
    
    if (dropError) {
      console.warn('⚠️  删除视图时出错（可能视图不存在）:', dropError.message);
    } else {
      console.log('✅ 视图删除成功（如果存在）');
    }
    
    // 创建新的menu_view视图
    console.log('\n2. 创建新的menu_view视图...');
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
    
    const { error: createError } = await supabase
      .rpc('execute_sql', { sql: createViewSql });
    
    if (createError) {
      console.error('❌ 创建视图失败:', createError.message);
      return;
    }
    
    console.log('✅ menu_view视图创建成功');
    
    // 验证视图是否创建成功
    console.log('\n3. 验证视图...');
    const { data: viewData, error: viewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(1);
    
    if (viewError) {
      console.error('❌ 视图验证失败:', viewError.message);
    } else {
      console.log('✅ 视图验证成功');
      console.log('   返回记录数:', viewData.length);
    }
    
    console.log('\n🎉 menu_view视图创建完成!');
  } catch (error) {
    console.error('💥 创建视图过程中发生错误:', error.message);
  }
}

createMenuView();