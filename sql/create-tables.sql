-- 创建数据库表结构的完整SQL脚本

-- 删除现有表（如果存在）- 请谨慎使用
-- DROP TABLE IF EXISTS service_requests;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS dishes;
-- DROP TABLE IF EXISTS categories;

-- 创建categories表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建dishes表
CREATE TABLE dishes (
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

-- 创建orders表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建service_requests表
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  type TEXT NOT NULL,
  type_name TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_categories_key ON categories(key);
CREATE INDEX idx_categories_sort ON categories(sort);
CREATE INDEX idx_dishes_category_id ON dishes(category_id);
CREATE INDEX idx_dishes_dish_id ON dishes(dish_id);
CREATE INDEX idx_dishes_available ON dishes(available);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_service_requests_table_id ON service_requests(table_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- 插入示例分类数据
INSERT INTO categories (key, title_zh, title_en, sort) VALUES
  ('appetizers', '开胃菜', 'Appetizers', 1),
  ('main_courses', '主菜', 'Main Courses', 2),
  ('soups', '汤类', 'Soups', 3),
  ('desserts', '甜品', 'Desserts', 4),
  ('beverages', '饮品', 'Beverages', 5);

-- 插入示例菜品数据
INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'A001',
  c.id,
  '春卷',
  'Spring Rolls',
  25.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'appetizers';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'A002',
  c.id,
  '炸鸡翅',
  'Fried Chicken Wings',
  35.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'appetizers';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'M001',
  c.id,
  '宫保鸡丁',
  'Kung Pao Chicken',
  48.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'main_courses';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'M002',
  c.id,
  '麻婆豆腐',
  'Mapo Tofu',
  28.00,
  true,
  true,
  true
FROM categories c WHERE c.key = 'main_courses';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'M003',
  c.id,
  '红烧肉',
  'Braised Pork',
  58.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'main_courses';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'M004',
  c.id,
  '糖醋里脊',
  'Sweet and Sour Pork',
  52.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'main_courses';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'S001',
  c.id,
  '酸辣汤',
  'Hot and Sour Soup',
  18.00,
  true,
  true,
  true
FROM categories c WHERE c.key = 'soups';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'S002',
  c.id,
  '西红柿鸡蛋汤',
  'Tomato and Egg Soup',
  15.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'soups';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D001',
  c.id,
  '红豆沙',
  'Red Bean Soup',
  15.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'desserts';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D002',
  c.id,
  '芒果布丁',
  'Mango Pudding',
  20.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'desserts';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'B001',
  c.id,
  '绿茶',
  'Green Tea',
  12.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'beverages';

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'B002',
  c.id,
  '可乐',
  'Coca Cola',
  15.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'beverages';

-- 验证数据导入
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as dish_count FROM dishes;