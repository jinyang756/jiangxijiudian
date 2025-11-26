// 检查数据库结构的脚本
import { supabase } from '../src/lib/supabaseClient.js';

async function checkDatabaseStructure() {
  console.log('开始检查数据库结构...');
  
  try {
    // 检查 categories 表
    console.log('\n1. 检查 categories 表:');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
      
    if (categoriesError) {
      console.error('  获取 categories 失败:', categoriesError.message);
    } else {
      console.log('  categories 表结构:');
      if (categories && categories.length > 0) {
        console.log('  字段:', Object.keys(categories[0]));
        console.log('  示例数据:', categories[0]);
      } else {
        console.log('  表为空或不存在');
      }
    }
    
    // 检查 dishes 表
    console.log('\n2. 检查 dishes 表:');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .limit(5);
      
    if (dishesError) {
      console.error('  获取 dishes 失败:', dishesError.message);
    } else {
      console.log('  dishes 表结构:');
      if (dishes && dishes.length > 0) {
        console.log('  字段:', Object.keys(dishes[0]));
        console.log('  示例数据:', dishes[0]);
      } else {
        console.log('  表为空或不存在');
      }
    }
    
    // 检查表是否存在
    console.log('\n3. 检查表是否存在:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.error('  获取表信息失败:', tablesError.message);
    } else {
      console.log('  数据库中的表:');
      tables.forEach(table => {
        console.log('   -', table.table_name);
      });
    }
    
  } catch (error) {
    console.error('检查数据库结构时出错:', error.message);
  }
}

checkDatabaseStructure();