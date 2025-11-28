-- ==========================================
-- 江西酒店菜单系统完整数据库设置脚本
-- ==========================================

-- 1. 创建categories表（如果不存在）
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建dishes表（如果不存在）
CREATE TABLE IF NOT EXISTS dishes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dish_id VARCHAR(50) UNIQUE NOT NULL,
    name_zh VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    is_spicy BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建orders表（如果不存在）
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id VARCHAR(50) NOT NULL,
    items_json TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建service_requests表（如果不存在）
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    type_name VARCHAR(255) NOT NULL,
    details TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建tagged_orders表（如果不存在）
CREATE TABLE IF NOT EXISTS tagged_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag VARCHAR(50) NOT NULL,
    table_id VARCHAR(50) NOT NULL,
    items_json TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建menu_view视图
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

-- 7. 插入分类数据
INSERT INTO categories (id, name) VALUES 
('180c9642-1cff-4a18-9d06-41b1a5e772c4', '江湖小炒'),
('fd34b350-8190-4396-9cb5-fb26b311e182', '炖汤类'),
('7b81573c-5a3e-439c-84c6-36104ee30337', '卤料'),
('9c8eb469-9fd7-4321-83ca-82c3b4ef8a32', '粤菜'),
('865ece34-911a-49b9-b8fe-992661fd70cb', '酒水/其他')
ON CONFLICT (id) DO NOTHING;

-- 8. 插入菜品数据
INSERT INTO dishes (dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available, category_id) 
VALUES 
-- 江湖小炒类
('H1', '水煮牛肉', 'Boiled Beef in Spicy Broth', 48.00, true, false, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H2', '干锅花菜', 'Dry Pot Cauliflower', 28.00, true, false, false, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H3', '家乡豆腐', 'Hometown Tofu', 22.00, false, true, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H4', '肉沫空心菜梗', 'Minced Pork with Water Spinach Stalks', 26.00, false, false, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H5', '酸辣手撕包菜', 'Spicy & Sour Shredded Cabbage', 22.00, true, true, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H6', '小炒牛肉', 'Sautéed Beef', 58.00, true, false, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H7', '香辣虾', 'Spicy Shrimp', 68.00, true, false, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H8', '尖椒虎皮蛋', 'Spicy Green Pepper Braised Eggs', 24.00, true, true, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H9', '红烧鱼块', 'Braised Fish Chunks', 38.00, false, false, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),
('H10', '青椒回锅肉', 'Twice-Cooked Pork with Green Pepper', 32.00, false, false, true, '180c9642-1cff-4a18-9d06-41b1a5e772c4'),

-- 炖汤类
('I1', '胡椒猪肚鸡', 'Pork Tripe & Chicken Soup with White Pepper', 128.00, false, false, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I2', '虫草花乌鸡汤', 'Cordyceps Flower & Black Chicken Soup', 58.00, false, false, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I3', '冬瓜水鸭汤', 'Winter Melon Duck Soup', 48.00, false, false, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I4', '怀山排骨汤', 'Chinese Yam & Pork Rib Soup', 42.00, false, false, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I5', '黑蒜炖肉汁', 'Black Garlic Braised Pork Broth', 38.00, false, false, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I6', '海带排骨汤', 'Kelp & Pork Rib Soup', 36.00, false, false, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I7', '西红柿蛋花汤', 'Tomato & Egg Drop Soup', 18.00, false, true, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I8', '紫菜蛋汤', 'Laver & Egg Soup', 16.00, false, true, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I9', '西洋参炖土鸡', 'American Ginseng Braised Native Chicken', 68.00, false, false, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),
('I10', '玉米萝卜炖筒骨', 'Corn, Radish & Pork Shank Soup', 45.00, false, false, true, 'fd34b350-8190-4396-9cb5-fb26b311e182'),

-- 卤料类
('D1', '美国凤爪', 'Braised Chicken Feet', 32.00, false, false, true, '7b81573c-5a3e-439c-84c6-36104ee30337'),
('D2', '大肠头', 'Braised Pork Intestine Tips', 38.00, false, false, true, '7b81573c-5a3e-439c-84c6-36104ee30337'),
('D3', '五花肉', 'Braised Streaky Pork', 35.00, false, false, true, '7b81573c-5a3e-439c-84c6-36104ee30337'),
('D4', '鸭掌', 'Braised Duck Feet', 32.00, false, false, true, '7b81573c-5a3e-439c-84c6-36104ee30337'),
('D5', '猪头肉', 'Braised Pig Head Meat', 30.00, false, false, true, '7b81573c-5a3e-439c-84c6-36104ee30337'),
('D6', '老豆腐', 'Braised Old Tofu', 12.00, false, true, true, '7b81573c-5a3e-439c-84c6-36104ee30337')
ON CONFLICT (dish_id) DO NOTHING;

-- 9. 为表添加行级安全策略（RLS）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagged_orders ENABLE ROW LEVEL SECURITY;

-- 10. 为表添加插入策略
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

-- 11. 验证数据
SELECT 'Categories count: ' || COUNT(*) as result FROM categories;
SELECT 'Dishes count: ' || COUNT(*) as result FROM dishes;
SELECT 'Menu view works: ' || (CASE WHEN EXISTS(SELECT 1 FROM menu_view) THEN 'Yes' ELSE 'No' END) as result;