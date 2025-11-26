// 测试数据加载的简单组件
import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import { MenuCategory } from './types';

const TestDataLoading: React.FC = () => {
  const [data, setData] = useState<MenuCategory[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await api.getMenu();
        console.log('API响应:', response);
        
        if (response.code === 200) {
          setData(response.data || []);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || '未知错误');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  if (!data) {
    return <div>没有数据</div>;
  }

  return (
    <div>
      <h1>菜单数据测试</h1>
      <p>分类数量: {data.length}</p>
      {data.map((category, index) => (
        <div key={index}>
          <h2>{category.titleZh} ({category.titleEn})</h2>
          <p>菜品数量: {category.items.length}</p>
        </div>
      ))}
    </div>
  );
};

export default TestDataLoading;