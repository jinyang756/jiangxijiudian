// direct-db-test.js
// 直接测试数据库连接的脚本

import { createClient } from '@supabase/supabase-js';

// 数据库配置
const SUPABASE_URL = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const SUPABASE_KEY = 'J2nkgp0cGZYF8iHk';

console.log('正在测试直接数据库连接...');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key (前10位):', SUPABASE_KEY.substring(0, 10) + '...');

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    console.log('\n--- 测试1: 基本连接测试 ---');
    // 测试基本连接
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ 连接测试失败:', error.message);
      console.error('错误代码:', error.code);
      return;
    }

    console.log('✅ 基本连接测试成功');
    console.log('返回数据:', JSON.stringify(data, null, 2));

    console.log('\n--- 测试2: 查询菜品表 ---');
    // 测试查询菜品表
    const { data: dishesData, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .limit(1);

    if (dishesError) {
      console.error('❌ 菜品表查询失败:', dishesError.message);
    } else {
      console.log('✅ 菜品表查询成功');
      console.log('菜品数据:', JSON.stringify(dishesData, null, 2));
    }

    console.log('\n--- 测试3: 查询菜单视图 ---');
    // 测试查询菜单视图
    const { data: menuViewData, error: menuViewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(1);

    if (menuViewError) {
      console.error('❌ 菜单视图查询失败:', menuViewError.message);
      console.error('这可能是因为menu_view视图尚未创建');
      console.log('请参考DATABASE_VIEW_SETUP.md创建视图');
    } else {
      console.log('✅ 菜单视图查询成功');
      console.log('视图数据:', JSON.stringify(menuViewData, null, 2));
    }

    console.log('\n--- 测试4: 插入测试数据 ---');
    // 测试插入数据
    const testCategory = {
      name: '测试分类',
      name_norm: '测试分类'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('categories')
      .insert(testCategory)
      .select();

    if (insertError) {
      console.error('❌ 插入测试失败:', insertError.message);
      console.log('这可能是由于权限限制，这是正常的');
    } else {
      console.log('✅ 插入测试成功');
      console.log('插入的数据:', JSON.stringify(insertData, null, 2));
      
      // 清理测试数据
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.error('清理测试数据失败:', deleteError.message);
        } else {
          console.log('✅ 测试数据已清理');
        }
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生异常:', error.message);
    console.error('堆栈跟踪:', error.stack);
  }
}

// 执行测试
testConnection();