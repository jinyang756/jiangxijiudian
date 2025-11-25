import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';

interface DishDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
}

// Icons
const ChiliIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12.9 1.928c.706 2.14 1.226 4.4 1.41 6.472.32 3.64-1.71 7.455-4.628 9.783-1.312 1.045-2.896 1.72-4.565 1.798a.75.75 0 01-.396-1.393c1.538-.465 2.963-1.34 4.07-2.5 1.107-1.161 1.744-2.656 1.82-4.16.056-1.108-.266-2.226-.98-3.223a.75.75 0 01.387-1.16c1.366-.377 2.398-2.4 2.883-4.42.183-.76.08-1.753-.003-2.498a.75.75 0 011.346-.332c.346.842.519 1.685.582 2.492.063.808-.04 1.656-.316 2.447-.277.792-.71 1.53-1.255 2.138-.282.314-.597.597-.94.846.48 1.036.76 2.13.81 3.122.066 1.31-.488 2.61-1.45 3.62-1.056 1.107-2.456 1.912-3.974 2.296-.11.028-.22.052-.33.073a6.38 6.38 0 002.627-1.51c2.415-2.315 3.684-5.752 3.183-8.87-.183-1.135-.567-2.38-1.035-3.624-.234-.621-.486-1.252-.742-1.886z" clipRule="evenodd" />
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
  </svg>
);

const DishDetailModal: React.FC<DishDetailModalProps> = ({ item, onClose, quantity, onAdd, onRemove }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    setImageLoaded(false);
  }, [item?.id]);

  if (!item) return null;

  const isSoldOut = item.available === false;

  // Logic: Use backend provided URL first
  const seed = item.id.charCodeAt(0) + parseInt(item.id.slice(1) || '0');
  const imageUrl = item.imageUrl || `https://loremflickr.com/600/400/food,chinese/all?lock=${seed}`;

  // Bilingual description
  const description = `一道地道的传统佳肴，选用上等食材烹制，保留了食物的原汁原味。\nThis authentic dish is prepared using traditional methods to bring out the rich flavors of its premium ingredients.`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-paper w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* Image Header */}
        <div className="h-64 sm:h-72 flex-shrink-0 bg-stone-200 relative overflow-hidden">
             {!imageLoaded && (
                <div className="absolute inset-0 bg-stone-200 animate-shimmer bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] z-10" />
             )}
             <img 
               src={imageUrl} 
               alt={item.en} 
               className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isSoldOut ? 'grayscale' : ''}`}
               onLoad={() => setImageLoaded(true)}
             />
             <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
             
             {isSoldOut ? (
                 <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="border-4 border-white/80 text-white font-bold text-2xl px-4 py-2 rounded-sm -rotate-12 bg-black/40 backdrop-blur-md tracking-widest font-serif">
                        售罄 SOLD OUT
                    </div>
                 </div>
             ) : (
                 <div className="absolute bottom-4 left-6 right-6 flex gap-2">
                     <span className="px-2 py-1 bg-cinnabar text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm inline-block">
                        招牌菜 Signature
                     </span>
                 </div>
             )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-paper">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-ink mb-1 leading-tight">{item.zh}</h2>
                <p className="text-gold font-serif text-sm uppercase tracking-wider font-bold">{item.en}</p>
                
                {/* Prominent Dietary Tags */}
                {(item.spicy || item.vegetarian) && !isSoldOut && (
                  <div className="flex flex-wrap gap-3 mt-3 animate-fade-in">
                    {item.spicy && (
                      <span className="flex items-center gap-1.5 text-cinnabar text-xs font-bold border border-cinnabar/20 px-3 py-1.5 rounded-full bg-cinnabar/5 shadow-sm">
                        <ChiliIcon /> SPICY
                      </span>
                    )}
                    {item.vegetarian && (
                      <span className="flex items-center gap-1.5 text-green-700 text-xs font-bold border border-green-700/20 px-3 py-1.5 rounded-full bg-green-50 shadow-sm">
                        <LeafIcon /> VEGETARIAN
                      </span>
                    )}
                  </div>
                )}
            </div>

            <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-dashed border-stone-200">
                <span className={`text-3xl font-bold ${isSoldOut ? 'text-stone-400' : 'text-cinnabar'}`}>
                    <span className="text-lg align-top mr-1">₱</span>{item.price}
                </span>
                <span className="text-stone-400 text-xs">/ 份 portion</span>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-ink uppercase tracking-widest border-l-2 border-gold pl-2">详情 Details</h3>
                <p className="text-stone-600 leading-relaxed font-serif text-sm text-justify whitespace-pre-line">
                    {description}
                </p>
            </div>
            
            {/* Additional Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-stone-100 text-stone-500 text-[10px] uppercase tracking-wider rounded-sm">传统做法 Traditional</span>
                <span className="px-3 py-1 bg-stone-100 text-stone-500 text-[10px] uppercase tracking-wider rounded-sm">主厨推荐 Chef's Pick</span>
            </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-white border-t border-stone-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {isSoldOut ? (
                 <div className="w-full py-3 bg-stone-200 text-stone-500 text-center font-bold rounded-sm uppercase tracking-widest cursor-not-allowed">
                    已售罄 Sold Out
                 </div>
            ) : (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {quantity > 0 ? (
                            <div className="flex items-center bg-stone-100 rounded-full p-1">
                                <button onClick={() => onRemove(item)} className="w-10 h-10 rounded-full bg-white text-ink shadow-sm flex items-center justify-center text-xl font-bold active:scale-95 transition-transform">-</button>
                                <span className="w-10 text-center font-bold text-xl tabular-nums text-ink">{quantity}</span>
                                <button onClick={() => onAdd(item)} className="w-10 h-10 rounded-full bg-gold text-white shadow-sm flex items-center justify-center text-xl font-bold active:scale-95 transition-transform">+</button>
                            </div>
                        ) : (
                            <span className="text-sm text-stone-400 pl-2 font-serif italic">请选择数量 Select Quantity</span>
                        )}
                    </div>
                    
                    {quantity === 0 ? (
                        <button 
                            onClick={() => onAdd(item)}
                            className="flex-1 bg-wood text-gold py-3 rounded-sm font-bold tracking-widest hover:bg-black transition-colors shadow-md active:scale-[0.98] uppercase text-sm"
                        >
                            加入订单 Add to Order
                        </button>
                    ) : (
                        <button 
                            onClick={onClose}
                            className="flex-1 bg-stone-800 text-white py-3 rounded-sm font-bold tracking-widest hover:bg-black transition-colors shadow-md active:scale-[0.98] uppercase text-sm"
                        >
                            确认 Confirm
                        </button>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default DishDetailModal;