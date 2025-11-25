import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  tableId: string;
  locationLabel: string;
}

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, tableId, locationLabel }) => {
  if (!isOpen) return null;

  const mapUrl = "https://www.google.com/maps/search/?api=1&query=Jinjiang+Star+Hotel+Jiangxi+Grand+Hotel";
  
  // Current URL with the table ID to share
  const currentUrl = `${window.location.origin}${window.location.pathname}?table=${tableId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}&bgcolor=fdfbf7&color=2c1810`;

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
        alert('链接已复制，请发送给同住人。\nLink copied to clipboard.');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-paper bg-texture w-full max-w-xs sm:max-w-sm mx-4 rounded-sm shadow-2xl relative overflow-hidden border-4 border-double border-stone-200 p-6 sm:p-8 text-center max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gold opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gold opacity-40"></div>

        <button onClick={onClose} className="absolute top-2 right-2 text-stone-400 hover:text-ink p-2 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-ink mb-2 tracking-widest font-serif">餐厅信息</h2>
        <p className="text-xs text-gold uppercase tracking-widest mb-8 font-bold">About Us</p>

        <div className="space-y-6 relative z-10">
            <div>
                <h3 className="text-xl font-bold text-ink mb-1">江西大酒店四楼会所</h3>
                <p className="text-stone-500 text-xs sm:text-sm serif">Jinjiang Star Hotel</p>
            </div>

            <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent mx-auto"></div>

            <div className="flex flex-col items-center gap-4 text-stone-600">
                {/* Phone Section - Linked to Dialer */}
                <a 
                  href="tel:+639552461263"
                  className="flex items-center gap-3 group/phone cursor-pointer hover:bg-stone-50 p-2 -m-2 rounded transition-colors w-full justify-center sm:justify-start sm:w-auto"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex-shrink-0 flex items-center justify-center text-gold border border-stone-200 shadow-sm group-hover/phone:bg-gold group-hover/phone:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <span className="block font-mono text-lg tracking-wide font-bold text-ink group-hover/phone:text-cinnabar transition-colors">0955 246 1263</span>
                         <span className="text-[10px] text-white bg-gold px-2 py-0.5 rounded-sm mt-1 inline-block font-bold shadow-sm tracking-wider group-hover/phone:bg-cinnabar transition-colors">
                            立即拨打 CALL NOW
                         </span>
                    </div>
                </a>

                {/* Telegram Section */}
                <a 
                  href="https://t.me/jx555999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group/tg cursor-pointer hover:bg-stone-50 p-2 -m-2 rounded transition-colors w-full justify-center sm:justify-start sm:w-auto"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex-shrink-0 flex items-center justify-center text-gold border border-stone-200 shadow-sm group-hover/tg:bg-gold group-hover/tg:text-white transition-colors">
                        <TelegramIcon />
                    </div>
                    <div className="text-left">
                        <span className="block font-mono text-lg tracking-wide font-bold text-ink group-hover/tg:text-cinnabar transition-colors">@jx555999</span>
                         <span className="text-[10px] text-gold underline opacity-0 group-hover/tg:opacity-100 transition-opacity block">Telegram Contact</span>
                    </div>
                </a>

                {/* Address Section - Linked to Google Maps */}
                <a 
                  href={mapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group/map cursor-pointer hover:bg-stone-50 p-2 -m-2 rounded transition-colors text-left w-full justify-center sm:justify-start sm:w-auto"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex-shrink-0 flex items-center justify-center text-gold border border-stone-200 shadow-sm mt-1 group-hover/map:bg-gold group-hover/map:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                    </div>
                    <span className="text-sm leading-relaxed">
                        <span className="block text-ink font-bold group-hover/map:text-cinnabar transition-colors">江西大酒店四楼会所</span>
                        <span className="block text-xs text-stone-400 mt-0.5">4th Floor, Jinjiang Star Hotel</span>
                        <span className="block text-xs text-stone-400">Metro Manila, Philippines</span>
                        <span className="text-[10px] text-gold underline mt-1 flex items-center gap-1 opacity-80 group-hover/map:opacity-100">
                            查看地图 View Map
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </span>
                    </span>
                </a>
            </div>

            <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent mx-auto"></div>
            
            {/* Share / QR Section */}
            <div className="bg-stone-100/50 p-4 rounded border border-stone-200">
                <p className="text-xs text-stone-500 font-bold mb-3 tracking-wider">
                    当前位置: <span className="text-cinnabar">{locationLabel}</span>
                </p>
                
                <div className="flex gap-4 items-center justify-center">
                    <div className="relative inline-block group bg-white p-2 shadow-sm border border-stone-100">
                        <img src={qrUrl} className="w-20 h-20 rendering-pixelated" alt="Location QR" />
                    </div>
                    
                    <button 
                        onClick={copyLink}
                        className="flex flex-col items-center gap-1 text-stone-500 hover:text-gold transition-colors p-2"
                    >
                        <div className="w-10 h-10 rounded-full bg-wood text-gold flex items-center justify-center shadow-md">
                            <ShareIcon />
                        </div>
                        <span className="text-[10px] font-bold">复制链接<br/>Copy Link</span>
                    </button>
                </div>
                <p className="text-[10px] text-stone-400 mt-2">分享给同伴点餐 Share to order together</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;