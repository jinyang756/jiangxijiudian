-- 优化的数据库初始化脚本，包含表结构和江西酒店实际菜单数据

-- 创建categories表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建dishes表
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  dish_id TEXT UNIQUE NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price NUMERIC NOT NULL,
  is_spicy BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建orders表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建service_requests表
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  type TEXT NOT NULL,
  type_name TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 tagged_orders 表用于存储标签化订单
CREATE TABLE IF NOT EXISTS tagged_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_categories_key ON categories(key);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort);
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_dish_id ON dishes(dish_id);
CREATE INDEX IF NOT EXISTS idx_dishes_available ON dishes(available);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_table_id ON service_requests(table_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_tagged_orders_table_id ON tagged_orders(table_id);
CREATE INDEX IF NOT EXISTS idx_tagged_orders_tag ON tagged_orders(tag);
CREATE INDEX IF NOT EXISTS idx_tagged_orders_status ON tagged_orders(status);
CREATE INDEX IF NOT EXISTS idx_tagged_orders_created_at ON tagged_orders(created_at);

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

-- 插入江西酒店实际的分类数据
INSERT INTO categories (key, title_zh, title_en, sort) VALUES
  ('jianghu', '江湖小炒', 'Jianghu Stir-Fries', 1),
  ('soup', '炖汤类', 'Simmered Soups', 2),
  ('braised', '卤料', 'Braised Delicacies', 3),
  ('cantonese', '粤菜', 'Cantonese Cuisine', 4),
  ('drinks', '酒水/其他', 'Beverages & Others', 5)
ON CONFLICT (key) DO UPDATE SET
  title_zh = EXCLUDED.title_zh,
  title_en = EXCLUDED.title_en,
  sort = EXCLUDED.sort;

-- 插入江湖小炒类菜品
INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H1',
  c.id,
  '水煮牛肉',
  'Boiled Beef in Spicy Broth',
  48.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H2',
  c.id,
  '干锅花菜',
  'Dry Pot Cauliflower',
  28.00,
  true,
  false,
  false
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H3',
  c.id,
  '家乡豆腐',
  'Hometown Tofu',
  22.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H4',
  c.id,
  '肉沫空心菜梗',
  'Minced Pork with Water Spinach Stalks',
  26.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H5',
  c.id,
  '酸辣手撕包菜',
  'Spicy & Sour Shredded Cabbage',
  22.00,
  true,
  true,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H6',
  c.id,
  '小炒牛肉',
  'Sautéed Beef',
  58.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H7',
  c.id,
  '香辣虾',
  'Spicy Shrimp',
  68.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H8',
  c.id,
  '尖椒虎皮蛋',
  'Spicy Green Pepper Braised Eggs',
  24.00,
  true,
  true,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H9',
  c.id,
  '红烧鱼块',
  'Braised Fish Chunks',
  38.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H10',
  c.id,
  '青椒回锅肉',
  'Twice-Cooked Pork with Green Pepper',
  32.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H11',
  c.id,
  '酸辣豆角肉末',
  'Spicy & Sour Minced Pork with Cowpeas',
  28.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H12',
  c.id,
  '酸菜鱼',
  'Sour and Spicy Fish',
  58.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H13',
  c.id,
  '肉沫酸菜',
  'Minced Pork with Pickled Cabbage',
  26.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H14',
  c.id,
  '啤酒鸭',
  'Beer-Braised Duck',
  45.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H15',
  c.id,
  '水煮肉片',
  'Boiled Pork Slices in Spicy Broth',
  38.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H16',
  c.id,
  '红烧茄子',
  'Braised Eggplant',
  24.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H17',
  c.id,
  '爆炒猪肝',
  'Sautéed Pork Liver',
  28.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H18',
  c.id,
  '铁板鱿鱼',
  'Sizzling Squid on Iron Plate',
  42.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H19',
  c.id,
  '泡椒肥牛',
  'Pickled Chili Fatty Beef',
  52.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H20',
  c.id,
  '红烧排骨',
  'Braised Pork Ribs',
  48.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H21',
  c.id,
  '干锅肥肠',
  'Dry Pot Pork Intestines',
  45.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H22',
  c.id,
  '酸辣土豆丝',
  'Spicy & Sour Shredded Potatoes',
  18.00,
  true,
  true,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H23',
  c.id,
  '凉瓜煎蛋',
  'Bitter Melon Omelette',
  22.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H24',
  c.id,
  '水煮鱼',
  'Boiled Fish in Spicy Broth',
  68.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'H25',
  c.id,
  '干锅白菜',
  'Dry Pot Chinese Cabbage',
  24.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'jianghu'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 插入炖汤类菜品
INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I1',
  c.id,
  '胡椒猪肚鸡',
  'Pork Tripe & Chicken Soup with White Pepper',
  128.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I2',
  c.id,
  '虫草花乌鸡汤',
  'Cordyceps Flower & Black Chicken Soup',
  58.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I3',
  c.id,
  '冬瓜水鸭汤',
  'Winter Melon Duck Soup',
  48.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I4',
  c.id,
  '怀山排骨汤',
  'Chinese Yam & Pork Rib Soup',
  42.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I5',
  c.id,
  '黑蒜炖肉汁',
  'Black Garlic Braised Pork Broth',
  38.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I6',
  c.id,
  '海带排骨汤',
  'Kelp & Pork Rib Soup',
  36.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I7',
  c.id,
  '西红柿蛋花汤',
  'Tomato & Egg Drop Soup',
  18.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I8',
  c.id,
  '紫菜蛋汤',
  'Laver & Egg Soup',
  16.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I9',
  c.id,
  '西洋参炖土鸡',
  'American Ginseng Braised Native Chicken',
  68.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I10',
  c.id,
  '玉米萝卜炖筒骨',
  'Corn, Radish & Pork Shank Soup',
  45.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I11',
  c.id,
  '鱼羊鲜',
  'Fish & Lamb Delight',
  88.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I12',
  c.id,
  '鱼头豆腐汤',
  'Fish Head & Tofu Soup',
  42.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'I13',
  c.id,
  '五指毛桃乳鸽',
  'Braised Pigeon with Five-Finger Fig',
  58.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'soup'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 插入卤料类菜品
INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D1',
  c.id,
  '美国凤爪',
  'Braised Chicken Feet',
  32.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'braised'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D2',
  c.id,
  '大肠头',
  'Braised Pork Intestine Tips',
  38.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'braised'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D3',
  c.id,
  '五花肉',
  'Braised Streaky Pork',
  35.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'braised'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D4',
  c.id,
  '鸭掌',
  'Braised Duck Feet',
  32.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'braised'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D5',
  c.id,
  '猪头肉',
  'Braised Pig Head Meat',
  30.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'braised'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D6',
  c.id,
  '老豆腐',
  'Braised Old Tofu',
  12.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'braised'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'D7',
  c.id,
  '猪耳朵',
  'Braised Pig Ears',
  35.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'braised'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 插入粤菜类菜品
INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F1',
  c.id,
  '眼镜王焖土鸡',
  'Braised Native Chicken with King Cobra',
  188.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F2',
  c.id,
  '黑椒牛排',
  'Black Pepper Beef Steak',
  68.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F3',
  c.id,
  '红葱头焗鸡',
  'Braised Chicken with Shallots',
  58.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F4',
  c.id,
  '南腐红烧肉',
  'Braised Pork with Fermented Tofu',
  48.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F5',
  c.id,
  '煎焗大虾',
  'Pan-Seared Prawns',
  78.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F6',
  c.id,
  '付竹炆鱼块',
  'Braised Fish Chunks with Yuba',
  42.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F7',
  c.id,
  '萝卜焖牛腩',
  'Braised Beef Brisket with Radish',
  52.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F8',
  c.id,
  '豉汁蒸鱼头',
  'Steamed Fish Head with Black Bean Sauce',
  48.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F9',
  c.id,
  '番茄牛脯煲',
  'Beef Brisket with Tomato Casserole',
  55.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F10',
  c.id,
  '蒜蓉蒸排骨',
  'Steamed Spareribs with Garlic',
  45.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F11',
  c.id,
  '海味焗猪手',
  'Braised Pork Trotters with Seafood',
  58.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F12',
  c.id,
  '广式咕噜肉',
  'Cantonese Sweet and Sour Pork',
  42.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F13',
  c.id,
  '胡椒鸭',
  'Pepper Duck',
  48.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F14',
  c.id,
  '肉沫炒丁',
  'Stir-Fried Minced Pork with Dices',
  32.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F15',
  c.id,
  '糖醋排骨',
  'Sweet and Sour Spareribs',
  45.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F16',
  c.id,
  '蒜蓉蒸排骨',
  'Steamed Spareribs with Garlic',
  45.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F17',
  c.id,
  '香煎虾饼',
  'Pan-Fried Shrimp Cakes',
  38.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F18',
  c.id,
  '干煎白苍鱼',
  'Pan-Fried White Pomfret',
  52.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F19',
  c.id,
  '干贝蒸水蛋',
  'Steamed Egg Custard with Scallops',
  28.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F20',
  c.id,
  '椒盐猪手',
  'Salt and Pepper Pork Trotters',
  48.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F21',
  c.id,
  '白切鸡',
  'Boiled Chicken',
  58.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F22',
  c.id,
  '黄豆焖石鸡',
  'Braised Frog with Soybeans',
  62.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F23',
  c.id,
  '粉蒸肉',
  'Steamed Pork with Rice Flour',
  38.00,
  false,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'F24',
  c.id,
  '铁板黑椒牛仔骨',
  'Sizzling Black Pepper Short Ribs',
  68.00,
  true,
  false,
  true
FROM categories c WHERE c.key = 'cantonese'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 插入酒水/其他类菜品
INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L1',
  c.id,
  '可乐',
  'Coca-Cola',
  6.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L2',
  c.id,
  '雪碧',
  'Sprite',
  6.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L3',
  c.id,
  '绿茶',
  'Green Tea',
  12.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L4',
  c.id,
  '红茶',
  'Black Tea',
  12.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L5',
  c.id,
  '银色生力',
  'San Miguel Silver',
  15.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L6',
  c.id,
  '金色生力',
  'San Miguel Gold',
  15.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L7',
  c.id,
  '雪花啤酒',
  'Snow Beer',
  8.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L8',
  c.id,
  '红牛',
  'Red Bull',
  12.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L9',
  c.id,
  '矿泉水',
  'Mineral Water',
  4.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L10',
  c.id,
  '王老吉',
  'Wanglaoji Herbal Tea',
  8.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L11',
  c.id,
  '米饭',
  'Steamed Rice',
  3.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

INSERT INTO dishes (dish_id, category_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
SELECT 
  'L12',
  c.id,
  '西瓜',
  'Watermelon',
  20.00,
  false,
  true,
  true
FROM categories c WHERE c.key = 'drinks'
ON CONFLICT (dish_id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price = EXCLUDED.price,
  is_spicy = EXCLUDED.is_spicy,
  is_vegetarian = EXCLUDED.is_vegetarian,
  available = EXCLUDED.available;

-- 验证数据导入
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Dishes count:' as info, COUNT(*) as count FROM dishes;