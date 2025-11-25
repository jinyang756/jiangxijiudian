// src/lib/test-utils.ts
// 测试工具函数

// 模拟API响应
export const mockApiResponse = <T>(data: T, success: boolean = true): Promise<{ data: T; success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, success });
    }, 100);
  });
};

// 测试localStorage功能
export const testLocalStorage = (): boolean => {
  try {
    const testKey = '__test_localstorage__';
    localStorage.setItem(testKey, 'test');
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === 'test';
  } catch (e) {
    return false;
  }
};

// 测试sessionStorage功能
export const testSessionStorage = (): boolean => {
  try {
    const testKey = '__test_sessionstorage__';
    sessionStorage.setItem(testKey, 'test');
    const result = sessionStorage.getItem(testKey);
    sessionStorage.removeItem(testKey);
    return result === 'test';
  } catch (e) {
    return false;
  }
};

// 测试网络连接
export const testNetworkConnection = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch (e) {
    return false;
  }
};

// 测试API端点
export const testApiEndpoint = async (endpoint: string): Promise<{ status: number; ok: boolean }> => {
  try {
    const response = await fetch(endpoint, { method: 'GET', mode: 'cors' });
    return { status: response.status, ok: response.ok };
  } catch (e) {
    return { status: 0, ok: false };
  }
};

// 生成测试数据
export const generateTestMenuData = () => {
  return [
    {
      key: 'appetizers',
      titleZh: '开胃菜',
      titleEn: 'Appetizers',
      items: [
        {
          id: '1',
          nameZh: '春卷',
          nameEn: 'Spring Rolls',
          price: 12,
          descriptionZh: '脆皮春卷配甜辣酱',
          descriptionEn: 'Crispy spring rolls with sweet and spicy sauce',
          image: '/images/spring-rolls.jpg',
          popular: true
        },
        {
          id: '2',
          nameZh: '炸豆腐',
          nameEn: 'Fried Tofu',
          price: 10,
          descriptionZh: '香脆炸豆腐配酱油',
          descriptionEn: 'Crispy fried tofu with soy sauce',
          image: '/images/fried-tofu.jpg',
          popular: false
        }
      ]
    },
    {
      key: 'main-courses',
      titleZh: '主菜',
      titleEn: 'Main Courses',
      items: [
        {
          id: '3',
          nameZh: '宫保鸡丁',
          nameEn: 'Kung Pao Chicken',
          price: 18,
          descriptionZh: '经典川菜配花生和辣椒',
          descriptionEn: 'Classic Sichuan dish with peanuts and chili',
          image: '/images/kung-pao-chicken.jpg',
          popular: true
        }
      ]
    }
  ];
};

// 测试购物车功能
export const testCartFunctionality = (cart: any): { isValid: boolean; message: string } => {
  try {
    // 检查购物车是否为对象
    if (typeof cart !== 'object' || cart === null) {
      return { isValid: false, message: '购物车必须是对象' };
    }

    // 检查所有值是否为数字
    for (const [key, value] of Object.entries(cart)) {
      if (typeof value !== 'number' || value < 0) {
        return { isValid: false, message: `商品 ${key} 的数量必须是非负数` };
      }
    }

    return { isValid: true, message: '购物车功能正常' };
  } catch (e) {
    return { isValid: false, message: `购物车测试出错: ${e}` };
  }
};