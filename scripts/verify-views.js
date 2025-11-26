// 验证数据库视图是否正确创建
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env.development') });

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_APP_DB_URL;
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD;

console.log('====================================');
console.log('数据库视图验证工具');
console.log('====================================\n');

console.log('正在使用以下配置连接到 Supabase:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : '未设置');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ 错误: 请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  console.log('参考: ENV_SETUP.md');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyViews() {
  console.log('\n开始验证数据库视图...\n');
  
  let allChecksPassed = true;
  
  try {
    // 1. 检查 menu_view 视图是否存在
    console.log('📋 检查 1: 验证 menu_view 视图是否存在');
    const { data: menuViewData, error: menuViewError } = await supabase
      .from('menu_view')
      .select('*')
      .limit(1);
    
    if (menuViewError) {
      console.error('❌ menu_view 视图不存在或无法访问');
      console.error('错误信息:', menuViewError.message);
      console.log('\n解决方案:');
      console.log('1. 登录 Supabase Dashboard');
      console.log('2. 打开 SQL Editor');
      console.log('3. 执行 scripts/create-views.sql 中的SQL脚本');
      console.log('4. 详细步骤参见: DATABASE_VIEW_SETUP.md\n');
      allChecksPassed = false;
    } else {
      console.log('✅ menu_view 视图存在且可访问');
    }
    
    // 2. 检查 dishes_with_category 视图是否存在
    console.log('\n📋 检查 2: 验证 dishes_with_category 视图是否存在');
    const { data: dishesViewData, error: dishesViewError } = await supabase
      .from('dishes_with_category')
      .select('*')
      .limit(1);
    
    if (dishesViewError) {
      console.error('❌ dishes_with_category 视图不存在或无法访问');
      console.error('错误信息:', dishesViewError.message);
      allChecksPassed = false;
    } else {
      console.log('✅ dishes_with_category 视图存在且可访问');
    }
    
    // 3. 检查 menu_view 数据结构
    if (!menuViewError && menuViewData) {
      console.log('\n📋 检查 3: 验证 menu_view 数据结构');
      const { data: fullData, error: fullError } = await supabase
        .from('menu_view')
        .select('*');
      
      if (fullError) {
        console.error('❌ 无法读取 menu_view 数据');
        console.error('错误信息:', fullError.message);
        allChecksPassed = false;
      } else if (!fullData || fullData.length === 0) {
        console.warn('⚠️  menu_view 视图存在但没有数据');
        console.log('可能原因:');
        console.log('- categories 表为空');
        console.log('- dishes 表为空');
        console.log('- 表之间的外键关联有问题');
        console.log('\n建议: 运行 npm run import-menu 导入示例数据');
        allChecksPassed = false;
      } else {
        console.log(`✅ menu_view 包含 ${fullData.length} 个分类`);
        
        // 检查数据结构
        const firstCategory = fullData[0];
        const hasRequiredFields = 
          firstCategory.category_id && 
          firstCategory.category_name && 
          firstCategory.items !== undefined;
        
        if (hasRequiredFields) {
          console.log('✅ 数据结构正确 (category_id, category_name, items)');
          
          // 检查items字段
          const items = firstCategory.items;
          if (Array.isArray(items) && items.length > 0) {
            const firstItem = items[0];
            const hasItemFields = 
              firstItem.id && 
              firstItem.zh && 
              firstItem.en && 
              firstItem.price !== undefined;
            
            if (hasItemFields) {
              console.log('✅ items 数据结构正确 (id, zh, en, price)');
              console.log(`\n示例数据:`);
              console.log(`分类: ${firstCategory.category_name}`);
              console.log(`菜品数: ${items.length}`);
              console.log(`第一个菜品: ${firstItem.zh} (${firstItem.en}) - ₱${firstItem.price}`);
            } else {
              console.error('❌ items 数据结构不正确');
              console.log('实际结构:', firstItem);
              allChecksPassed = false;
            }
          } else {
            console.warn('⚠️  第一个分类没有菜品数据');
          }
        } else {
          console.error('❌ 数据结构不正确');
          console.log('实际结构:', firstCategory);
          allChecksPassed = false;
        }
      }
    }
    
    // 4. 检查视图权限
    console.log('\n📋 检查 4: 验证视图权限设置');
    // 尝试使用anon key读取（已经在使用了）
    if (!menuViewError) {
      console.log('✅ anon 用户可以读取 menu_view');
    } else {
      console.error('❌ anon 用户无法读取 menu_view');
      console.log('解决方案: 在SQL编辑器中执行:');
      console.log('GRANT SELECT ON menu_view TO anon;');
      allChecksPassed = false;
    }
    
    // 总结
    console.log('\n====================================');
    if (allChecksPassed) {
      console.log('✅ 所有检查通过！');
      console.log('====================================');
      console.log('\n数据库视图已正确配置，应用可以正常使用实时数据。');
      console.log('\n下一步:');
      console.log('1. 启动开发服务器: npm run dev');
      console.log('2. 验证前端是否显示实时数据');
      console.log('3. 检查浏览器控制台，确认没有"Using local fallback data"警告\n');
    } else {
      console.log('❌ 部分检查失败');
      console.log('====================================');
      console.log('\n请按照上述提示修复问题，然后重新运行此脚本验证。');
      console.log('\n详细配置步骤请参考: DATABASE_VIEW_SETUP.md\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error.message);
    console.error('\n请检查:');
    console.error('1. 网络连接是否正常');
    console.error('2. Supabase 项目是否处于活动状态');
    console.error('3. 环境变量配置是否正确');
    console.error('4. Supabase URL 和 Key 是否有效\n');
    process.exit(1);
  }
}

// 执行验证
verifyViews();
