
import PocketBase from 'pocketbase';

// --- CONFIGURATION ---
const PB_URL = 'http://127.0.0.1:8090';
// PLEASE UPDATE THESE WITH YOUR POCKETBASE ADMIN CREDENTIALS
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASS = '1234567890';

const pb = new PocketBase(PB_URL);

// --- DATA SOURCE (Copied from constants.ts) ---
const MENU_DATA = [
  {
    key: 'jianghu',
    titleZh: '江湖小炒',
    titleEn: 'Jianghu Stir-Fries',
    items: [
      { id: 'H1', zh: '水煮牛肉', en: 'Boiled Beef in Spicy Broth', price: 48, spicy: true, available: true },
      { id: 'H2', zh: '干锅花菜', en: 'Dry Pot Cauliflower', price: 28, spicy: true, available: false },
      { id: 'H3', zh: '家乡豆腐', en: 'Hometown Tofu', price: 22, vegetarian: true, available: true },
      { id: 'H4', zh: '肉沫空心菜梗', en: 'Minced Pork with Water Spinach Stalks', price: 26, available: true },
      { id: 'H5', zh: '酸辣手撕包菜', en: 'Spicy & Sour Shredded Cabbage', price: 22, spicy: true, vegetarian: true, available: true },
      { id: 'H6', zh: '小炒牛肉', en: 'Sautéed Beef', price: 58, spicy: true, available: true },
      { id: 'H7', zh: '香辣虾', en: 'Spicy Shrimp', price: 68, spicy: true, available: true },
      { id: 'H8', zh: '尖椒虎皮蛋', en: 'Spicy Green Pepper Braised Eggs', price: 24, spicy: true, vegetarian: true, available: true },
      { id: 'H9', zh: '红烧鱼块', en: 'Braised Fish Chunks', price: 38, available: true },
      { id: 'H10', zh: '青椒回锅肉', en: 'Twice-Cooked Pork with Green Pepper', price: 32, available: true },
      { id: 'H11', zh: '酸辣豆角肉末', en: 'Spicy & Sour Minced Pork with Cowpeas', price: 28, spicy: true, available: true },
      { id: 'H12', zh: '酸菜鱼', en: 'Sour and Spicy Fish', price: 58, spicy: true, available: true },
      { id: 'H13', zh: '肉沫酸菜', en: 'Minced Pork with Pickled Cabbage', price: 26, available: true },
      { id: 'H14', zh: '啤酒鸭', en: 'Beer-Braised Duck', price: 45, available: true },
      { id: 'H15', zh: '水煮肉片', en: 'Boiled Pork Slices in Spicy Broth', price: 38, spicy: true, available: true },
      { id: 'H16', zh: '红烧茄子', en: 'Braised Eggplant', price: 24, vegetarian: true, available: true },
      { id: 'H17', zh: '爆炒猪肝', en: 'Sautéed Pork Liver', price: 28, available: true },
      { id: 'H18', zh: '铁板鱿鱼', en: 'Sizzling Squid on Iron Plate', price: 42, spicy: true, available: true },
      { id: 'H19', zh: '泡椒肥牛', en: 'Pickled Chili Fatty Beef', price: 52, spicy: true, available: true },
      { id: 'H20', zh: '红烧排骨', en: 'Braised Pork Ribs', price: 48, available: true },
      { id: 'H21', zh: '干锅肥肠', en: 'Dry Pot Pork Intestines', price: 45, spicy: true, available: true },
      { id: 'H22', zh: '酸辣土豆丝', en: 'Spicy & Sour Shredded Potatoes', price: 18, spicy: true, vegetarian: true, available: true },
      { id: 'H23', zh: '凉瓜煎蛋', en: 'Bitter Melon Omelette', price: 22, vegetarian: true, available: true },
      { id: 'H24', zh: '水煮鱼', en: 'Boiled Fish in Spicy Broth', price: 68, spicy: true, available: true },
      { id: 'H25', zh: '干锅白菜', en: 'Dry Pot Chinese Cabbage', price: 24, spicy: true, available: true },
    ]
  },
  {
    key: 'soup',
    titleZh: '炖汤类',
    titleEn: 'Simmered Soups',
    items: [
      { id: 'I1', zh: '胡椒猪肚鸡', en: 'Pork Tripe & Chicken Soup with White Pepper', price: 128, available: true },
      { id: 'I2', zh: '虫草花乌鸡汤', en: 'Cordyceps Flower & Black Chicken Soup', price: 58, available: true },
      { id: 'I3', zh: '冬瓜水鸭汤', en: 'Winter Melon Duck Soup', price: 48, available: true },
      { id: 'I4', zh: '怀山排骨汤', en: 'Chinese Yam & Pork Rib Soup', price: 42, available: true },
      { id: 'I5', zh: '黑蒜炖肉汁', en: 'Black Garlic Braised Pork Broth', price: 38, available: true },
      { id: 'I6', zh: '海带排骨汤', en: 'Kelp & Pork Rib Soup', price: 36, available: true },
      { id: 'I7', zh: '西红柿蛋花汤', en: 'Tomato & Egg Drop Soup', price: 18, vegetarian: true, available: true },
      { id: 'I8', zh: '紫菜蛋汤', en: 'Laver & Egg Soup', price: 16, vegetarian: true, available: true },
      { id: 'I9', zh: '西洋参炖土鸡', en: 'American Ginseng Braised Native Chicken', price: 68, available: true },
      { id: 'I10', zh: '玉米萝卜炖筒骨', en: 'Corn, Radish & Pork Shank Soup', price: 45, available: true },
      { id: 'I11', zh: '鱼羊鲜', en: 'Fish & Lamb Delight', price: 88, available: true },
      { id: 'I12', zh: '鱼头豆腐汤', en: 'Fish Head & Tofu Soup', price: 42, available: true },
      { id: 'I13', zh: '五指毛桃乳鸽', en: 'Braised Pigeon with Five-Finger Fig', price: 58, available: true },
    ]
  },
  {
    key: 'braised',
    titleZh: '卤料',
    titleEn: 'Braised Delicacies',
    items: [
      { id: 'D1', zh: '美国凤爪', en: 'Braised Chicken Feet', price: 32, available: true },
      { id: 'D2', zh: '大肠头', en: 'Braised Pork Intestine Tips', price: 38, available: true },
      { id: 'D3', zh: '五花肉', en: 'Braised Streaky Pork', price: 35, available: true },
      { id: 'D4', zh: '鸭掌', en: 'Braised Duck Feet', price: 32, available: true },
      { id: 'D5', zh: '猪头肉', en: 'Braised Pig Head Meat', price: 30, available: true },
      { id: 'D6', zh: '老豆腐', en: 'Braised Old Tofu', price: 12, vegetarian: true, available: true },
      { id: 'D7', zh: '猪耳朵', en: 'Braised Pig Ears', price: 35, available: true },
    ]
  },
  {
    key: 'cantonese',
    titleZh: '粤菜',
    titleEn: 'Cantonese Cuisine',
    items: [
      { id: 'F1', zh: '眼镜王焖土鸡', en: 'Braised Native Chicken with King Cobra', price: 188, available: true },
      { id: 'F2', zh: '黑椒牛排', en: 'Black Pepper Beef Steak', price: 68, spicy: true, available: true },
      { id: 'F3', zh: '红葱头焗鸡', en: 'Braised Chicken with Shallots', price: 58, available: true },
      { id: 'F4', zh: '南腐红烧肉', en: 'Braised Pork with Fermented Tofu', price: 48, available: true },
      { id: 'F5', zh: '煎焗大虾', en: 'Pan-Seared Prawns', price: 78, available: true },
      { id: 'F6', zh: '付竹炆鱼块', en: 'Braised Fish Chunks with Yuba', price: 42, available: true },
      { id: 'F7', zh: '萝卜焖牛腩', en: 'Braised Beef Brisket with Radish', price: 52, available: true },
      { id: 'F8', zh: '豉汁蒸鱼头', en: 'Steamed Fish Head with Black Bean Sauce', price: 48, available: true },
      { id: 'F9', zh: '番茄牛脯煲', en: 'Beef Brisket with Tomato Casserole', price: 55, available: true },
      { id: 'F10', zh: '蒜蓉蒸排骨', en: 'Steamed Spareribs with Garlic', price: 45, available: true },
      { id: 'F11', zh: '海味焗猪手', en: 'Braised Pork Trotters with Seafood', price: 58, available: true },
      { id: 'F12', zh: '广式咕噜肉', en: 'Cantonese Sweet and Sour Pork', price: 42, available: true },
      { id: 'F13', zh: '胡椒鸭', en: 'Pepper Duck', price: 48, spicy: true, available: true },
      { id: 'F14', zh: '肉沫炒丁', en: 'Stir-Fried Minced Pork with Dices', price: 32, available: true },
      { id: 'F15', zh: '糖醋排骨', en: 'Sweet and Sour Spareribs', price: 45, available: true },
      { id: 'F16', zh: '蒜蓉蒸排骨', en: 'Steamed Spareribs with Garlic', price: 45, available: true },
      { id: 'F17', zh: '香煎虾饼', en: 'Pan-Fried Shrimp Cakes', price: 38, available: true },
      { id: 'F18', zh: '干煎白苍鱼', en: 'Pan-Fried White Pomfret', price: 52, available: true },
      { id: 'F19', zh: '干贝蒸水蛋', en: 'Steamed Egg Custard with Scallops', price: 28, available: true },
      { id: 'F20', zh: '椒盐猪手', en: 'Salt and Pepper Pork Trotters', price: 48, spicy: true, available: true },
      { id: 'F21', zh: '白切鸡', en: 'Boiled Chicken', price: 58, available: true },
      { id: 'F22', zh: '黄豆焖石鸡', en: 'Braised Frog with Soybeans', price: 62, available: true },
      { id: 'F23', zh: '粉蒸肉', en: 'Steamed Pork with Rice Flour', price: 38, available: true },
      { id: 'F24', zh: '铁板黑椒牛仔骨', en: 'Sizzling Black Pepper Short Ribs', price: 68, spicy: true, available: true },
    ]
  },
  {
    key: 'drinks',
    titleZh: '酒水/其他',
    titleEn: 'Beverages & Others',
    items: [
      { id: 'L1', zh: '可乐', en: 'Coca-Cola', price: 6, vegetarian: true, available: true },
      { id: 'L2', zh: '雪碧', en: 'Sprite', price: 6, vegetarian: true, available: true },
      { id: 'L3', zh: '绿茶', en: 'Green Tea', price: 12, vegetarian: true, available: true },
      { id: 'L4', zh: '红茶', en: 'Black Tea', price: 12, vegetarian: true, available: true },
      { id: 'L5', zh: '银色生力', en: 'San Miguel Silver', price: 15, vegetarian: true, available: true },
      { id: 'L6', zh: '金色生力', en: 'San Miguel Gold', price: 15, vegetarian: true, available: true },
      { id: 'L7', zh: '雪花啤酒', en: 'Snow Beer', price: 8, vegetarian: true, available: true },
      { id: 'L8', zh: '红牛', en: 'Red Bull', price: 12, vegetarian: true, available: true },
      { id: 'L9', zh: '矿泉水', en: 'Mineral Water', price: 4, vegetarian: true, available: true },
      { id: 'L10', zh: '王老吉', en: 'Wanglaoji Herbal Tea', price: 8, vegetarian: true, available: true },
      { id: 'L11', zh: '米饭', en: 'Steamed Rice', price: 3, vegetarian: true, available: true },
      { id: 'L12', zh: '西瓜', en: 'Watermelon', price: 20, vegetarian: true, available: true },
    ]
  },
];

