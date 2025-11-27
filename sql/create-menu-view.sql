-- 创建 menu_view 视图
-- 该视图将 categories 和 dishes 表连接，提供嵌套的菜单数据结构

CREATE OR REPLACE VIEW menu_view AS
SELECT 
    c.id as category_id,
    c.title_zh as category_name,
    c.title_en as category_name_en,
    c.sort as category_sort,
    json_agg(
        json_build_object(
            'id', d.id,
            'dish_id', d.dish_id,
            'name_zh', d.name_zh,
            'name_en', d.name_en,
            'price', d.price,
            'is_spicy', d.is_spicy,
            'is_vegetarian', d.is_vegetarian,
            'available', d.available,
            'image_url', d.image_url
        ) ORDER BY d.name_zh
    ) FILTER (WHERE d.id IS NOT NULL) as items
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.title_zh, c.title_en, c.sort
ORDER BY c.sort, c.title_zh;

-- 添加注释
COMMENT ON VIEW menu_view IS '菜单视图，用于前端应用获取分类和菜品的嵌套数据结构';