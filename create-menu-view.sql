-- 创建 menu_view 视图以优化菜单查询
DROP VIEW IF EXISTS menu_view;

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

COMMENT ON VIEW menu_view IS '菜单视图，用于前端应用获取分类和菜品的嵌套数据结构';-- 创建 menu_view 视图以优化菜单查询
DROP VIEW IF EXISTS menu_view;

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

COMMENT ON VIEW menu_view IS '菜单视图，用于前端应用获取分类和菜品的嵌套数据结构';