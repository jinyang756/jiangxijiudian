// src/lib/test-utils.ts
// 测试工具函数

import { CartItems } from '../types/types';

// 测试localStorage功能
export const testLocalStorage = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    const result = localStorage.getItem(testKey) === testKey;
    localStorage.removeItem(testKey);
    return result;
  } catch (e) {
    return false;
  }
};

// 测试sessionStorage功能
export const testSessionStorage = (): boolean => {
  try {
    const testKey = '__session_test__';
    sessionStorage.setItem(testKey, testKey);
    const result = sessionStorage.getItem(testKey) === testKey;
    sessionStorage.removeItem(testKey);
    return result;
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
export const testApiEndpoint = async (url: string): Promise<Response> => {
  return fetch(url, { 
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

// 生成测试菜单数据
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
          descriptionEn: 'Crispy spring rolls with sweet chili sauce',
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
export const testCartFunctionality = (cart: CartItems): { isValid: boolean; message: string } => {
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

// 模拟API响应
export const mockApiResponse = async <T>(data: T): Promise<{ success: boolean; data: T }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));
  return { success: true, data };
};