// test-http-access.js
// 测试HTTP访问

import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 测试特定文件的HTTP访问
async function testHttpAccess() {
  console.log('=== HTTP访问测试 ===');
  
  const testFiles = ['index.html', 'set-env.html'];
  
  for (const fileName of testFiles) {
    try {
      const { data } = supabase.storage.from('admin-panel').getPublicUrl(fileName);
      const url = data?.publicUrl;
      
      console.log(`\n--- 测试 ${fileName} ---`);
      console.log(`URL: ${url}`);
      
      // 在浏览器中打开这个URL来测试访问
      console.log(`💡 请在浏览器中打开以上URL来测试文件访问`);
    } catch (err) {
      console.error(`❌ ${fileName}: 错误 -`, err);
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testHttpAccess();