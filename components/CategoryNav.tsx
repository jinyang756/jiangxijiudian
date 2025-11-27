import React from 'react';
import { MenuCategory } from '../src/types/types';

interface CategoryNavProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  onSelectCategory: (key: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ isOpen, onClose, categories, onSelectCategory }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer - 优化移动端显示 */}
      <div className={`fixed inset-y-0 left-0 w-64 sm:w-72 bg-paper z-50 shadow-2xl transform transition-transform duration-300 border-r-4 border-double border-stone-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 sm:p-6 border-b border-stone-200 bg-wood text-gold">
            <h2 className="text-xl font-bold tracking-[0.2em]">菜单导航</h2>
            <p className="text-xs opacity-70 mt-1 uppercase tracking-widest">Menu Navigation</p>
          </div>

          <div className="flex-1 overflow-y-auto py-2 sm:py-4">
            {categories.map((cat, index) => (
               <button
                 key={cat.key}
                 onClick={() => {
                   onSelectCategory(cat.key);
                   onClose(); // 选择后自动关闭菜单
                 }}
                 className="w-full text-left px-4 sm:px-6 py-3 sm:py-4 hover:bg-stone-100 transition-colors border-b border-dashed border-stone-100 group"
               >
                 <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-ink group-hover:text-gold transition-colors">{cat.titleZh}</h3>
                        <p className="text-xs text-stone-500 uppercase tracking-wide hidden sm:block">{cat.titleEn}</p>
                    </div>
                    <span className="text-stone-300 font-serif italic text-sm">{String(index + 1).padStart(2, '0')}</span>
                 </div>
               </button>
            ))}
          </div>

          <div className="p-4 border-t border-stone-200 text-center">
            <button onClick={onClose} className="text-stone-400 hover:text-ink text-sm">
              关闭 Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryNav;
