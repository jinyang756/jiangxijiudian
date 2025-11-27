#!/usr/bin/env node

/**
 * 通过 SQL 查询直接检查和初始化数据库
 * 绕过 Supabase 模式缓存问题
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

async function checkAndInitializeDatabase() {
  console.log('🔍 开始检查和初始化数据库...');
  
  try {
    // 1. 检查是否存在 categories 表
    console.log('\n📋 检查 categories 表是否存在...');
    const { data: categoriesTable, error: categoriesTableError } = await supabase.rpc('execute_sql', { 
      sql: "SELECT table_name FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public'" 
    });
    
    if (categoriesTableError) {
      console.log('⚠️ 无法直接查询表信息，尝试通过查询数据检查表是否存在...');
      
      try {
        // 尝试查询 categories 表
        const { data, error } = await supabase.from('categories').select('count()', { count: 'exact', head: true });
        if (error) {
          console.log('❌ categories 表不存在或无法访问');
          // 表不存在，需要创建
          await createTables();
        } else {
          console.log('✅ categories 表存在');
        }
      } catch (queryError) {
        console.log('❌ categories 表不存在或无法访问');
        // 表不存在，需要创建
        await createTables();
      }
    } else {
      if (categoriesTable && categoriesTable.length > 0) {
        console.log('✅ categories 表存在');
      } else {
        console.log('❌ categories 表不存在');
        // 表不存在，需要创建
        await createTables();
      }
    }
    
    // 2. 检查是否存在 dishes 表
    console.log('\n📋 检查 dishes 表是否存在...');
    const { data: dishesTable, error: dishesTableError } = await supabase.rpc('execute_sql', { 
      sql: "SELECT table_name FROM information_schema.tables WHERE table_name = 'dishes' AND table_schema = 'public'" 
    });
    
    if (dishesTableError) {
      console.log('⚠️ 无法直接查询表信息，尝试通过查询数据检查表是否存在...');
      
      try {
        // 尝试查询 dishes 表
        const { data, error } = await supabase.from('dishes').select('count()', { count: 'exact', head: true });
        if (error) {
          console.log('❌ dishes 表不存在或无法访问');
          // 表不存在，需要创建
          await createTables();
        } else {
          console.log('✅ dishes 表存在');
        }
      } catch (queryError) {
        console.log('❌ dishes 表不存在或无法访问');
        // 表不存在，需要创建
        await createTables();
      }
    } else {
      if (dishesTable && dishesTable.length > 0) {
        console.log('✅ dishes 表存在');
      } else {
        console.log('❌ dishes 表不存在');
        // 表不存在，需要创建
        await createTables();
      }
    }
    
    console.log('\n🎉 数据库检查和初始化完成！');
    
  } catch (error) {
    console.error('❌ 检查和初始化数据库时发生错误:', error.message);
    process.exit(1);
  }
}

async function createTables() {
  console.log('\n🔨 开始创建数据库表...');
  
  try {
    // 创建 categories 表
    console.log('📋 创建 categories 表...');
    const createCategoriesSQL = `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        title_zh TEXT NOT NULL,
        title_en TEXT NOT NULL,
        sort INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    const { error: categoriesError } = await supabase.rpc('execute_sql', { sql: createCategoriesSQL });
    if (categoriesError) {
      console.warn('⚠️ 创建 categories 表时出错:', categoriesError.message);
    } else {
      console.log('✅ categories 表创建成功');
    }
    
    // 创建 dishes 表
    console.log('🍽️ 创建 dishes 表...');
    const createDishesSQL = `
      CREATE TABLE IF NOT EXISTS dishes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        dish_id TEXT UNIQUE NOT NULL,
        name_zh TEXT NOT NULL,
        name_en TEXT NOT NULL,
        price NUMERIC NOT NULL,
        is_spicy BOOLEAN DEFAULT FALSE,
        is_vegetarian BOOLEAN DEFAULT FALSE,
        available BOOLEAN DEFAULT TRUE,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    const { error: dishesError } = await supabase.rpc('execute_sql', { sql: createDishesSQL });
    if (dishesError) {
      console.warn('⚠️ 创建 dishes 表时出错:', dishesError.message);
    } else {
      console.log('✅ dishes 表创建成功');
    }
    
    // 创建 orders 表
    console.log('📝 创建 orders 表...');
    const createOrdersSQL = `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id TEXT NOT NULL,
        items_json TEXT NOT NULL,
        total_amount NUMERIC NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    const { error: ordersError } = await supabase.rpc('execute_sql', { sql: createOrdersSQL });
    if (ordersError) {
      console.warn('⚠️ 创建 orders 表时出错:', ordersError.message);
    } else {
      console.log('✅ orders 表创建成功');
    }
    
    // 创建 service_requests 表
    console.log('🔧 创建 service_requests 表...');
    const createServiceRequestsSQL = `
      CREATE TABLE IF NOT EXISTS service_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id TEXT NOT NULL,
        type TEXT NOT NULL,
        type_name TEXT NOT NULL,
        details TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    const { error: serviceRequestsError } = await supabase.rpc('execute_sql', { sql: createServiceRequestsSQL });
    if (serviceRequestsError) {
      console.warn('⚠️ 创建 service_requests 表时出错:', serviceRequestsError.message);
    } else {
      console.log('✅ service_requests 表创建成功');
    }
    
    // 创建 tagged_orders 表
    console.log('🏷️ 创建 tagged_orders 表...');
    const createTaggedOrdersSQL = `
      CREATE TABLE IF NOT EXISTS tagged_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        items_json TEXT NOT NULL,
        total_amount NUMERIC NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    const { error: taggedOrdersError } = await supabase.rpc('execute_sql', { sql: createTaggedOrdersSQL });
    if (taggedOrdersError) {
      console.warn('⚠️ 创建 tagged_orders 表时出错:', taggedOrdersError.message);
    } else {
      console.log('✅ tagged_orders 表创建成功');
    }
    
    console.log('\n🎉 所有表创建完成！');
    
  } catch (error) {
    console.error('❌ 创建表时发生错误:', error.message);
    process.exit(1);
  }
}

// 执行检查和初始化
checkAndInitializeDatabase().catch(error => {
  console.error('❌ 检查和初始化过程中发生未捕获的错误:', error.message);
  process.exit(1);
});