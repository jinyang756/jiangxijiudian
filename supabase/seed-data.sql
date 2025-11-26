-- 插入示例菜品数据
-- 插入分类数据
INSERT INTO categories (key, title_zh, title_en, sort) VALUES
  ('appetizers', '开胃菜', 'Appetizers', 1),
  ('main_courses', '主菜', 'Main Courses', 2),
  ('soups', '汤类', 'Soups', 3),
  ('desserts', '甜品', 'Desserts', 4),
  ('beverages', '饮品', 'Beverages', 5)
ON CONFLICT (key) DO NOTHING;

-- 插入示例菜品数据
INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'A001', '春卷', 'Spring Rolls', 25.00, false, true, true
FROM categories c WHERE c.key = 'appetizers'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'A002', '炸鸡翅', 'Fried Chicken Wings', 35.00, true, false, true
FROM categories c WHERE c.key = 'appetizers'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'M001', '宫保鸡丁', 'Kung Pao Chicken', 48.00, true, false, true
FROM categories c WHERE c.key = 'main_courses'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'M002', '麻婆豆腐', 'Mapo Tofu', 28.00, true, true, true
FROM categories c WHERE c.key = 'main_courses'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'S001', '酸辣汤', 'Hot and Sour Soup', 18.00, true, true, true
FROM categories c WHERE c.key = 'soups'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'D001', '红豆沙', 'Red Bean Soup', 15.00, false, true, true
FROM categories c WHERE c.key = 'desserts'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'B001', '绿茶', 'Green Tea', 12.00, false, true, true
FROM categories c WHERE c.key = 'beverages'
ON CONFLICT (dish_id) DO NOTHING;

-- 启用行级安全策略
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- 创建策略以允许公共读取
CREATE POLICY "public can read categories"
ON categories
FOR SELECT TO anon
USING (true);

CREATE POLICY "public can read dishes"
ON dishes
FOR SELECT TO anon
USING (true);