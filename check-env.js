// scripts/check-env.js
// 检查环境变量配置

console.log('=== 环境变量检查 ===');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '已设置' : '未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');

// 检查必需的环境变量
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.log('❌ 缺少必需的环境变量:', missingEnvVars);
  process.exit(1);
} else {
  console.log('✅ 所有必需的环境变量都已设置');
}

console.log('=== 检查完成 ===');