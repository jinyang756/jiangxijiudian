#!/usr/bin/env node

/**
 * 批量上传菜品图片到Supabase Storage
 * 
 * 使用方法:
 * 1. 确保已安装依赖: npm install @supabase/supabase-js dotenv
 * 2. 配置环境变量或在代码中设置SUPABASE_URL和SUPABASE_KEY
 * 3. 准备图片文件，命名格式为 {dish_id}.jpg (如 H1.jpg, H2.jpg)
 * 4. 运行脚本: node scripts/upload-dish-images.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 配置 - 请替换为您的实际配置
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'your-anon-key';

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 图片目录 - 请替换为您的实际图片目录路径
const IMAGES_DIR = './dish-images';

async function uploadDishImages() {
  try {
    // 检查图片目录是否存在
    if (!fs.existsSync(IMAGES_DIR)) {
      console.log(`图片目录不存在: ${IMAGES_DIR}`);
      console.log('请创建目录并放入菜品图片，命名格式为 {dish_id}.jpg (如 H1.jpg)');
      return;
    }

    // 读取图片目录中的所有文件
    const files = fs.readdirSync(IMAGES_DIR);
    
    if (files.length === 0) {
      console.log('图片目录为空');
      return;
    }

    console.log(`找到 ${files.length} 个文件，开始上传...`);

    // 上传每个图片文件
    for (const file of files) {
      // 只处理图片文件
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        console.log(`跳过非图片文件: ${file}`);
        continue;
      }

      const filePath = path.join(IMAGES_DIR, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      // 从文件名提取菜品ID (去除扩展名)
      const dishId = path.basename(file, path.extname(file));
      const fileExt = path.extname(file).substring(1); // 去除点号
      
      // 生成存储路径
      const storagePath = `dishes/${dishId}.${fileExt}`;
      
      console.log(`正在上传 ${file} 作为菜品 ${dishId} 的图片...`);

      try {
        // 上传到Supabase Storage
        const { data, error } = await supabase.storage
          .from('dish-images')
          .upload(storagePath, fileBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true // 如果文件已存在则覆盖
          });

        if (error) {
          console.error(`上传失败 ${file}:`, error.message);
          continue;
        }

        console.log(`✅ 成功上传: ${file} -> ${data.path}`);

        // 获取公开URL
        const { data: { publicUrl } } = supabase.storage
          .from('dish-images')
          .getPublicUrl(storagePath);

        console.log(`   公开URL: ${publicUrl}`);

        // 更新数据库中的image_url字段
        const { error: updateError } = await supabase
          .from('dishes')
          .update({ image_url: storagePath })
          .eq('dish_id', dishId);

        if (updateError) {
          console.error(`更新数据库失败 ${dishId}:`, updateError.message);
        } else {
          console.log(`   ✅ 数据库更新成功`);
        }

      } catch (error) {
        console.error(`上传过程中出错 ${file}:`, error.message);
      }
    }

    console.log('图片上传完成！');
    
  } catch (error) {
    console.error('批量上传过程中出错:', error.message);
  }
}

// 执行上传
uploadDishImages();