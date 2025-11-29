// admin-demo.tsx
// 用于测试AdminPanelFiles组件的独立入口文件

import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminPanelDemo from './src/AdminPanelDemo';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AdminPanelDemo />
  </React.StrictMode>
);