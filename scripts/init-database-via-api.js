import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// 检查环境变量是否存在
if (!supabaseUrl || !supabaseKey) {
  console.error('缺少必要的环境变量: VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 分类数据
const categories = [
  { key: 'jianghu', title_zh: '江湖小炒', title_en: 'Jianghu Stir-Fries', sort: 1 },
  { key: 'soup', title_zh: '炖汤类', title_en: 'Simmered Soups', sort: 2 },
  { key: 'braised', title_zh: '卤料', title_en: 'Braised Delicacies', sort: 3 },
  { key: 'cantonese', title_zh: '粤菜', title_en: 'Cantonese Cuisine', sort: 4 },
  { key: 'drinks', title_zh: '酒水/其他', title_en: 'Beverages & Others', sort: 5 }
];

// 菜品数据
const dishes = [
  // 江湖小炒类
  { dish_id: 'H1', name_zh: '水煮牛肉', name_en: 'Boiled Beef in Spicy Broth', price: 48.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H2', name_zh: '干锅花菜', name_en: 'Dry Pot Cauliflower', price: 28.00, is_spicy: true, is_vegetarian: false, available: false, category_key: 'jianghu' },
  { dish_id: 'H3', name_zh: '家乡豆腐', name_en: 'Hometown Tofu', price: 22.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'jianghu' },
  { dish_id: 'H4', name_zh: '肉沫空心菜梗', name_en: 'Minced Pork with Water Spinach Stalks', price: 26.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H5', name_zh: '酸辣手撕包菜', name_en: 'Spicy & Sour Shredded Cabbage', price: 22.00, is_spicy: true, is_vegetarian: true, available: true, category_key: 'jianghu' },
  { dish_id: 'H6', name_zh: '小炒牛肉', name_en: 'Sautéed Beef', price: 58.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H7', name_zh: '香辣虾', name_en: 'Spicy Shrimp', price: 68.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H8', name_zh: '尖椒虎皮蛋', name_en: 'Spicy Green Pepper Braised Eggs', price: 24.00, is_spicy: true, is_vegetarian: true, available: true, category_key: 'jianghu' },
  { dish_id: 'H9', name_zh: '红烧鱼块', name_en: 'Braised Fish Chunks', price: 38.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H10', name_zh: '青椒回锅肉', name_en: 'Twice-Cooked Pork with Green Pepper', price: 32.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H11', name_zh: '酸辣豆角肉末', name_en: 'Spicy & Sour Minced Pork with Cowpeas', price: 28.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H12', name_zh: '酸菜鱼', name_en: 'Sour and Spicy Fish', price: 58.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H13', name_zh: '肉沫酸菜', name_en: 'Minced Pork with Pickled Cabbage', price: 26.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H14', name_zh: '啤酒鸭', name_en: 'Beer-Braised Duck', price: 45.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H15', name_zh: '水煮肉片', name_en: 'Boiled Pork Slices in Spicy Broth', price: 38.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H16', name_zh: '红烧茄子', name_en: 'Braised Eggplant', price: 24.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'jianghu' },
  { dish_id: 'H17', name_zh: '爆炒猪肝', name_en: 'Sautéed Pork Liver', price: 28.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H18', name_zh: '铁板鱿鱼', name_en: 'Sizzling Squid on Iron Plate', price: 42.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H19', name_zh: '泡椒肥牛', name_en: 'Pickled Chili Fatty Beef', price: 52.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H20', name_zh: '红烧排骨', name_en: 'Braised Pork Ribs', price: 48.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H21', name_zh: '干锅肥肠', name_en: 'Dry Pot Pork Intestines', price: 45.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H22', name_zh: '酸辣土豆丝', name_en: 'Spicy & Sour Shredded Potatoes', price: 18.00, is_spicy: true, is_vegetarian: true, available: true, category_key: 'jianghu' },
  { dish_id: 'H23', name_zh: '凉瓜煎蛋', name_en: 'Bitter Melon Omelette', price: 22.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'jianghu' },
  { dish_id: 'H24', name_zh: '水煮鱼', name_en: 'Boiled Fish in Spicy Broth', price: 68.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },
  { dish_id: 'H25', name_zh: '干锅白菜', name_en: 'Dry Pot Chinese Cabbage', price: 24.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'jianghu' },

  // 炖汤类
  { dish_id: 'I1', name_zh: '胡椒猪肚鸡', name_en: 'Pork Tripe & Chicken Soup with White Pepper', price: 128.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I2', name_zh: '虫草花乌鸡汤', name_en: 'Cordyceps Flower & Black Chicken Soup', price: 58.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I3', name_zh: '冬瓜水鸭汤', name_en: 'Winter Melon Duck Soup', price: 48.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I4', name_zh: '怀山排骨汤', name_en: 'Chinese Yam & Pork Rib Soup', price: 42.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I5', name_zh: '黑蒜炖肉汁', name_en: 'Black Garlic Braised Pork Broth', price: 38.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I6', name_zh: '海带排骨汤', name_en: 'Kelp & Pork Rib Soup', price: 36.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I7', name_zh: '西红柿蛋花汤', name_en: 'Tomato & Egg Drop Soup', price: 18.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'soup' },
  { dish_id: 'I8', name_zh: '紫菜蛋汤', name_en: 'Laver & Egg Soup', price: 16.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'soup' },
  { dish_id: 'I9', name_zh: '西洋参炖土鸡', name_en: 'American Ginseng Braised Native Chicken', price: 68.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I10', name_zh: '玉米萝卜炖筒骨', name_en: 'Corn, Radish & Pork Shank Soup', price: 45.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I11', name_zh: '鱼羊鲜', name_en: 'Fish & Lamb Delight', price: 88.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I12', name_zh: '鱼头豆腐汤', name_en: 'Fish Head & Tofu Soup', price: 42.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },
  { dish_id: 'I13', name_zh: '五指毛桃乳鸽', name_en: 'Braised Pigeon with Five-Finger Fig', price: 58.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'soup' },

  // 卤料类
  { dish_id: 'D1', name_zh: '美国凤爪', name_en: 'Braised Chicken Feet', price: 32.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'braised' },
  { dish_id: 'D2', name_zh: '大肠头', name_en: 'Braised Pork Intestine Tips', price: 38.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'braised' },
  { dish_id: 'D3', name_zh: '五花肉', name_en: 'Braised Streaky Pork', price: 35.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'braised' },
  { dish_id: 'D4', name_zh: '鸭掌', name_en: 'Braised Duck Feet', price: 32.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'braised' },
  { dish_id: 'D5', name_zh: '猪头肉', name_en: 'Braised Pig Head Meat', price: 30.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'braised' },
  { dish_id: 'D6', name_zh: '老豆腐', name_en: 'Braised Old Tofu', price: 12.00, is_spicy: false, is_vegetarian: true, available: true, category_key: 'braised' }
];

async function initDatabase() {
  console.log('开始初始化数据库...');

  try {
    console.log('插入分类数据...');
    for (const category of categories) {
      const { data, error } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'key' });
      
      if (error) {
        console.error('插入分类数据时出错:', error.message);
      } else {
        console.log(`分类 "${category.title_zh}" 插入成功`);
      }
    }

    console.log('获取分类数据以获取ID...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, key');
    
    if (categoryError) {
      console.error('获取分类数据时出错:', categoryError.message);
      return;
    }
    
    // 创建分类键到 ID 的映射
    const categoryMap = {};
    categoryData.forEach(cat => {
      categoryMap[cat.key] = cat.id;
    });
    
    console.log('插入菜品数据...');
    // 插入菜品数据
    for (const dish of dishes) {
      const dishData = {
        ...dish,
        category_id: categoryMap[dish.category_key]
      };
      delete dishData.category_key;
      
      const { data, error } = await supabase
        .from('dishes')
        .upsert(dishData, { onConflict: 'dish_id' });
      
      if (error) {
        console.error(`插入菜品 "${dish.name_zh}" 时出错:`, error.message);
      } else {
        console.log(`菜品 "${dish.name_zh}" 插入成功`);
      }
    }

    console.log('创建订单表...');
    // 创建订单表（如果不存在）
    const { error: ordersError } = await supabase.rpc('create_orders_table');
    if (ordersError) {
      console.log('订单表可能已存在或无法通过RPC创建');
    }
    
    console.log('创建服务请求表...');
    // 创建服务请求表（如果不存在）
    const { error: serviceRequestsError } = await supabase.rpc('create_service_requests_table');
    if (serviceRequestsError) {
      console.log('服务请求表可能已存在或无法通过RPC创建');
    }
    
    console.log('创建标签化订单表...');
    // 创建标签化订单表（如果不存在）
    const { error: taggedOrdersError } = await supabase.rpc('create_tagged_orders_table');
    if (taggedOrdersError) {
      console.log('标签化订单表可能已存在或无法通过RPC创建');
    }
    
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化过程中出错:', error.message);
  }
}

// 运行初始化函数
initDatabase();