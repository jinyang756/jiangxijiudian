// src/components/TestSuite.tsx
// 综合测试套件组件

import React, { useState } from 'react';
import { testLocalStorage, testSessionStorage, testNetworkConnection, testApiEndpoint, generateTestMenuData, testCartFunctionality, mockApiResponse } from '../lib/test-utils';
import { safeLocalStorageGet, safeLocalStorageSet } from '../lib/storage';

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  details: string;
  timestamp: string;
}

const TestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 添加测试结果
  const addTestResult = (name: string, status: 'pass' | 'fail', details: string) => {
    setTestResults(prev => [...prev, { name, status, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // 1. 测试localStorage
      const localStorageWorks = testLocalStorage();
      addTestResult('LocalStorage功能测试', localStorageWorks ? 'pass' : 'fail', 
        localStorageWorks ? 'LocalStorage正常工作' : 'LocalStorage无法使用');
      
      // 2. 测试sessionStorage
      const sessionStorageWorks = testSessionStorage();
      addTestResult('SessionStorage功能测试', sessionStorageWorks ? 'pass' : 'fail', 
        sessionStorageWorks ? 'SessionStorage正常工作' : 'SessionStorage无法使用');
      
      // 3. 测试安全存储函数
      safeLocalStorageSet('test-key', 'test-value');
      const retrievedValue = safeLocalStorageGet<string>('test-key', 'default');
      const safeStorageWorks = retrievedValue === 'test-value';
      addTestResult('安全存储函数测试', safeStorageWorks ? 'pass' : 'fail', 
        safeStorageWorks ? '安全存储函数正常工作' : '安全存储函数异常');
      
      // 4. 测试购物车功能
      const testCart = { 'item1': 2, 'item2': 1 };
      const cartTestResult = testCartFunctionality(testCart);
      addTestResult('购物车功能测试', cartTestResult.isValid ? 'pass' : 'fail', cartTestResult.message);
      
      // 5. 测试菜单数据生成
      const menuData = generateTestMenuData();
      const menuDataValid = Array.isArray(menuData) && menuData.length > 0;
      addTestResult('菜单数据生成测试', menuDataValid ? 'pass' : 'fail', 
        menuDataValid ? '菜单数据生成正常' : '菜单数据生成异常');
      
      // 6. 测试API工具函数
      const mockData = { message: 'success' };
      const apiResponse = await mockApiResponse(mockData);
      const apiWorks = apiResponse.success && apiResponse.data.message === 'success';
      addTestResult('API模拟响应测试', apiWorks ? 'pass' : 'fail', 
        apiWorks ? 'API模拟响应正常' : 'API模拟响应异常');
      
      // 7. 测试网络连接（如果在浏览器环境中）
      if (typeof window !== 'undefined') {
        try {
          // 使用本地资源测试网络连接，避免依赖外部服务
          const networkTest = await testNetworkConnection(`${window.location.origin}/favicon.ico`);
          addTestResult('网络连接测试', networkTest ? 'pass' : 'fail', 
            networkTest ? '网络连接正常' : '网络连接异常');
        } catch (e) {
          addTestResult('网络连接测试', 'fail', '网络连接测试异常');
        }
      }
      
      // 8. 测试API端点（使用PocketBase测试端点）
      try {
        // 这里我们测试到后端的连接
        const apiTest = await testApiEndpoint(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/health');
        addTestResult('后端API连接测试', apiTest.ok ? 'pass' : 'fail', 
          `状态码: ${apiTest.status}, 连接${apiTest.ok ? '成功' : '失败'}`);
      } catch (e) {
        addTestResult('后端API连接测试', 'fail', '后端API连接测试异常');
      }
    } catch (e) {
      addTestResult('综合测试', 'fail', `测试过程中发生错误: ${e}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">系统测试套件</h1>
        <p className="text-gray-600">运行全面的系统测试以验证应用功能</p>
      </div>
      
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded ${
            isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRunning ? '测试运行中...' : '运行所有测试'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h2 className="font-semibold">测试结果</h2>
          </div>
          <div className="divide-y">
            {testResults.map((result, index) => (
              <div key={index} className="px-4 py-3 flex items-start">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full mt-0.5 mr-3 ${
                  result.status === 'pass' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{result.name}</h3>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    result.status === 'pass' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSuite;