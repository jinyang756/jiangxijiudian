// test-db-simple.mjs
import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('🚀 开始数据库测试...');
  
  try {
    // 测试categories表
    console.log('\n1. 测试categories表...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      console.error('❌ categories表查询失败:', categoriesError.message);
    } else {
      console.log('✅ categories表查询成功');
      console.log('   返回记录数:', categories.length);
      console.log('   数据:', JSON.stringify(categories, null, 2));
    }
    
    // 测试dishes表
    console.log('\n2. 测试dishes表...');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .limit(5);
    
    if (dishesError) {
      console.error('❌ dishes表查询失败:', dishesError.message);
    } else {
      console.log('✅ dishes表查询成功');
      console.log('   返回记录数:', dishes.length);
    }
    
    // 测试menu_view视图
    console.log('\n3. 测试menu_view视图...');
    const { data: menuView, error: menuViewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(5);
    
    if (menuViewError) {
      console.warn('⚠️  menu_view视图查询失败:', menuViewError.message);
      console.log('   这可能是因为视图尚未创建');
    } else {
      console.log('✅ menu_view视图查询成功');
      console.log('   返回记录数:', menuView.length);
    }
    
    console.log('\n🎉 数据库测试完成!');
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message);
  }
}

testDatabase();