-- 创建 menu_view 视图
-- 该视图将 categories 和 dishes 表连接，提供嵌套的菜单数据结构

-- 删除现有视图（如果存在）
DROP VIEW IF EXISTS menu_view;

-- 创建新视图（适配当前表结构）
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    json_agg(
        json_build_object(
            'id', d.id,
            'name', d.name,
            'description', d.description,
            'price', d.price,
            'currency', d.currency,
            'available', d.available,
            'metadata', d.metadata
        ) ORDER BY d.name
    ) FILTER (WHERE d.id IS NOT NULL) as items
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 添加注释
COMMENT ON VIEW menu_view IS '菜单视图，用于前端应用获取分类和菜品的嵌套数据结构';