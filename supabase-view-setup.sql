-- 江西酒店菜单系统 - Supabase视图设置脚本
-- 此脚本可在Supabase控制台中直接执行

-- 1. 创建menu_view视图
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    json_agg(
        json_build_object(
            'id', d.id,
            'dish_id', d.dish_id,
            'name_zh', d.name_zh,
            'name_en', d.name_en,
            'price', d.price,
            'is_spicy', d.is_spicy,
            'is_vegetarian', d.is_vegetarian,
            'available', d.available
        ) ORDER BY d.name_zh
    ) FILTER (WHERE d.id IS NOT NULL) as items
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 2. 添加注释
COMMENT ON VIEW menu_view IS '菜单视图，用于前端应用获取分类和菜品的嵌套数据结构';

-- 3. 验证视图是否创建成功
SELECT * FROM menu_view LIMIT 1;

-- 4. 检查是否有数据
SELECT 
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM dishes) as dishes_count,
    (SELECT COUNT(*) FROM menu_view) as view_count;-- 江西酒店菜单系统 - Supabase视图设置脚本
-- 此脚本可在Supabase控制台中直接执行

-- 1. 创建menu_view视图
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    json_agg(
        json_build_object(
            'id', d.id,
            'dish_id', d.dish_id,
            'name_zh', d.name_zh,
            'name_en', d.name_en,
            'price', d.price,
            'is_spicy', d.is_spicy,
            'is_vegetarian', d.is_vegetarian,
            'available', d.available
        ) ORDER BY d.name_zh
    ) FILTER (WHERE d.id IS NOT NULL) as items
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 2. 添加注释
COMMENT ON VIEW menu_view IS '菜单视图，用于前端应用获取分类和菜品的嵌套数据结构';

-- 3. 验证视图是否创建成功
SELECT * FROM menu_view LIMIT 1;

-- 4. 检查是否有数据
SELECT 
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM dishes) as dishes_count,
    (SELECT COUNT(*) FROM menu_view) as view_count;