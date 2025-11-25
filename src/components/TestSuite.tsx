// src/components/TestSuite.tsx
// 综合测试套件组件

import React, { useState } from 'react';
import { testLocalStorage, testSessionStorage, testNetworkConnection, testApiEndpoint, generateTestMenuData, testCartFunctionality, mockApiResponse } from '../lib/test-utils';
import { safeLocalStorageGet, safeLocalStorageSet } from '../lib/storage';
import { getRecords, createRecord, updateRecord, deleteRecord } from '../lib/api';

const TestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
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
      const retrievedValue = safeLocalStorageGet('test-key', 'default');
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
          // 测试到一个可靠的公共API
          const networkTest = await testNetworkConnection('https://httpbin.org/get');
          addTestResult('网络连接测试', networkTest ? 'pass' : 'fail', 
            networkTest ? '网络连接正常' : '网络连接异常');
        } catch (e) {
          addTestResult('网络连接测试', 'fail', '网络连接测试异常');
        }
      }
      
      // 8. 测试API端点（使用PocketBase测试端点）
      try {
        // 这里我们测试到后端的连接
        const apiTest = await testApiEndpoint(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api/health');
        addTestResult('后端API连接测试', apiTest.ok ? 'pass' : 'fail', 
          `状态码: ${apiTest.status}, 连接${apiTest.ok ? '成功' : '失败'}`);
      } catch (e) {
        addTestResult('后端API连接测试', 'fail', '后端API连接测试异常');
      }
      
      // 9. 测试API库函数
      try {
        // 这里我们不实际调用API，而是测试函数是否存在
        const apiFunctionsExist = typeof getRecords === 'function' && 
                                  typeof createRecord === 'function' && 
                                  typeof updateRecord === 'function' && 
                                  typeof deleteRecord === 'function';
        addTestResult('API库函数测试', apiFunctionsExist ? 'pass' : 'fail', 
          apiFunctionsExist ? '所有API函数存在' : '部分API函数缺失');
      } catch (e) {
        addTestResult('API库函数测试', 'fail', 'API库函数测试异常');
      }
      
    } catch (error) {
      addTestResult('测试套件执行', 'fail', `测试执行异常: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">系统综合测试套件</h2>
      
      <div className="mb-6 flex justify-center">
        <button 
          onClick={runAllTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? '测试进行中...' : '运行所有测试'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-lg font-semibold p-4 bg-gray-100 border-b">测试结果</h3>
          <div className="divide-y">
            {testResults.map((result, index) => (
              <div key={index} className="p-4 flex items-start">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full mt-1 mr-3 ${
                  result.status === 'pass' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{result.name}</span>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className={`mt-1 text-sm ${result.status === 'pass' ? 'text-green-700' : 'text-red-700'}`}>
                    {result.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <p>点击上方按钮运行测试</p>
        </div>
      )}
    </div>
  );
};

export default TestSuite;