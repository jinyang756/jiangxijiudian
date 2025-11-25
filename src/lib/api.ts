// src/lib/api.ts
// API配置和工具函数

// 从环境变量获取API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api';
const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:8090/_';

console.log('API Base URL:', API_BASE_URL);
console.log('Admin Base URL:', ADMIN_BASE_URL);

// 通用API请求函数
export const fetchFromAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// 获取集合记录
export const getRecords = async (collection: string, page: number = 1, perPage: number = 30) => {
  return fetchFromAPI(`/collections/${collection}/records?page=${page}&perPage=${perPage}`);
};

// 获取单个记录
export const getRecord = async (collection: string, id: string) => {
  return fetchFromAPI(`/collections/${collection}/records/${id}`);
};

// 创建记录
export const createRecord = async (collection: string, data: any) => {
  return fetchFromAPI(`/collections/${collection}/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// 更新记录
export const updateRecord = async (collection: string, id: string, data: any) => {
  return fetchFromAPI(`/collections/${collection}/records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// 删除记录
export const deleteRecord = async (collection: string, id: string) => {
  return fetchFromAPI(`/collections/${collection}/records/${id}`, {
    method: 'DELETE',
  });
};

// 导出基础URL供其他用途使用
export { API_BASE_URL, ADMIN_BASE_URL };