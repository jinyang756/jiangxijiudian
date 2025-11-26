-- Create categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title_zh text not null,
  title_en text not null,
  sort integer default 0,
  created_at timestamp with time zone default now()
);

-- Create dishes table
create table dishes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  dish_id text not null unique,
  name_zh text not null,
  name_en text not null,
  price numeric not null,
  is_spicy boolean default false,
  is_vegetarian boolean default false,
  available boolean default true,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Create orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  table_id text not null,
  items_json text not null,
  total_amount numeric not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- Create service_requests table
create table service_requests (
  id uuid primary key default gen_random_uuid(),
  table_id text not null,
  type text not null,
  type_name text not null,
  details text,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- Insert sample categories data
insert into categories (key, title_zh, title_en, sort) values
  ('jianghu', '江湖小炒', 'Jianghu Stir-Fries', 1),
  ('soup', '炖汤类', 'Simmered Soups', 2),
  ('braised', '卤料', 'Braised Delicacies', 3),
  ('cantonese', '粤菜', 'Cantonese Cuisine', 4),
  ('drinks', '酒水/其他', 'Beverages & Others', 5);

-- Insert sample dishes data
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H1', '水煮牛肉', 'Boiled Beef in Spicy Broth', 48, true, false, true
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H2', '干锅花菜', 'Dry Pot Cauliflower', 28, true, false, false
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H3', '家乡豆腐', 'Hometown Tofu', 22, false, true, true
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H4', '肉沫空心菜梗', 'Minced Pork with Water Spinach Stalks', 26, false, false, true
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H5', '酸辣手撕包菜', 'Spicy & Sour Shredded Cabbage', 22, true, true, true
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H6', '小炒牛肉', 'Sautéed Beef', 58, true, false, true
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H7', '香辣虾', 'Spicy Shrimp', 68, true, false, true
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H8', '尖椒虎皮蛋', 'Spicy Green Pepper Braised Eggs', 24, true, true, true
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H9', '红烧鱼块', 'Braised Fish Chunks', 38, false, false, true
from categories c where c.key = 'jianghu';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'H10', '青椒回锅肉', 'Twice-Cooked Pork with Green Pepper', 32, false, false, true
from categories c where c.key = 'jianghu';

-- Insert sample soup dishes
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'I1', '胡椒猪肚鸡', 'Pork Tripe & Chicken Soup with White Pepper', 128, false, false, true
from categories c where c.key = 'soup';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'I2', '虫草花乌鸡汤', 'Cordyceps Flower & Black Chicken Soup', 58, false, false, true
from categories c where c.key = 'soup';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'I3', '冬瓜水鸭汤', 'Winter Melon Duck Soup', 48, false, false, true
from categories c where c.key = 'soup';

-- Insert sample braised dishes
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'D1', '美国凤爪', 'Braised Chicken Feet', 32, false, false, true
from categories c where c.key = 'braised';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'D2', '大肠头', 'Braised Pork Intestine Tips', 38, false, false, true
from categories c where c.key = 'braised';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'D3', '五花肉', 'Braised Streaky Pork', 35, false, false, true
from categories c where c.key = 'braised';

-- Insert sample cantonese dishes
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'F1', '眼镜王焖土鸡', 'Braised Native Chicken with King Cobra', 188, false, false, true
from categories c where c.key = 'cantonese';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'F2', '黑椒牛排', 'Black Pepper Beef Steak', 68, true, false, true
from categories c where c.key = 'cantonese';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'F3', '红葱头焗鸡', 'Braised Chicken with Shallots', 58, false, false, true
from categories c where c.key = 'cantonese';

-- Insert sample drinks
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'L1', '可乐', 'Coca-Cola', 6, false, true, true
from categories c where c.key = 'drinks';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'L2', '雪碧', 'Sprite', 6, false, true, true
from categories c where c.key = 'drinks';
insert into dishes (category_id, dish_id, name_zh, name_en, price, is_spicy, is_vegetarian, available) 
select c.id, 'L3', '绿茶', 'Green Tea', 12, false, true, true
from categories c where c.key = 'drinks';

-- Enable Row Level Security
alter table categories enable row level security;
alter table dishes enable row level security;
alter table orders enable row level security;
alter table service_requests enable row level security;

-- Create policies for public read access
create policy "public can read categories"
on categories
for select to anon
using (true);

create policy "public can read dishes"
on dishes
for select to anon
using (true);

-- Create policies for insert access for orders and service requests
create policy "public can insert orders"
on orders
for insert to anon
with check (true);

create policy "public can insert service_requests"
on service_requests
for insert to anon
with check (true);