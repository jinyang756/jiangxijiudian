import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem, CartItems, MenuCategory } from './types';
import DishCard from './components/DishCard';
import BottomBar from './components/BottomBar';
import CategoryNav from './components/CategoryNav';
import SearchOverlay from './components/SearchOverlay';
import CartModal from './components/CartModal';
import InfoModal from './components/InfoModal';
import DishDetailModal from './components/DishDetailModal';
import ServiceModal from './components/ServiceModal';
import SectionHeader from './components/SectionHeader';
import AdminQRCodeGenerator from './components/AdminQRCodeGenerator';
import { api } from './services/api';
import { safeLocalStorageGet, safeLocalStorageSet, safeSessionStorageGet, safeSessionStorageSet } from './src/lib/storage';

// Types for our Page system
type PageType = 'cover' | 'content' | 'back';

interface PageData {
  type: PageType;
  id: string;
  categoryKey: string;
  items?: MenuItem[];
  categoryTitleZh?: string;
  categoryTitleEn?: string;
  pageNumber?: number;
  totalPages?: number;
  categoryIndex?: number;
}

type TransitionType = 'flip-next' | 'flip-prev' | 'slide-up' | 'slide-down' | null;

// Icons
const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

// --- Constants ---
const ITEMS_PER_PAGE = 6;

