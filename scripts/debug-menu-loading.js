// 调试菜单数据加载的独立脚本
import dotenv from 'dotenv';
dotenv.config();
import { api } from '../services/api.ts';

async function debugMenuLoading() {
  console.log('开始调试菜单数据加载...');
  
  try {
    console.log('尝试从Supabase获取菜单数据...');
    const result = await api.getMenu();
    console.log('获取结果:', result);
    
    if (result.code === 200) {
      console.log('成功获取菜单数据:');
      console.log('分类数量:', result.data.length);
      
      result.data.forEach((category, index) => {
        console.log(`分类 ${index + 1}: ${category.titleZh} (${category.titleEn})`);
        console.log(`  菜品数量: ${category.items.length}`);
        console.log(`  分类key: ${category.key}`);
      });
    } else {
      console.log('获取菜单数据失败:', result.message);
    }
  } catch (error) {
    console.error('调试过程中出现错误:', error);
  }
}

debugMenuLoading();