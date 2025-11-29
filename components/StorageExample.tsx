// components/StorageExample.tsx
// Supabase Storage API 使用示例

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabaseClient';

const StorageExample: React.FC = () => {
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 1. 获取公共URL示例
  const getPublicUrl = () => {
    try {
      // 获取管理面板中index.html文件的公共URL
      const { data } = supabase.storage
        .from('admin-panel')
        .getPublicUrl('index.html');
      
      setPublicUrl(data.publicUrl);
      console.log('Public URL:', data.publicUrl);
    } catch (err) {
      setError('获取公共URL失败: ' + (err as Error).message);
    }
  };

  // 2. 列出存储桶中的文件
  const listFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('admin-panel')
        .list('', { limit: 100, offset: 0 });

      if (error) {
        setError('列出文件失败: ' + error.message);
      } else {
        setFileList(data || []);
        console.log('文件列表:', data);
      }
    } catch (err) {
      setError('列出文件失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 3. 获取签名URL（需要在后端使用service role key生成）
  const getSignedUrl = async () => {
    try {
      setLoading(true);
      // 注意：在生产环境中，这应该在后端完成，而不是在前端
      // 这里仅为演示目的
      const { data, error } = await supabase.storage
        .from('admin-panel')
        .createSignedUrl('index.html', 60); // 60秒有效期

      if (error) {
        setError('获取签名URL失败: ' + error.message);
      } else {
        setSignedUrl(data.signedUrl);
        console.log('签名URL:', data.signedUrl);
      }
    } catch (err) {
      setError('获取签名URL失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时列出文件
  useEffect(() => {
    listFiles();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Supabase Storage API 示例</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">1. 获取公共URL</h3>
        <button 
          onClick={getPublicUrl}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          获取 index.html 公共URL
        </button>
        {publicUrl && (
          <div className="mt-2">
            <p>公共URL:</p>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              {publicUrl}
            </a>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">2. 文件列表</h3>
        <button 
          onClick={listFiles}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          {loading ? '加载中...' : '刷新文件列表'}
        </button>
        {fileList.length > 0 && (
          <div className="mt-2">
            <ul className="list-disc pl-5">
              {fileList.map((file, index) => (
                <li key={index} className="mb-1">
                  <span className="font-medium">{file.name}</span> 
                  (更新时间: {new Date(file.updated_at).toLocaleString()})
                  <div className="ml-4 mt-1">
                    <button 
                      onClick={() => {
                        const { data } = supabase.storage
                          .from('admin-panel')
                          .getPublicUrl(file.name);
                        window.open(data.publicUrl, '_blank');
                      }}
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded"
                    >
                      打开
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">3. 获取签名URL</h3>
        <button 
          onClick={getSignedUrl}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          {loading ? '生成中...' : '获取签名URL'}
        </button>
        {signedUrl && (
          <div className="mt-2">
            <p>签名URL (60秒有效):</p>
            <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="text-purple-500 underline">
              {signedUrl}
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="text-lg font-semibold mb-2">使用说明</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>公共URL适用于公开访问的文件，如管理面板的HTML文件</li>
          <li>文件列表功能可以帮助浏览存储桶中的所有文件</li>
          <li>签名URL适用于需要临时访问权限的私有文件</li>
          <li>注意：在生产环境中，签名URL应在后端生成，而不是前端</li>
        </ul>
      </div>
    </div>
  );
};

export default StorageExample;