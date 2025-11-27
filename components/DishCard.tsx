import React, { useState, useEffect } from 'react';
import { MenuItem } from '../src/types/types';
import { getDishImageUrl, getDefaultPlaceholder } from '../src/lib/imageUtils';

interface DishCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
  onClick?: (item: MenuItem) => void;
}

// Icons
const ChiliIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path fillRule="evenodd" d="M12.9 1.928c.706 2.14 1.226 4.4 1.41 6.472.32 3.64-1.71 7.455-4.628 9.783-1.312 1.045-2.896 1.72-4.565 1.798a.75.75 0 01-.396-1.393c1.538-.465 2.963-1.34 4.07-2.5 1.107-1.161 1.744-2.656 1.82-4.16.056-1.108-.266-2.226-.98-3.223a.75.75 0 01.387-1.16c1.366-.377 2.398-2.4 2.883-4.42.183-.76.08-1.753-.003-2.498a.75.75 0 011.346-.332c.346.842.519 1.685.582 2.492.063.808-.04 1.656-.316 2.447-.277.792-.71 1.53-1.255 2.138-.282.314-.597.597-.94.846.48 1.036.76 2.13.81 3.122.066 1.31-.488 2.61-1.45 3.62-1.056 1.107-2.456 1.912-3.974 2.296-.11.028-.22.052-.33.073a6.38 6.38 0 002.627-1.51c2.415-2.315 3.684-5.752 3.183-8.87-.183-1.135-.567-2.38-1.035-3.624-.234-.621-.486-1.252-.742-1.886z" clipRule="evenodd" />
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
  </svg>
);


const DishCard: React.FC<DishCardProps> = ({ item, quantity, onAdd, onRemove, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // 使用新的图片管理工具，优先使用数据库URL，降级到本地占位图
  const imageUrl = getDishImageUrl(item.imageUrl, item.id);
  const fallbackImage = getDefaultPlaceholder();
  
  // Check if sold out (default to true if undefined)
  const isSoldOut = item.available === false;

  // 处理图片加载错误，显示默认图片
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // 重置图片状态
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [item.id]);

  // 预加载图片
  useEffect(() => {
    if (item.imageUrl) {
      const img = new Image();
      img.src = item.imageUrl;
      img.onload = () => {
        if (item.id === item.id) { // 确保是当前组件的图片
          setImageLoaded(true);
        }
      };
      img.onerror = () => {
        if (item.id === item.id) { // 确保是当前组件的图片
          handleImageError();
        }
      };
    }
  }, [item.imageUrl, item.id]);

  return (
    <div 
      className={`bg-white p-2 shadow-sm border border-stone-100 flex flex-col h-full transition-all relative group ${isSoldOut ? 'opacity-80' : 'cursor-pointer active:scale-[0.99]'}`}
      onClick={() => !isSoldOut && onClick?.(item)}
    >
      
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3] mb-2 bg-stone-100 rounded-sm group-hover:shadow-md transition-shadow">
        {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-stone-200 animate-shimmer bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] z-10" />
        )}
        <img
          src={imageError ? fallbackImage : imageUrl}
          alt={item.en}
          className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isSoldOut ? 'grayscale contrast-125' : 'group-hover:scale-110'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
        <div className="absolute top-0 left-0 bg-wood/80 text-stone-light px-1.5 py-0.5 text-[10px] font-serif z-10">
          {item.id}
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/10">
                <div className="border-4 border-stone-600 text-stone-600 font-bold text-lg px-3 py-1 rounded-sm -rotate-12 opacity-90 bg-white/60 backdrop-blur-sm tracking-widest font-serif shadow-lg">
                    售罄
                    <div className="text-[8px] leading-none text-center mt-0.5">SOLD OUT</div>
                </div>
            </div>
        )}

        {/* Dietary Icons */}
        {!isSoldOut && (
            <div className="absolute top-1 right-1 flex gap-1 z-10">
            {item.spicy && (
                <div className="bg-cinnabar text-white w-5 h-5 rounded-full shadow-sm flex items-center justify-center" title="Spicy">
                <ChiliIcon />
                </div>
            )}
            {item.vegetarian && (
                <div className="bg-jade text-green-800 w-5 h-5 rounded-full shadow-sm flex items-center justify-center border border-green-800/10" title="Vegetarian">
                <LeafIcon />
                </div>
            )}
            </div>
        )}

        {/* Quick Add Overlay Button (Only if available) */}
        {!isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd(item);
                }}
                className="bg-gold/90 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-cinnabar hover:scale-110 pointer-events-auto backdrop-blur-sm"
                title="Quick Add"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                </button>
            </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-1">
          <h3 className={`text-sm font-bold leading-tight line-clamp-1 ${isSoldOut ? 'text-stone-400' : 'text-ink'}`}>{item.zh}</h3>
          <p className="text-[10px] text-stone-500 leading-tight mt-0.5 line-clamp-2 h-6 overflow-hidden">{item.en}</p>
        </div>

        <div className="mt-auto pt-2 border-t border-dashed border-stone-200 flex justify-between items-center">
          <div className={`flex items-baseline ${isSoldOut ? 'text-stone-400' : 'text-cinnabar'}`}>
             <span className="text-base font-bold">
                {item.price.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
             </span>
          </div>

          {/* Add/Remove Controls (Stepper) */}
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            {isSoldOut ? (
                <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-sm">N/A</span>
            ) : (
                <>
                    {quantity > 0 ? (
                    <div className="flex items-center bg-stone-100 rounded-full p-0.5 shadow-inner transition-all animate-fade-in">
                        <button 
                        onClick={() => onRemove(item)}
                        className="w-6 h-6 rounded-full bg-white text-stone-600 flex items-center justify-center shadow-sm hover:text-cinnabar active:scale-95 transition-transform"
                        >
                        <span className="text-lg leading-none mb-0.5">-</span>
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-ink tabular-nums leading-none">{quantity}</span>
                        <button 
                        onClick={() => onAdd(item)}
                        className="w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                        >
                        <span className="text-lg leading-none mb-0.5">+</span>
                        </button>
                    </div>
                    ) : (
                    <button 
                        onClick={() => onAdd(item)}
                        className="w-7 h-7 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center shadow-md active:scale-95 hover:bg-gold transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishCard;