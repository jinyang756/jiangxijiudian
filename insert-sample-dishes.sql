-- 江西酒店菜单系统 - 菜品数据插入脚本
-- 此脚本可在Supabase控制台中直接执行

-- 插入示例菜品数据
-- 注意：这里使用了ON CONFLICT DO NOTHING来避免重复插入

-- 江湖小炒类
INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'H1', '水煮牛肉', 'Boiled Beef in Spicy Broth', 48.00, true, false, true, id 
FROM categories WHERE name = '江湖小炒'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'H2', '干锅花菜', 'Dry Pot Cauliflower', 28.00, true, true, true, id 
FROM categories WHERE name = '江湖小炒'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'H3', '家乡豆腐', 'Hometown Tofu', 22.00, false, true, true, id 
FROM categories WHERE name = '江湖小炒'
ON CONFLICT (dish_id) DO NOTHING;

-- 炖汤类
INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'I1', '胡椒猪肚鸡', 'Pork Tripe & Chicken Soup with White Pepper', 128.00, false, false, true, id 
FROM categories WHERE name = '炖汤类'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'I2', '虫草花乌鸡汤', 'Cordyceps Flower & Black Chicken Soup', 58.00, false, false, true, id 
FROM categories WHERE name = '炖汤类'
ON CONFLICT (dish_id) DO NOTHING;

-- 卤料类
INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'D1', '美国凤爪', 'Braised Chicken Feet', 32.00, false, false, true, id 
FROM categories WHERE name = '卤料'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'D2', '大肠头', 'Braised Pork Intestine Tips', 38.00, false, false, true, id 
FROM categories WHERE name = '卤料'
ON CONFLICT (dish_id) DO NOTHING;

-- 粤菜类
INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'Y1', '白切鸡', 'Poached Chicken', 48.00, false, false, true, id 
FROM categories WHERE name = '粤菜'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'Y2', '豉汁蒸排骨', 'Steamed Pork Ribs with Black Bean Sauce', 38.00, false, false, true, id 
FROM categories WHERE name = '粤菜'
ON CONFLICT (dish_id) DO NOTHING;

-- 酒水/其他类
INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'O1', '江小白', 'Jiang Xiao Bai Baijiu', 28.00, false, true, true, id 
FROM categories WHERE name = '酒水/其他'
ON CONFLICT (dish_id) DO NOTHING;

INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 'O2', '青岛啤酒', 'Tsingtao Beer', 18.00, false, true, true, id 
FROM categories WHERE name = '酒水/其他'
ON CONFLICT (dish_id) DO NOTHING;

-- 验证数据插入
SELECT 
    c.name as category_name,
    COUNT(d.id) as dish_count
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.name
ORDER BY c.name;