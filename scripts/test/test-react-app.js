// test-react-app.js
// 测试React应用是否能正常渲染

import React from 'react';
import ReactDOM from 'react-dom/client';

// 简单的测试组件
const TestApp = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>React应用测试</h1>
      <p style={{ color: '#666' }}>如果看到这个页面，说明React应用可以正常渲染</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
        <p>当前时间: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

// 渲染测试应用
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<TestApp />);
  console.log('✅ React应用测试页面渲染成功');
} else {
  console.error('❌ 未找到root元素');
}