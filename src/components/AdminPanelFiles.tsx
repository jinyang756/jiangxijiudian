// src/components/AdminPanelFiles.tsx

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPanelFiles({ bucket = 'admin-panel', prefix = '' }) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 列出文件
  const listFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });
      
      if (error) {
        throw error;
      }
      
      // 对每个文件获取 public URL
      const filesWithUrl = data.map((item) => {
        // item.name 是相对路径/文件名
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(item.name);
        
        return {
          ...item,
          publicUrl: urlData?.publicUrl ?? null,
        };
      });
      
      setFiles(filesWithUrl);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listFiles();
  }, [bucket, prefix]);

  if (loading) return <div>加载中…</div>;
  if (error) return <div style={{ color: 'red' }}>错误：{error}</div>;
  if (!files.length) return <div>未找到文件</div>;

  return (
    <div>
      <h2>管理面板文件 — {bucket}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {files.map((f) => (
          <div key={f.name} style={{ width: 180, border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            {/* 若是图片，直接展示缩略 */}
            {isImage(f.name) ? (
              <a href={f.publicUrl} target="_blank" rel="noreferrer">
                <img
                  src={f.publicUrl}
                  alt={f.name}
                  style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = placeholderDataUrl();
                  }}
                />
              </a>
            ) : (
              <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 4 }}>
                <span style={{ fontSize: 12 }}>{getFileExt(f.name)}</span>
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, wordBreak: 'break-word' }}>{f.name}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                <a href={f.publicUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>打开</a>
                <button
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    // 复制 URL 到剪贴板
                    if (f.publicUrl) navigator.clipboard.writeText(f.publicUrl);
                    alert('已复制 URL 到剪贴板');
                  }}
                >
                  复制 URL
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 辅助：判断是否图片
function isImage(name = '') {
  const ext = getFileExt(name).toLowerCase();
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(ext);
}

function getFileExt(name = '') {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function placeholderDataUrl() {
  // small gray placeholder
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23EEE"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20">图片无法加载</text></svg>';
}