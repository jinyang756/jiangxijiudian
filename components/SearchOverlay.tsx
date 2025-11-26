import React, { useState, useMemo } from 'react';
import { MenuItem, MenuCategory } from '../types';
import { getDishImageUrl } from '../src/lib/imageUtils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  menuData: MenuCategory[];
  cart: { [id: string]: number };
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
  onItemClick?: (item: MenuItem) => void;
}

const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase() === highlight.toLowerCase() ? <span key={i} className="text-cinnabar font-bold bg-yellow-100/50 rounded-sm">{part}</span> : part
            )}
        </>
    );
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, menuData, cart, onAdd, onRemove, onItemClick }) => {
  const [query, setQuery] = useState('');

  // Flatten items for search and add image loading status
  const allItems = useMemo(() => {
    return menuData.flatMap(cat => cat.items);
  }, [menuData]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQ = query.toLowerCase();
    return allItems.filter(item => 
      item.zh.includes(query) || 
      item.en.toLowerCase().includes(lowerQ) ||
      item.id.toLowerCase().includes(lowerQ)
    );
  }, [allItems, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-paper flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-gold/30 bg-wood/5 shadow-sm flex items-center gap-3">
        <button onClick={onClose} className="p-2 -ml-2 text-stone-500 hover:text-ink">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 relative">
           <input
             type="text"
             placeholder="搜索菜品 Search dishes..."
             className="w-full bg-white border border-stone-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-ink"
             value={query}
             onChange={e => setQuery(e.target.value)}
             autoFocus
           />
           {query && (
             <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
               </svg>
             </button>
           )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 bg-texture">
        {query.trim() === '' ? (
            <div className="text-center mt-20 text-stone-400">
                <p>请输入菜名或拼音</p>
                <p className="text-xs mt-1">Please enter dish name</p>
            </div>
        ) : filteredItems.length === 0 ? (
            <div className="text-center mt-20 text-stone-400">
                <p>未找到相关菜品</p>
                <p className="text-xs mt-1">No dishes found</p>
            </div>
        ) : (
            <div className="space-y-3">
                {filteredItems.map(item => {
                    const qty = cart[item.id] || 0;
                    const imageUrl = getDishImageUrl(item.imageUrl, item.id);

                    return (
                        <div 
                            key={item.id} 
                            className="bg-white p-3 rounded shadow-sm border border-stone-100 flex gap-3 items-center cursor-pointer active:bg-stone-50"
                            onClick={() => onItemClick?.(item)}
                        >
                            <img src={imageUrl} className="w-16 h-16 object-cover rounded-sm bg-stone-200" alt={item.en} />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-ink truncate">
                                    <HighlightText text={item.zh} highlight={query} />
                                </h4>
                                <p className="text-xs text-stone-500 truncate">
                                    <HighlightText text={item.en} highlight={query} />
                                </p>
                                <div className="text-cinnabar font-bold mt-1">
                                    {item.price.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                                </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {qty > 0 && (
                                    <button onClick={() => onRemove(item)} className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 active:bg-stone-200">-</button>
                                )}
                                {qty > 0 && <span className="text-sm font-bold w-4 text-center">{qty}</span>}
                                <button onClick={() => onAdd(item)} className="w-7 h-7 flex items-center justify-center rounded-full bg-wood text-gold active:bg-black">+</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;