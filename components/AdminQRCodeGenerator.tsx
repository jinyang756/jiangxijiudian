import React, { useState, useRef } from 'react';
import PrinterMappingManager from './PrinterMapping';

type LocationType = 'restaurant' | 'hotel' | 'ktv';

const AdminQRCodeGenerator: React.FC = () => {
  const [locationType, setLocationType] = useState<LocationType>('hotel');
  const [inputNumber, setInputNumber] = useState('');
  const [showPrinterConfig, setShowPrinterConfig] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Generate the full Table ID based on type
  const getFullId = () => {
    const num = inputNumber.trim() || '000';
    switch (locationType) {
      case 'hotel': return `RM-${num}`;
      case 'ktv': return `KTV-${num}`;
      case 'restaurant': return `T-${num}`;
      default: return num;
    }
  };

  // Human readable label for the card
  const getLabel = () => {
    const num = inputNumber.trim() || '___';
    switch (locationType) {
      case 'hotel': return `房间 Room ${num}`;
      case 'ktv': return `包厢 KTV Box ${num}`;
      case 'restaurant': return `桌号 Table ${num}`;
      default: return num;
    }
  };

  const fullId = getFullId();
  // Construct the URL: current origin + query param
  const appUrl = `${window.location.origin}${window.location.pathname}?table=${fullId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appUrl)}&bgcolor=fdfbf7&color=2c1810`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React state
  };

  const exitAdmin = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="min-h-screen bg-wood p-4 md:p-8 font-sans relative">
      <button 
        onClick={exitAdmin}
        className="absolute top-4 right-4 bg-stone-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-stone-900 transition-colors z-50"
      >
        返回菜单 Back to Menu
      </button>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        
        {/* Controls */}
        <div className="bg-paper p-6 rounded shadow-xl border-t-4 border-gold">
          <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-2">
            <h1 className="text-2xl font-bold text-ink">二维码生成后台</h1>
            <button 
              onClick={() => setShowPrinterConfig(!showPrinterConfig)}
              className="text-sm bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1 rounded transition-colors"
            >
              {showPrinterConfig ? '隐藏打印机配置' : '显示打印机配置'}
            </button>
          </div>
          
          {showPrinterConfig && (
            <div className="mb-6">
              <PrinterMappingManager />
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wider">1. 选择区域 Area Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setLocationType('hotel')}
                  className={`p-3 rounded border text-sm font-bold transition-all ${locationType === 'hotel' ? 'bg-gold text-white border-gold shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-gold'}`}
                >
                  🏨 酒店客房<br/><span className="text-[10px] font-normal">Hotel Room</span>
                </button>
                <button 
                  onClick={() => setLocationType('restaurant')}
                  className={`p-3 rounded border text-sm font-bold transition-all ${locationType === 'restaurant' ? 'bg-cinnabar text-white border-cinnabar shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-cinnabar'}`}
                >
                  🍽️ 餐厅大堂<br/><span className="text-[10px] font-normal">Restaurant</span>
                </button>
                <button 
                  onClick={() => setLocationType('ktv')}
                  className={`p-3 rounded border text-sm font-bold transition-all ${locationType === 'ktv' ? 'bg-purple-900 text-white border-purple-900 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-purple-900'}`}
                >
                  🎤 KTV包厢<br/><span className="text-[10px] font-normal">KTV Box</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wider">2. 输入号码 Number/ID</label>
              <input 
                type="text" 
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value)}
                placeholder={locationType === 'hotel' ? 'e.g. 808' : locationType === 'ktv' ? 'e.g. V88' : 'e.g. A01'}
                className="w-full text-2xl font-bold p-3 border-2 border-stone-300 rounded focus:border-gold focus:outline-none text-ink placeholder:text-stone-200 uppercase"
              />
              <p className="text-xs text-stone-400 mt-2">
                系统ID预览: <code className="bg-stone-100 px-1 py-0.5 rounded text-cinnabar font-mono">{fullId}</code>
              </p>
            </div>

            <div className="pt-4 border-t border-dashed border-stone-200">
               <button 
                 onClick={handlePrint}
                 className="w-full bg-wood text-gold py-4 rounded font-bold text-lg hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                 </svg>
                 打印卡片 Print Card
               </button>
               <p className="text-center text-xs text-stone-400 mt-2">推荐使用 A4 纸打印或保存为 PDF</p>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center bg-stone-100 p-8 rounded border-2 border-dashed border-stone-300">
           <p className="text-stone-400 font-bold mb-4 uppercase tracking-widest text-sm">打印预览 Preview</p>
           
           {/* The Printable Card */}
           <div ref={printRef} className="w-[300px] bg-paper text-ink shadow-2xl relative overflow-hidden print:w-full print:h-screen print:flex print:items-center print:justify-center print:shadow-none">
              <div className="border-[12px] border-double border-gold/30 p-6 flex flex-col items-center text-center h-[450px] relative print:border-none print:w-[100mm] print:h-[150mm] print:mx-auto">
                 {/* Background texture for print */}
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] z-0"></div>
                 
                 <div className="relative z-10 w-full flex flex-col h-full">
                    <div className="mb-4">
                        <div className="w-12 h-12 bg-cinnabar text-white font-bold flex items-center justify-center text-2xl mx-auto mb-2 rounded-sm shadow-sm rotate-45">
                           <div className="-rotate-45">食</div>
                        </div>
                        <h2 className="text-xl font-bold tracking-widest text-ink">江西大酒店</h2>
                        <p className="text-[10px] text-gold uppercase tracking-widest font-bold">Jinjiang Star Hotel</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                        <div className="bg-white p-2 border border-stone-200 shadow-lg mb-4">
                             <img src={qrUrl} alt="QR Code" className="w-40 h-40 rendering-pixelated" />
                        </div>
                        <p className="text-sm text-stone-500 font-bold tracking-widest mb-1">扫码点餐 / 呼叫服务</p>
                        <p className="text-[10px] text-stone-400 uppercase">Scan to Order / Call Service</p>
                    </div>

                    <div className="mt-auto border-t-2 border-gold pt-4 w-full">
                        <p className="text-stone-400 text-[10px] uppercase tracking-widest mb-1">
                            {locationType === 'hotel' ? 'Guest Room' : locationType === 'ktv' ? 'Private Box' : 'Table Number'}
                        </p>
                        <h3 className="text-3xl font-bold text-cinnabar font-serif">
                             {getLabel()}
                        </h3>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminQRCodeGenerator;