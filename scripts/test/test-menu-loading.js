// test-menu-loading.js
// 测试菜单数据加载

console.log('=== 菜单数据加载测试 ===');

// 模拟API调用
import { api } from './services/api';

async function testMenuLoading() {
  try {
    console.log('正在加载菜单数据...');
    const response = await api.getMenu();
    
    console.log('API响应:', response);
    
    if (response.code === 200) {
      console.log('✅ 菜单数据加载成功');
      console.log('数据来源:', response.message);
      console.log('分类数量:', response.data?.length || 0);
      
      if (response.data && response.data.length > 0) {
        console.log('前两个分类:');
        response.data.slice(0, 2).forEach((category, index) => {
          console.log(`  ${index + 1}. ${category.titleZh} (${category.items?.length || 0} 个菜品)`);
        });
      }
    } else {
      console.log('❌ 菜单数据加载失败');
      console.log('错误信息:', response.message);
    }
  } catch (error) {
    console.error('❌ 菜单数据加载异常:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 执行测试
testMenuLoading();