const App: React.FC = () => {
  // Check for Admin Mode
  const isAdminMode = new URLSearchParams(window.location.search).get('mode') === 'admin';

  // Data State
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [transition, setTransition] = useState<TransitionType>(null);
  
  // App States for Ordering & Nav
  const [cart, setCart] = useState<CartItems>(() => {
    return safeLocalStorageGet('cart', {});
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  // --- Location / Table Persistence Logic ---
  const [tableId, setTableId] = useState<string>('A01');

  useEffect(() => {
    // 1. Try URL Param
    const params = new URLSearchParams(window.location.search);
    const urlTableId = params.get('table');

    if (urlTableId) {
        setTableId(urlTableId);
        safeSessionStorageSet('tableId', urlTableId);
    } else {
        // 2. Try Session Storage (Persist on Refresh)
        const savedTableId = safeSessionStorageGet('tableId');
        if (savedTableId) {
            setTableId(savedTableId);
        }
    }
  }, []);

  // Derived Location Label
  const locationLabel = useMemo(() => {
    const id = tableId;
    if (id.startsWith('RM-')) {
        return `房间 Room ${id.replace('RM-', '')}`;
    } else if (id.startsWith('KTV-')) {
        return `KTV包厢 Box ${id.replace('KTV-', '')}`;
    } else if (id.startsWith('T-')) {
        return `桌号 Table ${id.replace('T-', '')}`;
    }
    return `Table ${id}`;
  }, [tableId]);

  // Fetch Data Function
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getMenu();
      if (response.data) {
        setMenuData(response.data);
      } else {
        setError('No data received');
      }
    } catch (e) {
      console.error("Failed to fetch menu", e);
      setError('Failed to load menu. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    if (!isAdminMode) {
      fetchData();
    }
  }, [isAdminMode]);

  // Save cart to localStorage
  useEffect(() => {
    safeLocalStorageSet('cart', cart);
  }, [cart]);

  // Play Sound on Flip
  useEffect(() => {
    if (transition === 'flip-next' || transition === 'flip-prev') {
       const audio = document.getElementById('page-flip-sound') as HTMLAudioElement;
       if (audio) {
           audio.currentTime = 0;
           audio.play().catch(() => console.log("Audio interaction needed first"));
       }
    }
  }, [transition]);

  // Derived State: Total Cart Count
  const cartCount = useMemo(() => Object.values(cart).reduce((a: number, b: number) => a + b, 0), [cart]);

  // Derived State: Map for quick item lookup
  const itemsMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    menuData.forEach(cat => {
        cat.items.forEach(item => map.set(item.id, item));
    });
    return map;
  }, [menuData]);

  // Actions
  const addToCart = (item: MenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (item: MenuItem) => {
    setCart(prev => {
      const current = prev[item.id] || 0;
      if (current <= 1) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: current - 1 };
    });
  };

  const updateCartQuantity = (item: MenuItem, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [item.id]: quantity
      }));
    }
  };

  const clearCart = () => setCart({});

  const handleDishClick = (item: MenuItem) => {
    setSelectedDish(item);
  };

  // Generate Pages & Category Mapping
  const { pages, categoryPageMap, categoryKeys } = useMemo(() => {
    const generatedPages: PageData[] = [];
    const catMap: {[key: string]: number} = {};
    const keys: string[] = ['cover'];

    // 1. Cover Page
    generatedPages.push({ type: 'cover', id: 'cover', categoryKey: 'cover' });
    catMap['cover'] = 0;

    // 2. Content Pages
    if (menuData.length > 0) {
      let globalPageCount = 1;
      menuData.forEach((category) => {
        keys.push(category.key);
        catMap[category.key] = generatedPages.length;

        const items = category.items;
        const totalCatPages = Math.ceil(items.length / ITEMS_PER_PAGE);

        for (let i = 0; i < totalCatPages; i++) {
          const start = i * ITEMS_PER_PAGE;
          const end = start + ITEMS_PER_PAGE;
          const pageItems = items.slice(start, end);

          generatedPages.push({
            type: 'content',
            id: `${category.key}-${i}`,
            categoryKey: category.key,
            items: pageItems,
            categoryTitleZh: category.titleZh,
            categoryTitleEn: category.titleEn,
            pageNumber: globalPageCount++,
            totalPages: totalCatPages,
            categoryIndex: i + 1
          });
        }
      });
    }

    // 3. Back Cover
    keys.push('back');
    catMap['back'] = generatedPages.length;
    generatedPages.push({ type: 'back', id: 'back', categoryKey: 'back' });

    return { pages: generatedPages, categoryPageMap: catMap, categoryKeys: keys };
  }, [menuData]);

  const totalPages = pages.length;
  const activePage = pages[currentPage] || pages[0];

  // Navigation Logic
  const goToNextCategory = () => {
    const currentCatKey = activePage.categoryKey;
    const currentCatIndex = categoryKeys.indexOf(currentCatKey);
    if (currentCatIndex < categoryKeys.length - 1) {
      const nextCatKey = categoryKeys[currentCatIndex + 1];
      setTransition('flip-next');
      setCurrentPage(categoryPageMap[nextCatKey]);
    }
  };

  const goToPrevCategory = () => {
    const currentCatKey = activePage.categoryKey;
    const currentCatIndex = categoryKeys.indexOf(currentCatKey);
    if (currentCatIndex > 0) {
      const prevCatKey = categoryKeys[currentCatIndex - 1];
      setTransition('flip-prev');
      setCurrentPage(categoryPageMap[prevCatKey]);
    }
  };

  const goToNextPageInCat = () => {
    if (currentPage < totalPages - 1) {
      const nextPage = pages[currentPage + 1];
      if (nextPage.categoryKey === activePage.categoryKey) {
        setTransition('slide-up');
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const goToPrevPageInCat = () => {
    if (currentPage > 0) {
      const prevPage = pages[currentPage - 1];
      if (prevPage.categoryKey === activePage.categoryKey) {
        setTransition('slide-down');
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const jumpToCategory = (key: string) => {
    const pageIndex = categoryPageMap[key];
    if (pageIndex !== undefined) {
        const targetPage = pages[pageIndex];
        const currentKey = activePage.categoryKey;
        const targetCatIndex = categoryKeys.indexOf(targetPage.categoryKey);
        const currentCatIndex = categoryKeys.indexOf(currentKey);
        
        setTransition(targetCatIndex > currentCatIndex ? 'flip-next' : 'flip-prev');
        setCurrentPage(pageIndex);
        setIsMenuOpen(false);
    }
  };

  // Touch / Swipe Logic
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);

    if (absDiffX > absDiffY) {
      if (absDiffX > 50) {
        if (diffX > 0) goToNextCategory();
        else goToPrevCategory();
      }
    } else {
      if (absDiffY > 50) {
        if (diffY > 0) goToNextPageInCat();
        else goToPrevPageInCat();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAdminMode || isSearchOpen || isMenuOpen || isCartOpen || isInfoOpen || isServiceOpen || selectedDish || isLoading) return; 
      if (e.key === 'ArrowRight') goToNextCategory();
      if (e.key === 'ArrowLeft') goToPrevCategory();
      if (e.key === 'ArrowDown') goToNextPageInCat();
      if (e.key === 'ArrowUp') goToPrevPageInCat();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isSearchOpen, isMenuOpen, isCartOpen, isInfoOpen, isServiceOpen, activePage, selectedDish, isLoading, isAdminMode]);

  // --- Render Page Types ---

  const renderCover = () => (
    <div className="h-full flex flex-col items-center justify-center p-6 border-4 border-double border-gold/40 outline outline-2 outline-offset-4 outline-gold/20 relative bg-paper bg-texture shadow-[inset_20px_0_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-5"></div>
      
      <div className="w-24 h-24 border-2 border-gold rounded-sm flex items-center justify-center rotate-45 mb-12 shadow-lg bg-paper">
        <div className="w-16 h-16 bg-cinnabar -rotate-45 flex items-center justify-center text-white font-bold text-4xl shadow-inner">
          食
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-[0.1em] text-ink font-serif mb-4 text-center leading-relaxed">
        江西大酒店<br/>四楼会所
      </h1>
      <div className="h-px w-20 bg-gold my-6"></div>
      <p className="text-gold font-serif tracking-widest text-lg uppercase mb-12 text-center">Jinjiang Star Hotel</p>
      <div className="text-center text-sm text-gold font-bold border-2 border-gold/30 px-6 py-2 rounded-sm shadow-sm bg-paper/50 backdrop-blur-sm">
        <span className="text-xs text-stone-400 block mb-1 font-sans">当前位置 Location</span>
        <span className="text-cinnabar">{locationLabel}</span>
      </div>

      <div className="mt-auto mb-12 text-center animate-pulse space-y-2">
        <div>
            <p className="text-stone-400 text-sm tracking-widest">← 左右滑动切换分类 →</p>
            <p className="text-[10px] text-stone-300 uppercase">Swipe Horizontal for Categories</p>
        </div>
      </div>
    </div>
  );

  const renderContent = (page: PageData) => (
    <div className="h-full flex flex-col p-2 md:p-6 bg-paper bg-texture relative shadow-inner">
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-stone-400/20 to-transparent pointer-events-none z-10"></div>

      <SectionHeader 
        zh={page.categoryTitleZh || ''} 
        en={page.categoryTitleEn || ''} 
        pageIndex={page.categoryIndex}
        totalPages={page.totalPages}
      />

      <div className="flex-1 grid grid-cols-2 gap-3 content-start pl-2">
        {page.items?.map((item) => (
          <DishCard 
            key={item.id} 
            item={item} 
            quantity={cart[item.id] || 0}
            onAdd={addToCart}
            onRemove={removeFromCart}
            onClick={handleDishClick}
          />
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-stone-100 flex justify-between items-end pl-4">
        <span className="text-[10px] text-stone-300 italic">江西大酒店四楼会所</span>
        <span className="font-serif text-stone-400 text-sm">- {page.pageNumber} -</span>
      </div>
    </div>
  );

  const renderBack = () => {
    const mapUrl = "https://www.google.com/maps/search/?api=1&query=Jinjiang+Star+Hotel+Jiangxi+Grand+Hotel";
    return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-paper bg-texture relative border-4 border-stone-200 border-double shadow-[inset_20px_0_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div>
      
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-ink mb-4">联系我们 Contact Us</h3>
          <div className="flex flex-col items-center gap-3 text-stone-600">
             <a href="tel:+639552461263" className="flex items-center gap-2 hover:text-gold transition-colors cursor-pointer">
                <PhoneIcon />
                <span className="tracking-widest font-mono">0955 246 1263</span>
             </a>
             <a href="https://t.me/jx555999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold transition-colors cursor-pointer">
                <TelegramIcon />
                <span className="tracking-widest font-mono">@jx555999</span>
             </a>
             <a 
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-center hover:text-gold transition-colors cursor-pointer flex-col"
             >
                <div className="flex items-center gap-2">
                   <MapPinIcon />
                   <span className="text-sm font-bold">江西大酒店四楼会所</span>
                </div>
                <span className="text-xs text-stone-500">Metro Manila, Philippines</span>
             </a>
          </div>
        </div>

        <div className="w-32 h-32 bg-white p-2 mx-auto shadow-lg transform rotate-3">
            <img src="https://picsum.photos/seed/qrcode/200/200" className="w-full h-full grayscale contrast-125" alt="QR" />
        </div>
        
        <p className="text-xs text-stone-400">扫码获取优惠 Scan for promotions</p>
      </div>
      
      <div className="mt-auto pt-8 text-[10px] text-stone-300 text-center w-full border-t border-stone-100">
        © 2024 Jinjiang Star Hotel. All rights reserved.
      </div>
    </div>
  )};

  const getAnimationClass = () => {
    switch (transition) {
      case 'flip-next': return 'animate-flip-next';
      case 'flip-prev': return 'animate-flip-prev';
      case 'slide-up': return 'animate-slide-up';
      case 'slide-down': return 'animate-slide-down';
      default: return 'animate-fade-in';
    }
  };

  const is3DTransition = transition === 'flip-next' || transition === 'flip-prev';

  // --- Admin Mode Render ---
  if (isAdminMode) {
    return <AdminQRCodeGenerator />;
  }

  // Loading & Error Screens
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-wood bg-wood-pattern text-gold z-50">
        <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4"></div>
        <p className="tracking-widest font-serif">Loading Menu...</p>
        <p className="text-xs text-stone-500 mt-2">正在加载菜单</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-wood bg-wood-pattern text-stone-400 z-50 p-6 text-center">
        <div className="w-16 h-16 border-4 border-stone-600 rounded-full flex items-center justify-center mb-4 text-stone-600">
            !
        </div>
        <h2 className="text-lg text-stone-300 mb-2">加载失败 Failed to Load</h2>
        <p className="text-xs mb-6">{error}</p>
        <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-gold text-wood px-6 py-2 rounded-sm font-bold hover:bg-white transition-colors"
        >
            <RefreshIcon /> 重试 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col relative">
      
      <div 
        className="flex-1 relative w-full perspective-1500 overflow-hidden shadow-2xl mt-4 mb-0 md:my-8 rounded-t-sm bg-wood"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
            key={currentPage}
            className={`w-full h-full bg-paper absolute inset-0 ${is3DTransition ? 'origin-left backface-hidden preserve-3d' : ''} ${getAnimationClass()}`}
        >
           {activePage.type === 'cover' && renderCover()}
           {activePage.type === 'content' && renderContent(activePage)}
           {activePage.type === 'back' && renderBack()}
        </div>

        <div className="absolute inset-y-0 left-0 w-8 z-20 cursor-pointer" onClick={goToPrevCategory}></div>
        <div className="absolute inset-y-0 right-0 w-8 z-20 cursor-pointer" onClick={goToNextCategory}></div>
      </div>

      <div className="hidden md:flex h-12 items-center justify-between px-6 text-stone-light/50 bg-wood">
        <button 
          onClick={goToPrevCategory}
          className="p-2 rounded-full border border-current hover:bg-stone-800 hover:text-white transition-all"
          title="Previous Category"
        >
          <ChevronLeft />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-xs tracking-widest text-gold">{activePage.categoryTitleZh || '首页 Home'}</span>
        </div>
        <button 
          onClick={goToNextCategory}
          className="p-2 rounded-full border border-current hover:bg-stone-800 hover:text-white transition-all"
          title="Next Category"
        >
          <ChevronRight />
        </button>
      </div>

      <BottomBar 
        cartCount={cartCount}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenService={() => setIsServiceOpen(true)}
      />

      <CategoryNav 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        categories={menuData} 
        onSelectCategory={jumpToCategory}
      />

      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        itemsMap={itemsMap}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onClear={clearCart}
        tableId={tableId}
        locationLabel={locationLabel}
      />

      <SearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        menuData={menuData}
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onItemClick={handleDishClick}
      />

      <InfoModal 
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        onOpen={() => {}}
        tableId={tableId}
        locationLabel={locationLabel}
      />

      <DishDetailModal 
        item={selectedDish}
        quantity={selectedDish ? (cart[selectedDish.id] || 0) : 0}
        onClose={() => setSelectedDish(null)}
        onAdd={addToCart}
        onRemove={removeFromCart}
      />

      <ServiceModal
        isOpen={isServiceOpen}
        onClose={() => setIsServiceOpen(false)}
        tableId={tableId}
        locationLabel={locationLabel}
      />

    </div>
  );
};

export default App;