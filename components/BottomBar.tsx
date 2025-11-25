import React from 'react';

interface BottomBarProps {
  cartCount: number;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenInfo: () => void;
  onOpenService: () => void;
}

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const InformationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const BottomBar: React.FC<BottomBarProps> = ({ cartCount, onOpenMenu, onOpenSearch, onOpenCart, onOpenInfo, onOpenService }) => {
  return (
    <div className="h-16 bg-wood border-t border-stone-800 flex items-center justify-between text-stone-400 px-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
      <button onClick={onOpenMenu} className="flex flex-col items-center justify-center gap-0.5 p-1 active:text-gold transition-colors w-14">
        <MenuIcon />
        <span className="text-[10px] font-serif tracking-widest leading-none">分类</span>
        <span className="text-[8px] uppercase transform scale-90 text-stone-500">Menu</span>
      </button>

      <button onClick={onOpenSearch} className="flex flex-col items-center justify-center gap-0.5 p-1 active:text-gold transition-colors w-14">
        <SearchIcon />
        <span className="text-[10px] font-serif tracking-widest leading-none">搜索</span>
        <span className="text-[8px] uppercase transform scale-90 text-stone-500">Search</span>
      </button>

      <button onClick={onOpenService} className="flex flex-col items-center justify-center gap-0.5 p-1 active:text-gold transition-colors w-14 group">
        <div className="group-active:animate-ping absolute opacity-20 bg-gold rounded-full w-6 h-6 pointer-events-none"></div>
        <BellIcon />
        <span className="text-[10px] font-serif tracking-widest leading-none">服务</span>
        <span className="text-[8px] uppercase transform scale-90 text-stone-500">Service</span>
      </button>

      <button onClick={onOpenInfo} className="flex flex-col items-center justify-center gap-0.5 p-1 active:text-gold transition-colors w-14">
        <InformationIcon />
        <span className="text-[10px] font-serif tracking-widest leading-none">关于</span>
        <span className="text-[8px] uppercase transform scale-90 text-stone-500">About</span>
      </button>

      <button onClick={onOpenCart} className="flex flex-col items-center justify-center gap-0.5 p-1 active:text-gold transition-colors relative group w-14">
        <div className="relative">
            <ShoppingBagIcon />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-cinnabar text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 animate-bounce shadow-sm">
                    {cartCount}
                </span>
            )}
        </div>
        <span className="text-[10px] font-serif tracking-widest leading-none">订单</span>
        <span className="text-[8px] uppercase transform scale-90 text-stone-500">Order</span>
      </button>
    </div>
  );
};

export default BottomBar;