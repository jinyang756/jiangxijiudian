import React from 'react';

interface SectionHeaderProps {
  zh: string;
  en: string;
  pageIndex?: number;
  totalPages?: number;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ zh, en, pageIndex, totalPages }) => {
  return (
    <div className="flex items-center justify-between mb-4 border-b border-gold/30 pb-2 pl-4">
      <div>
        <h2 className="text-xl font-bold text-ink tracking-wide">{zh}</h2>
        <p className="text-xs text-gold uppercase tracking-wider font-bold">{en}</p>
      </div>
      {(pageIndex !== undefined && totalPages !== undefined) && (
        <div className="text-xs text-stone-400 font-mono flex flex-col items-end">
           <span>{pageIndex} / {totalPages}</span>
           {totalPages > 1 && (
               <span className="text-[8px] scale-75 origin-right mt-0.5 text-gold">↕ 滑动翻页 Slide</span>
           )}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;