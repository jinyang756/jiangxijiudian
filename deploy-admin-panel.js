#!/usr/bin/env node

/**
 * 上传管理面板到 Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';

// 配置 Supabase 客户端
const supabaseUrl = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseKey = 'sb_publishable_kn0X93DL4ljLdimMM0TkEg_U6qATZ1I';

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

async function deployAdminPanel() {
  try {
    console.log('\n📋 部署步骤:');
    console.log('1. 请先通过 Supabase Dashboard 创建名为 "admin-panel" 的存储桶');
    console.log('2. 设置存储桶为公开访问');
    console.log('3. 运行此脚本上传文件');
    
    // 检查存储桶是否存在
    console.log('\n1. 检查存储桶...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError.message);
      console.log('\n💡 解决方案:');
      console.log('   请确保您的 anon key 正确，并且具有访问存储桶的权限');
      return;
    }
    
    let bucketExists = buckets.some(bucket => bucket.name === 'admin-panel');
    
    if (!bucketExists) {
      console.log('⚠️  存储桶 "admin-panel" 不存在');
      console.log('\n💡 请按以下步骤手动创建存储桶:');
      console.log('   1. 登录 Supabase Dashboard');
      console.log('   2. 选择您的项目');
      console.log('   3. 在左侧菜单中点击 "Storage"');
      console.log('   4. 点击 "Create bucket" 按钮');
      console.log('   5. 输入存储桶名称: admin-panel');
      console.log('   6. 设置为公开访问');
      console.log('   7. 点击 "Create bucket"');
      console.log('   8. 重新运行此脚本');
      return;
    } else {
      console.log('✅ 存储桶已存在');
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
console.log('1. 首先需要在 Supabase Dashboard 中手动创建存储桶');
console.log('2. 然后运行此脚本上传文件');
console.log('3. 访问管理面板 URL 查看结果');

// 运行部署
deployAdminPanel();