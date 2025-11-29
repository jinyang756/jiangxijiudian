// diagnostic-script.js
// 本地诊断脚本 - 收集所有必要的诊断信息

import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

console.log('=== 江西酒店项目本地诊断脚本 ===\n');

// 1. 环境变量检查
console.log('1. 环境变量检查');
console.log('-------------------');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || '未设置');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '已设置' : '未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');

const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.log('❌ 缺少必需的环境变量:', missingEnvVars);
} else {
  console.log('✅ 所有必需的环境变量都已设置');
}

// 2. Supabase连接测试
console.log('\n2. Supabase连接测试');
console.log('-------------------');

if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  console.log('尝试连接到Supabase...');
  
  // 测试存储访问
  try {
    console.log('\n3. 存储桶访问测试');
    console.log('-------------------');
    
    const { data, error } = await supabase.storage.from('admin-panel').list('', {
      limit: 10,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    
    if (error) {
      console.log('❌ 存储桶访问失败:', error);
    } else {
      console.log('✅ 成功访问admin-panel存储桶');
      console.log('文件列表:');
      if (data && data.length > 0) {
        data.slice(0, 5).forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.name}`);
          
          // 获取公共URL
          const { data: urlData } = supabase.storage.from('admin-panel').getPublicUrl(file.name);
          console.log(`     公共URL: ${urlData?.publicUrl}`);
        });
        
        if (data.length > 5) {
          console.log(`  ... 还有 ${data.length - 5} 个文件`);
        }
      } else {
        console.log('  存储桶为空');
      }
    }
  } catch (err) {
    console.log('❌ 存储访问测试异常:', err);
  }
  
  // 测试特定文件URL
  console.log('\n4. 特定文件URL测试');
  console.log('-------------------');
  const testFiles = ['index.html', 'set-env.html'];
  
  for (const fileName of testFiles) {
    try {
      const { data } = supabase.storage.from('admin-panel').getPublicUrl(fileName);
      console.log(`${fileName}: ${data?.publicUrl}`);
    } catch (err) {
      console.log(`❌ ${fileName}: 错误 -`, err);
    }
  }
} else {
  console.log('❌ 无法测试Supabase连接 - 缺少必需的环境变量');
}

console.log('\n=== 诊断完成 ===');