-- ==========================================
-- 江西酒店菜单系统Supabase控制台设置脚本
-- ==========================================

-- 1. 创建menu_view视图
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

-- 2. 插入菜品数据（示例）
-- 注意：请根据您实际的category_id调整下面的SQL语句
-- 您可以通过运行 SELECT id, name FROM categories; 来获取分类ID

INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 
    'H1' as dish_id,
    '水煮牛肉' as name_zh,
    'Boiled Beef in Spicy Broth' as name_en,
    48.00 as price,
    true as is_spicy,
    false as is_vegetarian,
    true as available,
    id as category_id
FROM categories WHERE name = '江湖小炒';

INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
SELECT 
    'I1' as dish_id,
    '胡椒猪肚鸡' as name_zh,
    'Pork Tripe & Chicken Soup with White Pepper' as name_en,
    128.00 as price,
    false as is_spicy,
    false as is_vegetarian,
    true as available,
    id as category_id
FROM categories WHERE name = '炖汤类';

-- 3. 为表添加行级安全策略（RLS）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagged_orders ENABLE ROW LEVEL SECURITY;

-- 4. 为表添加插入策略
CREATE POLICY "public can insert categories"
ON categories
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can insert dishes"
ON dishes
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can insert orders"
ON orders
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can insert service_requests"
ON service_requests
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can insert tagged_orders"
ON tagged_orders
FOR INSERT TO anon
WITH CHECK (true);

-- 5. 验证视图是否创建成功
SELECT * FROM menu_view LIMIT 1;