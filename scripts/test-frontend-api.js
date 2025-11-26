// 测试前端 API 调用的脚本
import { api } from '../services/api.ts';

async function testFrontendApi() {
  console.log('开始测试前端 API 调用...');
  
  try {
    console.log('\n1. 测试 getMenu API:');
    const result = await api.getMenu();
    
    console.log('  API 响应:');
    console.log('  - 状态码:', result.code);
    console.log('  - 消息:', result.message);
    
    if (result.data) {
      console.log('  - 分类数量:', result.data.length);
      
      if (result.data.length > 0) {
        result.data.forEach((category, index) => {
          console.log(`  - 分类 ${index + 1}: ${category.titleZh} (${category.titleEn})`);
          console.log(`    菜品数量: ${category.items ? category.items.length : 0}`);
          if (category.items && category.items.length > 0) {
            console.log(`    第一个菜品: ${category.items[0].zh} (${category.items[0].en}) - ¥${category.items[0].price}`);
          }
        });
      }
    } else {
      console.log('  - 没有返回数据');
    }
    
  } catch (error) {
    console.error('测试前端 API 时出错:', error.message);
  }
}

testFrontendApi();