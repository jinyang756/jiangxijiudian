-- =====================================================
-- 江西酒店菜单系统 - 数据库视图创建脚本
-- =====================================================
-- 版本: 1.0
-- 用途: 创建前端API所需的数据库视图
-- 执行方式: 在Supabase SQL编辑器中执行
-- =====================================================

-- 1. 创建 dishes_with_category 视图
-- 用途: 包含分类信息的菜品视图，用于数据查询和调试
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

-- 2. 创建 menu_view 视图 (核心视图)
-- 用途: 前端API查询菜单数据的主要视图
-- 格式: 返回分组后的菜单数据，items字段为JSON数组
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(
        json_agg(
            json_build_object(
                'id', d.dish_id,
                'zh', d.name,
                'en', d.en_title,
                'price', d.price,
                'spicy', COALESCE(d.spicy, FALSE),
                'vegetarian', COALESCE(d.vegetarian, FALSE),
                'available', COALESCE(d.available, TRUE),
                'imageUrl', d.image_url
            ) ORDER BY d.created_at
        ) FILTER (WHERE d.dish_id IS NOT NULL),
        '[]'::json
    ) AS items
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.name
ORDER BY c.created_at;

-- 3. 设置视图权限
-- 允许匿名用户读取视图数据
GRANT SELECT ON menu_view TO anon;
GRANT SELECT ON dishes_with_category TO anon;

-- 4. 添加视图注释
COMMENT ON VIEW menu_view IS '前端菜单系统主视图 - 返回按分类分组的菜品数据';
COMMENT ON VIEW dishes_with_category IS '菜品详情视图 - 包含分类名称的菜品列表';

-- =====================================================
-- 验证脚本（可选执行）
-- =====================================================

-- 检查视图是否创建成功
-- SELECT table_name FROM information_schema.views 
-- WHERE table_schema = 'public' AND table_name IN ('menu_view', 'dishes_with_category');

-- 测试 menu_view 数据
-- SELECT * FROM menu_view LIMIT 5;