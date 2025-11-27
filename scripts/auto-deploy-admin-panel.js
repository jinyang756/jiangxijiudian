#!/usr/bin/env node

/**
 * 上传管理面板到 Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';

// 配置 Supabase 客户端
const supabaseUrl = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

console.log('🚀 管理面板部署脚本');
console.log('====================');
console.log('Supabase URL:', supabaseUrl);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 获取当前目录
const __dirname = process.cwd();

async function uploadFile(filePath, bucketName) {
  try {
    const fileContent = await readFile(filePath);
    const fileName = relative(join(__dirname, 'admin-panel'), filePath).replace(/\\/g, '/');
    
    console.log(`📤 上传文件: ${fileName}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileContent, {
        upsert: true
      });
    
    if (error) {
      console.error(`❌ 上传失败 ${fileName}:`, error.message);
      return false;
    }
    
    console.log(`✅ 上传成功 ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ 读取文件失败 ${filePath}:`, error.message);
    return false;
  }
}

async function uploadDirectory(directoryPath, bucketName) {
  try {
    const files = await readdir(directoryPath);
    
    for (const file of files) {
      // 跳过 node_modules 和其他不需要上传的目录
      if (file === 'node_modules' || file === '.git') {
        continue;
      }
      
      const filePath = join(directoryPath, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        // 递归上传子目录
        await uploadDirectory(filePath, bucketName);
      } else {
        // 上传文件
        await uploadFile(filePath, bucketName);
      }
    }
  } catch (error) {
    console.error(`❌ 遍历目录失败 ${directoryPath}:`, error.message);
  }
}

async function checkBucketExists(bucketName) {
  try {
    console.log('\n1. 检查存储桶...');
    
    // 检查存储桶是否存在
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError.message);
      return false;
    }
    
    let bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('⚠️  存储桶不存在');
      return false;
    } else {
      console.log('✅ 存储桶已存在');
      return true;
    }
  } catch (error) {
    console.error('❌ 检查存储桶时发生错误:', error.message);
    return false;
  }
}

async function deployAdminPanel() {
  try {
    console.log('\n📋 部署步骤:');
    
    // 检查存储桶是否存在
    const bucketExists = await checkBucketExists('admin-panel');
    
    if (!bucketExists) {
      console.log('\n💡 解决方案:');
      console.log('   请按以下步骤手动创建存储桶:');
      console.log('   1. 登录 Supabase Dashboard (https://app.supabase.com)');
      console.log('   2. 选择您的"江西酒店"项目');
      console.log('   3. 在左侧菜单中点击 "Storage"');
      console.log('   4. 点击 "Create bucket" 按钮');
      console.log('   5. 输入存储桶名称: admin-panel');
      console.log('   6. 设置为公开访问');
      console.log('   7. 点击 "Create bucket"');
      console.log('   8. 重新运行此脚本');
      return;
    }
    
    // 上传文件
    console.log('\n2. 上传管理面板文件...');
    await uploadDirectory(join(__dirname, 'admin-panel'), 'admin-panel');
    
    console.log('\n🎉 部署完成！');
    console.log('\n🔗 访问管理面板:');
    console.log('https://kdlhyzsihflwkwumxzfw.supabase.co/storage/v1/object/public/admin-panel/index.html');
    
  } catch (error) {
    console.error('❌ 部署过程中发生错误:', error.message);
  }
}

// 显示使用说明
console.log('\n📖 使用说明:');
console.log('1. 脚本会自动检查存储桶');
console.log('2. 如果存储桶不存在，请按提示手动创建');
console.log('3. 然后上传所有管理面板文件');
console.log('4. 访问管理面板 URL 查看结果');

// 运行部署
deployAdminPanel();