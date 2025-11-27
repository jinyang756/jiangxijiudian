import React, { useState } from 'react';

interface TaggedQRGeneratorProps {
  tableId: string;
  onGenerate: (url: string, tag: string) => void;
}

const TaggedQRGenerator: React.FC<TaggedQRGeneratorProps> = ({ tableId, onGenerate }) => {
  const [tag, setTag] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  const generateTaggedQR = () => {
    if (!tag.trim()) {
      alert('请输入标签');
      return;
    }

    // 生成带标签的URL
    const url = `${window.location.origin}${window.location.pathname}?table=${tableId}&tag=${encodeURIComponent(tag)}`;
    setGeneratedUrl(url);
    
    // 生成二维码URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=fdfbf7&color=2c1810`;
    setQrUrl(qrCodeUrl);
    
    // 回调通知父组件
    onGenerate(url, tag);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      alert('链接已复制到剪贴板');
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-stone-200">
      <h3 className="text-lg font-bold text-ink mb-4">生成标签化二维码</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">标签 Tag</label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="例如: 外卖, 儿童餐, VIP"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        
        <button
          onClick={generateTaggedQR}
          className="w-full bg-wood text-gold py-2 px-4 rounded-md font-bold hover:bg-black transition-colors"
        >
          生成二维码 Generate QR Code
        </button>
        
        {generatedUrl && (
          <div className="mt-4 p-4 bg-stone-50 rounded-md border border-stone-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-ink">生成的链接 Generated URL</h4>
              <button
                onClick={copyToClipboard}
                className="text-sm bg-stone-200 hover:bg-stone-300 text-stone-700 px-2 py-1 rounded"
              >
                复制 Copy
              </button>
            </div>
            <p className="text-sm text-stone-600 break-all mb-4">{generatedUrl}</p>
            
            <div className="flex flex-col items-center">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 mb-2" />
              <p className="text-xs text-stone-500">扫码访问 Scan to Access</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaggedQRGenerator;