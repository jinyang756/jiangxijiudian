import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  locationLabel: string;
}

type ViewState = 'grid' | 'ktv';

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, tableId, locationLabel }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('grid');
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView('grid');
      setSongName('');
      setArtist('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const playAnnouncement = (message: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRequest = async (serviceZh: string, serviceEn: string, typeId: string) => {
    try {
      const response = await api.callService({
        tableId: tableId,
        type: typeId,
        typeName: serviceZh
      });
      
      if (response.code === 200) {
        setToast(`已呼叫: ${serviceZh}\nRequest Sent: ${serviceEn}`);
        // Extract room number/table info from label for cleaner speech
        // locationLabel is like "房间 Room 808" -> we want "Room 808"
        // But simply reading the whole label is usually fine or we can parse it.
        // Let's use the full label for clarity.
        playAnnouncement(`${locationLabel} requesting ${serviceEn}`);
      } else {
        setToast('呼叫失败 Failed');
      }
    } catch (e) {
      setToast('网络错误 Network Error');
    }
  };

  const handleKtvSubmit = async () => {
    if (!songName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const details = `Song: ${songName}${artist ? ` | Artist: ${artist}` : ''}`;
      const response = await api.callService({
        tableId: tableId,
        type: 'ktv_song',
        typeName: 'KTV点歌',
        details: details
      });

      if (response.code === 200) {
        setToast(`已点歌: ${songName}\nSong Requested`);
        playAnnouncement(`${locationLabel} requesting Song ${songName}`);
        
        // Return to grid after short delay
        setTimeout(() => {
            setView('grid');
            setSongName('');
            setArtist('');
        }, 1000);
      } else {
        setToast('请求失败 Failed');
      }
    } catch (e) {
      setToast('网络错误 Network Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    { id: 'waiter', zh: '呼叫服务员', en: 'Call Waiter', icon: '👋' },
    { id: 'water', zh: '加水', en: 'Water Refill', icon: '🫗' },
    { id: 'napkins', zh: '餐巾纸', en: 'Napkins', icon: '🧻' },
    { id: 'bill', zh: '结账', en: 'Request Bill', icon: '🧾' },
    { id: 'bowl', zh: '加碗筷', en: 'Extra Cutlery', icon: '🥣' },
    { id: 'clean', zh: '清理桌面', en: 'Clean Table', icon: '✨' },
    { id: 'ktv', zh: 'KTV点歌', en: 'Song Request', icon: '🎤' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-paper bg-texture w-full max-w-sm mx-4 rounded-sm shadow-2xl border-4 border-double border-stone-200 p-6 relative transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold opacity-50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold opacity-50"></div>

        <button onClick={onClose} className="absolute top-2 right-2 text-stone-400 hover:text-ink p-2 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-ink tracking-widest font-serif">
             {view === 'grid' ? '呼叫服务' : 'KTV 点歌'}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
             <p className="text-xs text-gold uppercase tracking-widest font-bold">
                {view === 'grid' ? 'Service Request' : 'Song Request'}
             </p>
             <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-bold">{locationLabel}</span>
          </div>
        </div>

        {view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {services.map((item) => (
                <button
                key={item.id}
                onClick={() => {
                    if (item.id === 'ktv') {
                        setView('ktv');
                    } else {
                        handleRequest(item.zh, item.en, item.id);
                    }
                }}
                className={`flex flex-col items-center justify-center p-4 bg-white border border-stone-100 shadow-sm rounded-sm active:scale-95 active:bg-stone-50 transition-all group hover:border-gold/30 ${item.id === 'ktv' ? 'col-span-2 bg-stone-50 border-dashed border-gold/30' : ''}`}
                >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-sm font-bold text-ink">{item.zh}</span>
                <span className="text-[10px] text-stone-500 uppercase">{item.en}</span>
                </button>
            ))}
            </div>
        ) : (
            <div className="animate-slide-up">
                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-ink mb-1 tracking-wider">歌名 SONG TITLE <span className="text-cinnabar">*</span></label>
                         <input 
                            type="text" 
                            value={songName}
                            onChange={(e) => setSongName(e.target.value)}
                            placeholder="请输入歌名 e.g. My Way"
                            className="w-full p-3 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-gold text-ink placeholder:text-stone-300"
                            autoFocus
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-ink mb-1 tracking-wider">歌手 ARTIST (Optional)</label>
                         <input 
                            type="text" 
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            placeholder="请输入歌手名"
                            className="w-full p-3 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-gold text-ink placeholder:text-stone-300"
                         />
                     </div>
                 </div>

                 <div className="mt-8 flex gap-3">
                     <button 
                        onClick={() => setView('grid')}
                        className="flex-1 py-3 border border-stone-300 text-stone-500 rounded-sm font-bold hover:bg-stone-50 transition-colors text-sm tracking-widest"
                     >
                         返回 BACK
                     </button>
                     <button 
                        onClick={handleKtvSubmit}
                        disabled={!songName.trim() || isSubmitting}
                        className={`flex-1 py-3 text-white rounded-sm font-bold shadow-md transition-colors text-sm tracking-widest flex items-center justify-center gap-2 ${!songName.trim() || isSubmitting ? 'bg-stone-300 cursor-not-allowed' : 'bg-wood hover:bg-black text-gold'}`}
                     >
                         {isSubmitting ? (
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                             '提交 SUBMIT'
                         )}
                     </button>
                 </div>
            </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/80 text-white px-6 py-4 rounded shadow-xl text-center animate-fade-in backdrop-blur-md">
               <div className="text-gold text-2xl mb-2">✓</div>
               <pre className="font-sans text-sm whitespace-pre-wrap">{toast}</pre>
            </div>
          </div>
        )}
        
        {view === 'grid' && (
            <div className="mt-6 text-center">
                <p className="text-[10px] text-stone-400">服务员将尽快赶到，请稍候<br/>Waiter will arrive shortly</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ServiceModal;