async function main() {
  console.log('🚀 Starting import to PocketBase...');

  try {
    // 1. Authenticate
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
    console.log('✅ Admin authenticated');

    for (const [index, cat] of MENU_DATA.entries()) {
      // 2. Create or Update Category
      // We check if it exists by key to avoid duplicates if you run this twice
      let catRecord;
      try {
        const existing = await pb.collection('categories').getFirstListItem(`key="${cat.key}"`);
        catRecord = await pb.collection('categories').update(existing.id, {
            title_zh: cat.titleZh,
            title_en: cat.titleEn,
            sort: index + 1
        });
        console.log(`Updated Category: ${cat.titleZh}`);
      } catch (e) {
        catRecord = await pb.collection('categories').create({
            key: cat.key,
            title_zh: cat.titleZh,
            title_en: cat.titleEn,
            sort: index + 1
        });
        console.log(`Created Category: ${cat.titleZh}`);
      }

      // 3. Create Items
      for (const item of cat.items) {
        // Prepare data
        const dishData = {
            category: catRecord.id, // Link to category
            dish_id: item.id,
            name_zh: item.zh,
            name_en: item.en,
            price: item.price,
            is_spicy: item.spicy || false,
            is_vegetarian: item.vegetarian || false,
            available: item.available !== false, // defaults to true unless explicitly false
        };

        // Check if exists
        try {
            const existingDish = await pb.collection('dishes').getFirstListItem(`dish_id="${item.id}"`);
            await pb.collection('dishes').update(existingDish.id, dishData);
            console.log(`  - Updated Dish: ${item.zh}`);
        } catch (e) {
            await pb.collection('dishes').create(dishData);
            console.log(`  - Created Dish: ${item.zh}`);
        }
      }
    }

    console.log('🎉 Import completed successfully!');

  } catch (err) {
    console.error('❌ Import failed:', err);
    console.log('\nMake sure you have created the "categories" and "dishes" collections in PocketBase Admin UI first!');
  }
}

main();
