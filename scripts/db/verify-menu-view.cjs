// verify-menu-view.cjs
// 验证菜单视图是否正确创建的脚本

const { createClient } = require('@supabase/supabase-js');

// 数据库配置
const SUPABASE_URL = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

console.log('=== 验证菜单视图 ===');
console.log('Supabase URL:', SUPABASE_URL);

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyMenuView() {
  try {
    console.log('\n1. 查询menu_view视图...');
    
    const { data, error } = await supabase
      .from('menu_view')
      .select('*')
      .order('category_name');

    if (error) {
      console.error('❌ 查询menu_view失败:', error.message);
      console.log('\n可能的原因:');
      console.log('1. menu_view视图尚未创建');
      console.log('2. 视图定义有错误');
      console.log('3. 数据库表结构与视图不匹配');
      console.log('\n解决方案:');
      console.log('请在Supabase SQL编辑器中运行create-menu-view.sql脚本');
      return false;
    } else {
      console.log('✅ menu_view查询成功');
      console.log(`找到 ${data.length} 个分类`);
      
      // 显示每个分类的信息
      data.forEach((category, index) => {
        console.log(`\n${index + 1}. ${category.category_name} (${category.category_id})`);
        if (category.items && Array.isArray(category.items)) {
          console.log(`   菜品数量: ${category.items.length}`);
          // 显示前3个菜品
          const itemsToShow = category.items.slice(0, 3);
          itemsToShow.forEach((item, itemIndex) => {
            console.log(`   - ${item.zh} (${item.id}): ¥${item.price}`);
          });
          if (category.items.length > 3) {
            console.log(`   ... 还有 ${category.items.length - 3} 个菜品`);
          }
        } else {
          console.log('   无菜品数据');
        }
      });
      
      return true;
    }
  } catch (error) {
    console.error('❌ 验证过程中发生异常:', error.message);
    return false;
  }
}

async function verifyTableStructure() {
  try {
    console.log('\n2. 验证表结构...');
    
    // 检查categories表结构
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, created_at')
      .limit(1);

    if (categoriesError) {
      console.error('❌ 查询categories表失败:', categoriesError.message);
    } else {
      console.log('✅ categories表结构正确');
    }

    // 检查dishes表结构
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id, dish_id, name, en_title, price, category_id, is_spicy, is_vegetarian, is_available, image_url, created_at')
      .limit(1);

    if (dishesError) {
      console.error('❌ 查询dishes表失败:', dishesError.message);
    } else {
      console.log('✅ dishes表结构正确');
    }
  } catch (error) {
    console.error('❌ 验证表结构时发生异常:', error.message);
  }
}

async function main() {
  console.log('开始验证菜单视图...\n');
  
  const viewSuccess = await verifyMenuView();
  await verifyTableStructure();
  
  console.log('\n=== 验证完成 ===');
  if (viewSuccess) {
    console.log('✅ 菜单视图配置正确，前端应该可以正常显示数据');
  } else {
    console.log('❌ 菜单视图配置有问题，请检查并修复');
  }
}

// 执行主函数
main();