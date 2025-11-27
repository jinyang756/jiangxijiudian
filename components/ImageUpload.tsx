import React, { useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';

interface ImageUploadProps {
  dishId: string;
  onUploadComplete: (imageUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ dishId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      
      // 上传到 Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `dishes/${dishId}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('dish-images')
        .upload(fileName, file, {
          upsert: true
        });

      if (error) {
        throw error;
      }

      // 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from('dish-images')
        .getPublicUrl(fileName);

      // 调用回调函数，传递图片URL
      onUploadComplete(publicUrl);
      
      // 清空文件选择
      setFile(null);
    } catch (error) {
      console.error('上传失败:', error);
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {uploading ? '上传中...' : '上传图片'}
      </button>
    </div>
  );
};

export default ImageUpload;