// test-db-query.cjs
// 简单的数据库查询测试脚本

const { createClient } = require('@supabase/supabase-js');

// 数据库配置
const SUPABASE_URL = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

console.log('=== 数据库查询测试 ===');
console.log('Supabase URL:', SUPABASE_URL);

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testQueries() {
  try {
    console.log('\n1. 测试数据库连接...');
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .single();

    if (error) {
      console.error('❌ 连接测试失败:', error.message);
      return;
    }
    console.log('✅ 数据库连接成功');

    console.log('\n2. 查询categories表...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('❌ 查询categories表失败:', categoriesError.message);
    } else {
      console.log(`✅ 查询categories表成功，共找到 ${categories.length} 条记录`);
      console.log('Categories:');
      categories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat.id})`);
      });
    }

    console.log('\n3. 查询dishes表...');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id, name, price, category_id')
      .limit(5);

    if (dishesError) {
      console.error('❌ 查询dishes表失败:', dishesError.message);
    } else {
      console.log(`✅ 查询dishes表成功，显示前5条记录:`);
      console.table(dishes);
    }

    console.log('\n4. 查询菜单视图...');
    const { data: menuView, error: menuViewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(3);

    if (menuViewError) {
      console.error('❌ 查询menu_view失败:', menuViewError.message);
      console.log('提示: 请确保已创建menu_view视图');
    } else {
      console.log(`✅ 查询menu_view成功，显示前3条记录:`);
      console.table(menuView);
    }

    console.log('\n=== 测试完成 ===');

  } catch (error) {
    console.error('❌ 测试过程中发生异常:', error.message);
  }
}

// 执行测试
testQueries();