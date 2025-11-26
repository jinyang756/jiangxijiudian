// 测试 menu_view 查询的脚本
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const supabaseUrl = process.env.VITE_APP_DB_URL || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseAnonKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMenuView() {
  console.log('开始测试 menu_view 查询...');
  
  try {
    // 查询 menu_view
    console.log('\n1. 查询 menu_view:');
    const { data: menuData, error: menuError } = await supabase
      .from('menu_view')
      .select('category_id, category_name, items')
      .order('category_name');
      
    if (menuError) {
      console.error('  查询 menu_view 失败:', menuError.message);
    } else {
      console.log('  menu_view 查询成功:');
      console.log('  分类数量:', menuData.length);
      
      if (menuData && menuData.length > 0) {
        menuData.forEach((category, index) => {
          console.log(`  分类 ${index + 1}: ${category.category_name}`);
          console.log(`    菜品数量: ${category.items ? category.items.length : 0}`);
          if (category.items && category.items.length > 0) {
            console.log(`    第一个菜品:`, category.items[0]);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('测试 menu_view 时出错:', error.message);
  }
}

testMenuView();