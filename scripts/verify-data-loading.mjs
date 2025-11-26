// 验证数据加载的脚本
import dotenv from 'dotenv';
dotenv.config();

// 模拟API调用
async function verifyDataLoading() {
  console.log('验证数据加载...');
  
  try {
    // 检查环境变量
    console.log('检查环境变量:');
    console.log('- Supabase URL:', process.env.VITE_APP_DB_URL ? '已设置' : '未设置');
    console.log('- Supabase Key:', process.env.VITE_APP_DB_POSTGRES_PASSWORD ? '已设置' : '未设置');
    
    // 尝试导入并测试API
    const { api } = await import('../services/api.ts');
    
    console.log('尝试从Supabase获取菜单数据...');
    const result = await api.getMenu();
    
    console.log('API响应:');
    console.log('- 状态码:', result.code);
    console.log('- 消息:', result.message);
    console.log('- 数据类型:', typeof result.data);
    
    if (result.data) {
      console.log('- 数据长度:', result.data.length);
      if (result.data.length > 0) {
        console.log('- 第一个分类:', result.data[0].titleZh);
        console.log('- 第一个分类的菜品数量:', result.data[0].items.length);
      }
    }
    
    console.log('数据加载验证完成');
  } catch (error) {
    console.error('验证过程中出现错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

verifyDataLoading();