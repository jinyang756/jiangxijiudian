-- 创建一个视图来映射数据库字段到前端期望的字段名
-- 这样可以避免直接修改数据库结构

-- 创建 dishes_with_category 视图，包含分类信息
CREATE OR REPLACE VIEW dishes_with_category AS
SELECT 
    d.id,
    d.dish_id,
    d.name AS name_zh,
    d.en_title AS name_en,
    d.price,
    d.category_id,
    c.name AS category_name,
    d.created_at
FROM dishes d
JOIN categories c ON d.category_id = c.id
ORDER BY c.created_at, d.created_at;

-- 创建 menu_view 视图，用于前端 API 查询
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    json_agg(
        json_build_object(
            'id', d.dish_id,
            'zh', d.name,
            'en', d.en_title,
            'price', d.price,
            'spicy', FALSE,  -- 数据库中没有这个字段，暂时设置为 false
            'vegetarian', FALSE,  -- 数据库中没有这个字段，暂时设置为 false
            'available', TRUE,  -- 数据库中没有这个字段，暂时设置为 true
            'imageUrl', NULL  -- 数据库中没有这个字段，暂时设置为 null
        ) ORDER BY d.created_at
    ) AS items
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.name
ORDER BY c.created_at;