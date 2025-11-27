#!/bin/bash
# db-debug.sh
# 数据库调试脚本

echo "=== 江西酒店数据库调试工具 ==="
echo "请选择要执行的操作:"
echo "1) 测试数据库连接"
echo "2) 查看数据库表结构"
echo "3) 查看categories表数据"
echo "4) 查看dishes表数据"
echo "5) 查看菜单视图数据"
echo "6) 执行自定义SQL查询"
echo "7) 退出"
echo ""

read -p "请输入选项 (1-7): " choice

case $choice in
  1)
    echo "测试数据库连接..."
    npm run test-db
    ;;
  2)
    echo "查看数据库表结构..."
    node scripts/check-database-structure.js
    ;;
  3)
    echo "查看categories表数据..."
    node -e "
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        'https://kdlhyzsihflwkwumxzfw.supabase.co',
        'J2nkgp0cGZYF8iHk'
      );
      
      supabase.from('categories').select('*').then(({ data, error }) => {
        if (error) {
          console.error('查询失败:', error.message);
        } else {
          console.log('Categories表数据:');
          console.table(data);
        }
      });
    "
    ;;
  4)
    echo "查看dishes表数据..."
    node -e "
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
    "
    ;;
  5)
    echo "查看菜单视图数据..."
    node -e "
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
    "
    ;;
  6)
    echo "执行自定义SQL查询..."
    read -p "请输入SQL查询语句: " sql_query
    echo "执行查询: $sql_query"
    node -e "
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        'https://kdlhyzsihflwkwumxzfw.supabase.co',
        'J2nkgp0cGZYF8iHk'
      );
      
      // 注意：这里只是示例，实际使用时需要根据具体查询调整
      supabase.from('categories').select('*').limit(5).then(({ data, error }) => {
        if (error) {
          console.error('查询失败:', error.message);
        } else {
          console.log('查询结果:');
          console.table(data);
        }
      });
    "
    ;;
  7)
    echo "退出调试工具"
    exit 0
    ;;
  *)
    echo "无效选项，请重新运行脚本"
    exit 1
    ;;
esac