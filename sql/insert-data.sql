-- 插入示例数据的SQL脚本

-- 插入分类数据
INSERT INTO categories (key, title_zh, title_en, sort) VALUES
  ('appetizers', '开胃菜', 'Appetizers', 1),
  ('main_courses', '主菜', 'Main Courses', 2),
  ('soups', '汤类', 'Soups', 3),
  ('desserts', '甜品', 'Desserts', 4),
  ('beverages', '饮品', 'Beverages', 5)
ON CONFLICT (key) DO UPDATE SET
  title_zh = EXCLUDED.title_zh,
  title_en = EXCLUDED.title_en,
  sort = EXCLUDED.sort;

-- 插入菜品数据（使用UPSERT避免重复）
-- 开胃菜
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
FROM categories c WHERE c.key = 'appetizers'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

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
FROM categories c WHERE c.key = 'appetizers'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 主菜
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
FROM categories c WHERE c.key = 'main_courses'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

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
FROM categories c WHERE c.key = 'main_courses'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

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
FROM categories c WHERE c.key = 'main_courses'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

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
FROM categories c WHERE c.key = 'main_courses'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 汤类
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
FROM categories c WHERE c.key = 'soups'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

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
FROM categories c WHERE c.key = 'soups'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 甜品
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
FROM categories c WHERE c.key = 'desserts'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

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
FROM categories c WHERE c.key = 'desserts'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 饮品
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
FROM categories c WHERE c.key = 'beverages'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

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
FROM categories c WHERE c.key = 'beverages'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 验证数据导入
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Dishes count:' as info, COUNT(*) as count FROM dishes;