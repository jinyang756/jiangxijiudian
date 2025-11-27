import { createClient } from '@supabase/supabase-js';

// 配置 Supabase 客户端
const supabaseUrl = 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabaseTables() {
  console.log('开始设置数据库表...');

  try {
    // 创建 categories 表
    console.log('创建 categories 表...');
    const { error: createCategoriesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          title_zh TEXT NOT NULL,
          title_en TEXT NOT NULL,
          sort INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_categories_key ON categories(key);
        CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort);
      `
    });
    
    if (createCategoriesError) {
      console.log('手动创建 categories 表时出错:', createCategoriesError.message);
      // 如果 RPC 不可用，尝试直接执行 SQL
      console.log('尝试直接执行 SQL...');
      const { error: directError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key TEXT UNIQUE NOT NULL,
            title_zh TEXT NOT NULL,
            title_en TEXT NOT NULL,
            sort INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      if (directError) {
        console.log('直接执行 SQL 也失败:', directError.message);
      } else {
        console.log('categories 表创建成功');
      }
    } else {
      console.log('categories 表创建成功');
    }

    // 创建 dishes 表
    console.log('创建 dishes 表...');
    const { error: createDishesError } = await supabase.rpc('execute_sql', {
      sql: `
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
        );
        
        CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);
        CREATE INDEX IF NOT EXISTS idx_dishes_dish_id ON dishes(dish_id);
        CREATE INDEX IF NOT EXISTS idx_dishes_available ON dishes(available);
      `
    });
    
    if (createDishesError) {
      console.log('手动创建 dishes 表时出错:', createDishesError.message);
    } else {
      console.log('dishes 表创建成功');
    }

    // 创建 orders 表
    console.log('创建 orders 表...');
    const { error: createOrdersError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          table_id TEXT NOT NULL,
          items_json TEXT NOT NULL,
          total_amount NUMERIC NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      `
    });
    
    if (createOrdersError) {
      console.log('手动创建 orders 表时出错:', createOrdersError.message);
    } else {
      console.log('orders 表创建成功');
    }

    // 创建 service_requests 表
    console.log('创建 service_requests 表...');
    const { error: createServiceRequestsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS service_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          table_id TEXT NOT NULL,
          type TEXT NOT NULL,
          type_name TEXT NOT NULL,
          details TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_service_requests_table_id ON service_requests(table_id);
        CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
      `
    });
    
    if (createServiceRequestsError) {
      console.log('手动创建 service_requests 表时出错:', createServiceRequestsError.message);
    } else {
      console.log('service_requests 表创建成功');
    }

    // 创建 tagged_orders 表
    console.log('创建 tagged_orders 表...');
    const { error: createTaggedOrdersError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tagged_orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          table_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          items_json TEXT NOT NULL,
          total_amount NUMERIC NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_tagged_orders_table_id ON tagged_orders(table_id);
        CREATE INDEX IF NOT EXISTS idx_tagged_orders_tag ON tagged_orders(tag);
        CREATE INDEX IF NOT EXISTS idx_tagged_orders_status ON tagged_orders(status);
        CREATE INDEX IF NOT EXISTS idx_tagged_orders_created_at ON tagged_orders(created_at);
      `
    });
    
    if (createTaggedOrdersError) {
      console.log('手动创建 tagged_orders 表时出错:', createTaggedOrdersError.message);
    } else {
      console.log('tagged_orders 表创建成功');
    }

    console.log('所有数据库表设置完成！');
  } catch (error) {
    console.error('设置数据库表过程中出错:', error.message);
  }
}

// 运行设置函数
setupDatabaseTables();