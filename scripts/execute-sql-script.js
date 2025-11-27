#!/usr/bin/env node

/**
 * 执行 SQL 初始化脚本
 * 用于初始化江西酒店菜单系统的数据库表结构和数据
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config();

// 配置 Supabase 客户端
const supabaseUrl = process.env.VITE_APP_DB_URL;
const supabaseAnonKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('错误: 请设置环境变量 VITE_APP_DB_URL 和 VITE_APP_DB_POSTGRES_PASSWORD');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeSQLScript() {
  console.log('🔍 开始执行数据库初始化脚本...');
  
  try {
    // 读取 SQL 文件
    const sqlFilePath = join(__dirname, '..', 'sql', 'optimized-init.sql');
    const sqlScript = readFileSync(sqlFilePath, 'utf8');
    
    console.log('✅ 成功读取 SQL 初始化脚本');
    
    // 分割 SQL 脚本为单独的语句
    // 注意：简单的按分号分割可能不够准确，但对于我们的脚本应该可以工作
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📊 脚本包含 ${statements.length} 个 SQL 语句`);
    
    // 逐个执行 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // 跳过注释行和空语句
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }
      
      try {
        console.log(`正在执行语句 ${i + 1}/${statements.length}...`);
        
        // 对于 CREATE TABLE 语句，我们可以直接执行
        if (statement.toUpperCase().startsWith('CREATE TABLE')) {
          const { error } = await supabase.rpc('execute_sql', { sql: statement });
          if (error) {
            console.warn(`警告: 语句执行失败 (${error.message})，但继续执行...`);
          } else {
            console.log(`✅ 成功执行 CREATE TABLE 语句`);
          }
        }
        // 对于 INSERT 语句，我们使用 Supabase 的插入方法
        else if (statement.toUpperCase().startsWith('INSERT INTO')) {
          // 解析 INSERT 语句并使用 Supabase API
          await handleInsertStatement(statement);
        }
      } catch (error) {
        console.warn(`⚠️ 语句 ${i + 1} 执行出现错误:`, error.message);
      }
    }
    
    console.log('🎉 数据库初始化脚本执行完成');
  } catch (error) {
    console.error('❌ 执行数据库初始化脚本时出错:', error.message);
    process.exit(1);
  }
}

async function handleInsertStatement(statement) {
  // 简化的 INSERT 语句处理
  // 这里我们只处理分类数据的插入
  if (statement.includes('INSERT INTO categories')) {
    // 提取 VALUES 部分
    const valuesMatch = statement.match(/VALUES\s*$$[^$$]*$$/i);
    if (valuesMatch) {
      const valuesStr = valuesMatch[0];
      // 简化的解析方法
      const values = valuesStr.match(/'[^']*'/g);
      if (values && values.length >= 4) {
        const categoryData = {
          key: values[0].slice(1, -1),
          title_zh: values[1].slice(1, -1),
          title_en: values[2].slice(1, -1),
          sort: parseInt(values[3])
        };
        
        // 使用 Supabase API 插入数据
        const { data, error } = await supabase
          .from('categories')
          .upsert(categoryData, { onConflict: 'key' });
          
        if (error) {
          console.warn(`⚠️ 插入分类数据失败:`, error.message);
        } else {
          console.log(`✅ 成功插入分类数据: ${categoryData.title_zh}`);
        }
      }
    }
  }
}

// 执行脚本
executeSQLScript().catch(error => {
  console.error('❌ 脚本执行过程中发生未捕获的错误:', error.message);
  process.exit(1);
});