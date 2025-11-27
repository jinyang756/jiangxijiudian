#!/usr/bin/env node

/**
 * 管理面板部署脚本
 * 将管理面板文件上传到 Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';

// 配置 Supabase 客户端
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

console.log('🚀 开始部署管理面板到 Supabase Storage...');
console.log('Supabase URL:', supabaseUrl);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 获取当前目录
const __dirname = process.cwd();

async function uploadFile(filePath, bucketName) {
  try {
    const fileContent = await readFile(filePath);
    const fileName = relative(join(__dirname), filePath).replace(/\\/g, '/');
    
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

async function deployAdminPanel() {
  try {
    // 检查存储桶是否存在，如果不存在则创建
    console.log('\n1. 检查存储桶...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError.message);
      return;
    }
    
    let bucketExists = buckets.some(bucket => bucket.name === 'admin-panel');
    
    if (!bucketExists) {
      console.log('📦 创建存储桶: admin-panel');
      const { data, error } = await supabase.storage.createBucket('admin-panel', {
        public: true
      });
      
      if (error) {
        console.error('❌ 创建存储桶失败:', error.message);
        return;
      }
      
      console.log('✅ 存储桶创建成功');
    } else {
      console.log('✅ 存储桶已存在');
    }
    
    // 上传文件
    console.log('\n2. 上传管理面板文件...');
    await uploadDirectory(__dirname, 'admin-panel');
    
    // 设置存储桶为公开访问
    console.log('\n3. 设置存储桶权限...');
    // 注意：Supabase JS 客户端可能不支持直接修改存储桶权限
    // 需要通过 Supabase Dashboard 手动设置
    
    console.log('\n🎉 部署完成！');
    console.log('\n🔗 访问管理面板:');
    console.log('YOUR_SUPABASE_URL/storage/v1/object/public/admin-panel/index.html');
    
  } catch (error) {
    console.error('❌ 部署过程中发生错误:', error.message);
  }
}

// 运行部署
deployAdminPanel();