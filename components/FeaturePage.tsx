// FeaturePage.tsx - 功能页面组件
import React from 'react';

interface FeaturePageProps {
  title: string;
  titleEn: string;
  children: React.ReactNode;
  onBack: () => void;
}

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const FeaturePage: React.FC<FeaturePageProps> = ({ title, titleEn, children, onBack }) => {
  return (
    <div className="h-full flex flex-col bg-paper bg-texture relative shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gold/30 pb-2 pl-4 pr-2">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-stone-500 hover:text-ink"
        >
          <BackIcon />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-ink tracking-wide">{title}</h2>
          <p className="text-xs text-gold uppercase tracking-wider font-bold">{titleEn}</p>
        </div>
        <div className="w-10"></div> {/* 占位符，保持标题居中 */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-stone-100 flex justify-between items-end pl-4">
        <span className="text-[10px] text-stone-300 italic">江西大酒店四楼会所</span>
        <span className="font-serif text-stone-400 text-sm">Jinjiang Star Hotel</span>
      </div>
    </div>
  );
};

export default FeaturePage;