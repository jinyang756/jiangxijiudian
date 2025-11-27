// test-api-direct.js
// 直接测试API调用

console.log('=== 直接API调用测试 ===');

// 直接导入并测试API
import { api } from './services/api';

async function testApiDirect() {
  try {
    console.log('正在调用API getMenu...');
    const result = await api.getMenu();
    console.log('API调用结果:', result);
    
    if (result.code === 200) {
      console.log('✅ API调用成功');
      console.log('数据来源:', result.message);
      console.log('分类数量:', result.data?.length || 0);
      
      if (result.data && result.data.length > 0) {
        console.log('前两个分类:');
        result.data.slice(0, 2).forEach((category, index) => {
          console.log(`  ${index + 1}. ${category.titleZh} (${category.items?.length || 0} 个菜品)`);
        });
      }
    } else {
      console.log('❌ API调用失败');
      console.log('错误代码:', result.code);
      console.log('错误信息:', result.message);
    }
  } catch (error) {
    console.error('❌ API调用异常:', error);
    console.error('错误类型:', error.constructor.name);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 执行测试
testApiDirect();