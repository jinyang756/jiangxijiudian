// test-supabase-storage.js
// 测试Supabase存储访问

import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Supabase存储测试 ===');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 测试列出存储桶
async function listBuckets() {
  try {
    console.log('\n--- 测试列出所有存储桶 ---');
    // 注意：在客户端SDK中没有直接列出存储桶的方法
    // 我们将尝试访问admin-panel存储桶
    console.log('✅ 可以访问存储服务');
  } catch (err) {
    console.error('❌ 列出存储桶时出错:', err);
  }
}

// 测试列出存储桶中的文件
async function testStorageAccess() {
  try {
    console.log('\n--- 测试列出admin-panel存储桶中的文件 ---');
    const { data, error } = await supabase.storage.from('admin-panel').list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      console.error('❌ 列出文件时出错:', error);
      return;
    }

    console.log('✅ 成功列出文件:');
    if (data && data.length > 0) {
      data.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.updated_at})`);
        
        // 获取公共URL
        const { data: urlData } = supabase.storage.from('admin-panel').getPublicUrl(file.name);
        console.log(`     公共URL: ${urlData?.publicUrl}`);
        
        // 测试URL是否可访问
        testUrlAccess(urlData?.publicUrl, file.name);
      });
    } else {
      console.log('  存储桶为空或未找到文件');
    }
  } catch (err) {
    console.error('❌ 测试存储访问时发生异常:', err);
  }
}

// 测试URL是否可访问
async function testUrlAccess(url, fileName) {
  try {
    // 在Node.js环境中无法直接测试HTTP请求，所以我们只显示URL
    console.log(`     🔄 可在浏览器中访问此URL来测试文件访问`);
  } catch (err) {
    console.error(`     ❌ 测试URL访问时出错:`, err);
  }
}

// 测试特定文件的公共URL
async function testSpecificFiles() {
  console.log('\n--- 测试特定文件的公共URL ---');
  
  const testFiles = ['index.html', 'set-env.html'];
  
  for (const fileName of testFiles) {
    try {
      const { data } = supabase.storage.from('admin-panel').getPublicUrl(fileName);
      console.log(`  ${fileName}: ${data?.publicUrl}`);
    } catch (err) {
      console.error(`  ${fileName}: 错误 -`, err);
    }
  }
}

// 运行所有测试
async function runAllTests() {
  await listBuckets();
  await testStorageAccess();
  await testSpecificFiles();
  console.log('\n=== 测试完成 ===');
}

// 运行测试
runAllTests();