-- 菜品数据导入脚本
-- 基于提供的CSV数据生成

-- 1. 检查或创建分类
-- 川菜分类
INSERT INTO categories (key, title_zh, title_en, sort) 
VALUES ('chuancai', '川菜', 'Sichuan Cuisine', 1)
ON CONFLICT (key) DO NOTHING;

-- 京菜分类
INSERT INTO categories (key, title_zh, title_en, sort) 
VALUES ('jingcai', '京菜', 'Beijing Cuisine', 2)
ON CONFLICT (key) DO NOTHING;

-- 2. 插入菜品数据
-- 宫保鸡丁
INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'DG001', '宫保鸡丁', 'Kung Pao Chicken', 28.0, true, false, true
FROM categories c WHERE c.key = 'chuancai'
ON CONFLICT (dish_id) DO NOTHING;

-- 麻婆豆腐
INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'DM001', '麻婆豆腐', 'Mapo Tofu', 18.5, true, true, true
FROM categories c WHERE c.key = 'chuancai'
ON CONFLICT (dish_id) DO NOTHING;

-- 北京烤鸭
INSERT INTO dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT c.id, 'DB001', '北京烤鸭', 'Peking Duck', 88.0, false, false, true
FROM categories c WHERE c.key = 'jingcai'
ON CONFLICT (dish_id) DO NOTHING;

-- 3. 验证导入结果
-- 检查导入的分类
SELECT 'Categories' as table_name, COUNT(*) as record_count FROM categories WHERE key IN ('chuancai', 'jingcai')
UNION ALL
-- 检查导入的菜品
SELECT 'Dishes' as table_name, COUNT(*) as record_count FROM dishes WHERE dish_id IN ('DG001', 'DM001', 'DB001');

-- 显示导入的菜品详情
SELECT d.dish_id, d.name_zh, d.name_en, d.price, c.title_zh as category, d.is_spicy, d.is_vegetarian, d.available
FROM dishes d
JOIN categories c ON d.category_id = c.id
WHERE d.dish_id IN ('DG001', 'DM001', 'DB001')
ORDER BY c.sort, d.name_zh;