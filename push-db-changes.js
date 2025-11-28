#!/usr/bin/env node

/**
 * 江西酒店数据库更改推送脚本
 * 通过Supabase CLI推送数据库视图和数据更改
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查是否安装了Docker
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// 检查是否安装了Supabase CLI
function checkSupabaseCLI() {
  try {
    execSync('npx supabase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// 创建数据库迁移文件
function createMigrationFile() {
  const migrationContent = `-- 创建 menu_view 视图
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

-- 添加注释
COMMENT ON VIEW menu_view IS '菜单视图，用于前端应用获取分类和菜品的嵌套数据结构';

-- 为表添加行级安全策略（RLS）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagged_orders ENABLE ROW LEVEL SECURITY;

-- 为表添加插入策略
CREATE POLICY "public can insert categories"
ON categories
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can insert dishes"
ON dishes
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can insert orders"
ON orders
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can insert service_requests"
ON service_requests
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can insert tagged_orders"
ON tagged_orders
FOR INSERT TO anon
WITH CHECK (true);`;

  // 创建migrations目录（如果不存在）
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  // 生成带时间戳的迁移文件名
  const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
  const migrationFileName = \`\${timestamp}_create_menu_view_and_policies.sql\`;
  const migrationFilePath = path.join(migrationsDir, migrationFileName);

  // 写入迁移文件
  fs.writeFileSync(migrationFilePath, migrationContent);
  console.log(\`✅ 已创建迁移文件: \${migrationFileName}\`);
  
  return migrationFilePath;
}

// 链接到Supabase项目
function linkToProject() {
  console.log('🔗 正在链接到Supabase项目...');
  
  // 这里需要用户输入项目ref，但在自动化脚本中我们尝试从环境变量获取
  try {
    execSync('npx supabase link', { stdio: 'inherit' });
    console.log('✅ 成功链接到Supabase项目');
  } catch (error) {
    console.error('❌ 链接项目失败，请确保已正确配置项目链接');
    throw error;
  }
}

// 推送数据库更改
function pushDatabaseChanges() {
  console.log('🚀 正在推送数据库更改...');
  
  try {
    execSync('npx supabase db push', { stdio: 'inherit' });
    console.log('✅ 数据库更改推送成功');
  } catch (error) {
    console.error('❌ 数据库更改推送失败');
    throw error;
  }
}

// 验证视图是否创建成功
function verifyView() {
  console.log('🔍 正在验证menu_view视图...');
  
  const verifyScript = \`const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 未找到Supabase配置，请检查环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyView() {
  try {
    const { data, error } = await supabase
      .from('menu_view')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ 查询menu_view视图失败:', error.message);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('✅ menu_view视图创建成功，返回数据:', JSON.stringify(data[0], null, 2));
      process.exit(0);
    } else {
      console.log('⚠️ menu_view视图已创建但无数据');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ 验证视图时发生错误:', error.message);
    process.exit(1);
  }
}

verifyView();
\`;

  // 写入验证脚本
  const verifyScriptPath = path.join(__dirname, 'verify-menu-view.js');
  fs.writeFileSync(verifyScriptPath, verifyScript);
  
  // 执行验证脚本
  try {
    execSync(\`node "\${verifyScriptPath}"\`, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ 验证视图失败');
    throw error;
  } finally {
    // 清理验证脚本
    if (fs.existsSync(verifyScriptPath)) {
      fs.unlinkSync(verifyScriptPath);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 江西酒店数据库更改推送脚本开始执行');
  
  // 检查依赖
  if (!checkDocker()) {
    console.error('❌ 未检测到Docker，请先安装Docker: https://www.docker.com/products/docker-desktop');
    process.exit(1);
  }
  
  if (!checkSupabaseCLI()) {
    console.error('❌ 未检测到Supabase CLI，请先安装: npm install -g supabase');
    process.exit(1);
  }
  
  try {
    // 创建迁移文件
    createMigrationFile();
    
    // 链接到项目
    linkToProject();
    
    // 推送数据库更改
    pushDatabaseChanges();
    
    // 验证视图
    verifyView();
    
    console.log('🎉 所有操作已完成！');
  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}
\`;

  fs.writeFileSync('push-db-changes.js', scriptContent);
  console.log('✅ 数据库推送脚本已创建: push-db-changes.js');
}

// 执行脚本创建
createPushScript();

console.log('使用说明:');
console.log('1. 确保已安装Docker和Supabase CLI');
console.log('2. 在项目根目录运行: node push-db-changes.js');
console.log('3. 脚本将自动创建迁移文件并推送数据库更改');