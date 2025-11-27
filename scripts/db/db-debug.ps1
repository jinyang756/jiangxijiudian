# db-debug.ps1
# 数据库调试脚本 (PowerShell版本)

Write-Host "=== 江西酒店数据库调试工具 ===" -ForegroundColor Green
Write-Host "请选择要执行的操作:"
Write-Host "1) 测试数据库连接"
Write-Host "2) 查看数据库表结构"
Write-Host "3) 查看categories表数据"
Write-Host "4) 查看dishes表数据"
Write-Host "5) 查看菜单视图数据"
Write-Host "6) 退出"

$choice = Read-Host "请输入选项 (1-6)"

switch ($choice) {
  "1" {
    Write-Host "测试数据库连接..." -ForegroundColor Yellow
    npm run test-db
  }
  "2" {
    Write-Host "查看数据库表结构..." -ForegroundColor Yellow
    node scripts/check-database-structure.js
  }
  "3" {
    Write-Host "查看categories表数据..." -ForegroundColor Yellow
    node scripts/debug-menu-data.js
  }
  "4" {
    Write-Host "查看dishes表数据..." -ForegroundColor Yellow
    node -e @"
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        'https://kdlhyzsihflwkwumxzfw.supabase.co',
        'J2nkgp0cGZYF8iHk'
      );
      
      supabase.from('dishes').select('*').limit(10).then(({ data, error }) => {
        if (error) {
          console.error('查询失败:', error.message);
        } else {
          console.log('Dishes表数据 (前10条):');
          console.table(data);
        }
      });
"@
  }
  "5" {
    Write-Host "查看菜单视图数据..." -ForegroundColor Yellow
    node -e @"
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        'https://kdlhyzsihflwkwumxzfw.supabase.co',
        'J2nkgp0cGZYF8iHk'
      );
      
      supabase.from('menu_view').select('*').limit(5).then(({ data, error }) => {
        if (error) {
          console.error('查询失败:', error.message);
        } else {
          console.log('Menu View数据 (前5条):');
          console.table(data);
        }
      });
"@
  }
  "6" {
    Write-Host "退出调试工具" -ForegroundColor Green
    exit 0
  }
  default {
    Write-Host "无效选项，请重新运行脚本" -ForegroundColor Red
    exit 1
  }
}

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")