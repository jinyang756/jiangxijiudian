// debug-app-state.js
// 调试应用状态的脚本

console.log('=== 应用状态调试 ===');

// 检查环境变量
console.log('环境变量检查:');
console.log('- VITE_APP_DB_URL:', import.meta.env.VITE_APP_DB_URL || '未设置');
console.log('- VITE_APP_DB_POSTGRES_PASSWORD:', import.meta.env.VITE_APP_DB_POSTGRES_PASSWORD ? '已设置' : '未设置');

// 检查localStorage
console.log('\nlocalStorage检查:');
try {
  const cart = localStorage.getItem('cart');
  console.log('- cart:', cart || '未设置');
} catch (e) {
  console.log('- localStorage访问失败:', e.message);
}

// 检查sessionStorage
console.log('\nsessionStorage检查:');
try {
  const tableId = sessionStorage.getItem('tableId');
  console.log('- tableId:', tableId || '未设置');
} catch (e) {
  console.log('- sessionStorage访问失败:', e.message);
}

// 检查网络连接
console.log('\n网络连接检查:');
fetch('/api/health')
  .then(response => {
    console.log('- API健康检查:', response.status);
  })
  .catch(error => {
    console.log('- API健康检查失败:', error.message);
  });

// 检查Supabase连接
console.log('\nSupabase连接检查:');
import('./src/lib/supabaseClient')
  .then(({ supabase }) => {
    supabase.from('categories').select('count').single()
      .then(({ data, error }) => {
        if (error) {
          console.log('- Supabase连接失败:', error.message);
        } else {
          console.log('- Supabase连接成功，categories数量:', data.count);
        }
      })
      .catch(error => {
        console.log('- Supabase查询异常:', error.message);
      });
  })
  .catch(error => {
    console.log('- Supabase客户端加载失败:', error.message);
  });

console.log('\n=== 调试完成 ===');