// 测试Vercel部署配置
console.log('Testing Vercel deployment configuration...');

// 检查环境变量
console.log('Environment variables:');
console.log('- VITE_APP_DB_URL:', process.env.VITE_APP_DB_URL);
console.log('- VITE_APP_DB_POSTGRES_PASSWORD:', process.env.VITE_APP_DB_POSTGRES_PASSWORD ? '[SET]' : '[NOT SET]');

// 检查vercel.json配置
import fs from 'fs';
try {
  const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  console.log('Vercel config:', vercelConfig);
} catch (error) {
  console.error('Error reading vercel.json:', error.message);
}

console.log('Test completed.');