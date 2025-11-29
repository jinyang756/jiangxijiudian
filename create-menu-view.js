#!/usr/bin/env node

// 创建 menu_view 视图的脚本
// 注意：此脚本仅用于开发环境，不应在生产环境中使用

const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// 检查环境变量
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_SUPABASE_PROJECT') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.error('❌ 请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量');
  console.error('   可以在 .env.local 文件中设置这些变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createMenuView() {
  console.log('🚀 正在创建 menu_view 视图...');
  
  try {
    // 创建 menu_view 视图的 SQL
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        -- 创建 menu_view 视图
        DROP VIEW IF EXISTS menu_view;
        
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
      `
    });
    
    if (error) {
      console.error('❌ 创建 menu_view 视图失败:', error.message);
      process.exit(1);
    }
    
    console.log('✅ menu_view 视图创建成功');
  } catch (error) {
    console.error('❌ 创建 menu_view 视图时发生错误:', error.message);
    process.exit(1);
  }
}

createMenuView();