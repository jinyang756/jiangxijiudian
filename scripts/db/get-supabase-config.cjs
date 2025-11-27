// get-supabase-config.cjs
// 获取Supabase正确配置的脚本

console.log('=== Supabase配置信息 ===');

// 从环境变量获取配置
const SUPABASE_URL = process.env.VITE_APP_DB_URL || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const SUPABASE_KEY = process.env.VITE_APP_DB_POSTGRES_PASSWORD || 'J2nkgp0cGZYF8iHk';

console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key (前10位):', SUPABASE_KEY.substring(0, 10) + '...');

console.log('\n=== 环境变量检查 ===');
console.log('VITE_APP_DB_URL:', process.env.VITE_APP_DB_URL || '未设置');
console.log('VITE_APP_DB_POSTGRES_PASSWORD:', process.env.VITE_APP_DB_POSTGRES_PASSWORD || '未设置');

console.log('\n=== 配置建议 ===');
console.log('1. 请确保在Supabase项目设置中获取正确的anon key');
console.log('2. anon key通常是一个JWT令牌，而不是简单的字符串');
console.log('3. 在Supabase控制台中:');
console.log('   - 进入项目设置');
console.log('   - 选择API选项卡');
console.log('   - 复制anon key (public访问令牌)');

console.log('\n=== 测试配置 ===');
console.log('要测试配置是否正确，请在Supabase SQL编辑器中运行:');
console.log('SELECT COUNT(*) FROM categories;');