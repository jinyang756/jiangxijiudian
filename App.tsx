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
import ErrorBoundary from './src/components/ErrorBoundary';
import { api } from './services/api';
import { ImageLoader } from './src/lib/imageLoader';
import TestSuite from './src/components/TestSuite';
import TestComponents from './test-components';
import FeaturePage from './components/FeaturePage';

// Types for our Page system
type PageType = 'cover' | 'content' | 'back' | 'search' | 'service' | 'about' | 'order';

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

// 添加底部导航栏图标
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const InformationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
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

// 添加安全的 sessionStorage 操作函数
const safeSessionStorageSet = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn('无法访问 sessionStorage:', e);
  }
};

const safeSessionStorageGet = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.warn('无法访问 sessionStorage:', e);
    return null;
  }
};

const AppContent: React.FC = () => {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItems>({});


  const [tableId, setTableId] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [transition, setTransition] = useState<TransitionType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);


  // 购物车操作函数
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => ({
      ...prevCart,
      [item.id]: (prevCart[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (item: MenuItem) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[item.id] > 1) {
        newCart[item.id] -= 1;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const updateCartQuantity = (item: MenuItem, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(item);
    } else {
      setCart(prevCart => ({
        ...prevCart,
        [item.id]: quantity
      }));
    }
  };

  // 添加获取数据函数
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.getMenu();
      console.log('获取菜单数据响应:', response); // 添加调试日志
      if (response.code === 200) {
        console.log('设置菜单数据:', response.data); // 添加调试日志
        setMenuData(response.data || []);
        setMenu(response.data || []);
      } else {
        setError('加载菜单失败');
      }
    } catch (err) {
      setError('加载菜单时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化应用
  useEffect(() => {
    console.log('初始化应用，开始加载菜单数据'); // 添加调试日志
    loadMenu();
  }, []);

  // 加载菜单数据
  const loadMenu = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMenu();
      console.log('菜单数据响应:', response); // 添加调试日志
      
      if (response.code === 200) {
        console.log('菜单数据:', response.data); // 添加调试日志
        setMenu(response.data || []);
        setMenuData(response.data || []);
        
        // 预加载菜单图片
        if (response.data && response.data.length > 0) {
          ImageLoader.preloadMenuImages(response.data)
            .then(() => console.log('菜单图片预加载完成'))
            .catch(err => console.warn('图片预加载失败:', err));
        }
      } else {
        setError('加载菜单失败');
      }
    } catch (err) {
      setError('加载菜单时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Location / Table Persistence Logic ---
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

  // Derived State: Total Cart Count
  const cartCount = useMemo(() => Object.values(cart).reduce((a: number, b: number) => a + b, 0), [cart]);

  // Derived State: Map for quick item lookup
  const itemsMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    menu.forEach(cat => {
        cat.items.forEach(item => map.set(item.id, item));
    });
    return map;
  }, [menu]);

  // Actions
  const handleDishClick = (item: MenuItem) => {
    setSelectedDish(item);
  };

  // Generate Pages & Category Mapping
  const { pages, categoryPageMap, categoryKeys } = useMemo(() => {
    console.log('生成页面，menu长度:', menu.length);
    console.log('menu数据:', menu);
    
    const generatedPages: PageData[] = [];
    const catMap: {[key: string]: number} = {};
    const keys: string[] = ['cover'];
    
    // 1. Cover Page
    generatedPages.push({ type: 'cover', id: 'cover', categoryKey: 'cover' });
    catMap['cover'] = 0;
    
    // 2. 功能页面
    generatedPages.push({ type: 'search', id: 'search', categoryKey: 'search' });
    catMap['search'] = generatedPages.length - 1;
    keys.push('search');
    
    generatedPages.push({ type: 'service', id: 'service', categoryKey: 'service' });
    catMap['service'] = generatedPages.length - 1;
    keys.push('service');
    
    generatedPages.push({ type: 'about', id: 'about', categoryKey: 'about' });
    catMap['about'] = generatedPages.length - 1;
    keys.push('about');
    
    generatedPages.push({ type: 'order', id: 'order', categoryKey: 'order' });
    catMap['order'] = generatedPages.length - 1;
    keys.push('order');
    
    // 3. Content Pages
    if (menu && menu.length > 0) {
      console.log('开始生成内容页面');
      let globalPageCount = 1;
      menu.forEach((category, index) => {
        console.log('处理分类:', category);
        // 确保每个分类都有唯一的key
        const categoryKey = category.key || `category-${index}`;
        keys.push(categoryKey);
        catMap[categoryKey] = generatedPages.length;
        
        const items = category.items || [];
        const totalCatPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        console.log(`分类 ${category.titleZh} 有 ${items.length} 个菜品，需要 ${totalCatPages} 页`);
        
        // 即使分类没有菜品也要生成页面
        if (totalCatPages === 0) {
          generatedPages.push({
            type: 'content',
            id: `${categoryKey}-0`,
            categoryKey: categoryKey,
            items: [],
            categoryTitleZh: category.titleZh,
            categoryTitleEn: category.titleEn,
            pageNumber: globalPageCount++,
            totalPages: 1,
            categoryIndex: 1
          });
        } else {
          for (let i = 0; i < totalCatPages; i++) {
            const start = i * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const pageItems = items.slice(start, end);
            console.log(`页面 ${i+1} 有 ${pageItems.length} 个菜品`);
            
            generatedPages.push({
              type: 'content',
              id: `${categoryKey}-${i}`,
              categoryKey: categoryKey,
              items: pageItems,
              categoryTitleZh: category.titleZh,
              categoryTitleEn: category.titleEn,
              pageNumber: globalPageCount++,
              totalPages: totalCatPages,
              categoryIndex: i + 1
            });
          }
        }
      });
    }
    
    // 4. Back Cover
    keys.push('back');
    catMap['back'] = generatedPages.length;
    generatedPages.push({ type: 'back', id: 'back', categoryKey: 'back' });
    
    console.log('生成的页面:', generatedPages);
    console.log('分类映射:', catMap);
    console.log('分类键:', keys);
    
    return { pages: generatedPages, categoryPageMap: catMap, categoryKeys: keys };
  }, [menu]);

  const totalPages = pages.length;
  const activePage = pages[currentPage] || pages[0];
  
  // 添加调试信息
  console.log('页面信息:', {
    currentPage,
    totalPages,
    activePage: activePage ? {
      type: activePage.type,
      categoryKey: activePage.categoryKey,
      categoryTitleZh: activePage.categoryTitleZh
    } : null,
    pagesLength: pages.length,
    menuLength: menu.length
  });

  // 检查是否有页面数据
  if (pages.length === 0) {
    console.warn('没有生成任何页面!');
  }

  if (activePage) {
    console.log('当前页面详情:', activePage);
  } else {
    console.warn('没有当前页面!');
  }

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

  // 跳转到特定功能页面
  const goToFeaturePage = (pageType: 'search' | 'service' | 'about' | 'order') => {
    const pageIndex = categoryPageMap[pageType];
    if (pageIndex !== undefined) {
      setTransition('flip-next');
      setCurrentPage(pageIndex);
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
      if (isSearchOpen || isMenuOpen || isCartOpen || isInfoOpen || isServiceOpen || selectedDish || isLoading) return; 
      if (e.key === 'ArrowRight') goToNextCategory();
      if (e.key === 'ArrowLeft') goToPrevCategory();
      if (e.key === 'ArrowDown') goToNextPageInCat();
      if (e.key === 'ArrowUp') goToPrevPageInCat();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isSearchOpen, isMenuOpen, isCartOpen, isInfoOpen, isServiceOpen, activePage, selectedDish, isLoading]);

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

  // 渲染搜索页面
  const renderSearch = () => {
    return (
      <FeaturePage 
        title="搜索菜品" 
        titleEn="Search Dishes" 
        onBack={goToPrevCategory}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-4">
            <SearchIcon />
          </div>
          <p className="text-stone-500 text-center">请输入菜名或拼音进行搜索</p>
          <p className="text-xs text-stone-400 mt-1 text-center">Please enter dish name or pinyin</p>
        </div>
      </FeaturePage>
    );
  };

  // 渲染服务页面
  const renderService = () => {
    return (
      <FeaturePage 
        title="呼叫服务" 
        titleEn="Call Service" 
        onBack={goToPrevCategory}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-4">
            <BellIcon />
          </div>
          <p className="text-stone-500 text-center">点击右下角按钮呼叫服务</p>
          <p className="text-xs text-stone-400 mt-1 text-center">Click the button in the bottom right to call service</p>
        </div>
      </FeaturePage>
    );
  };

  // 渲染关于页面
  const renderAbout = () => {
    return (
      <FeaturePage 
        title="关于我们" 
        titleEn="About Us" 
        onBack={goToPrevCategory}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-4">
            <InformationIcon />
          </div>
          <p className="text-stone-500 text-center">江西大酒店四楼会所</p>
          <p className="text-xs text-stone-400 mt-1 text-center">Jinjiang Star Hotel 4th Floor</p>
        </div>
      </FeaturePage>
    );
  };

  // 渲染订单页面
  const renderOrder = () => {
    return (
      <FeaturePage 
        title="我的订单" 
        titleEn="My Order" 
        onBack={goToPrevCategory}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-4">
            <ShoppingBagIcon />
          </div>
          <p className="text-stone-500 text-center">购物车为空</p>
          <p className="text-xs text-stone-400 mt-1 text-center">Your cart is empty</p>
        </div>
      </FeaturePage>
    );
  };

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

  // 获取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminMode = urlParams.get('mode') === 'admin';
  const isTestMode = urlParams.get('mode') === 'test';
  const isDebugMode = urlParams.get('mode') === 'debug';
  const isComponentTestMode = urlParams.get('mode') === 'components';

  // --- Component Test Mode Render ---
  if (isComponentTestMode) {
    return (
      <div className="w-full h-screen">
        <TestComponents />
      </div>
    );
  }

  // --- Debug Mode Render ---
  if (isDebugMode) {
    return (
      <div className="w-full h-screen bg-gray-100 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">调试模式</h1>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">环境变量检查:</h2>
          <p>Supabase URL: {import.meta.env.VITE_APP_DB_URL ? '已设置' : '未设置'}</p>
          <p>Supabase Key: {import.meta.env.VITE_APP_DB_POSTGRES_PASSWORD ? '已设置' : '未设置'}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">菜单数据:</h2>
          <p>菜单分类数量: {menu.length}</p>
          <p>菜单数据状态: {menu.length > 0 ? '已加载' : '未加载'}</p>
          {menu.length > 0 && (
            <div className="mt-2">
              <h3 className="font-medium">分类详情:</h3>
              <ul className="list-disc pl-5">
                {menu.map((category, index) => (
                  <li key={index}>
                    {category.titleZh} ({category.titleEn}) - {category.items?.length || 0} 个菜品
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">页面信息:</h2>
          <p>总页面数: {pages.length}</p>
          <p>当前页面索引: {currentPage}</p>
          <p>当前页面类型: {activePage?.type || '无'}</p>
          {activePage && (
            <div className="mt-2">
              <h3 className="font-medium">当前页面详情:</h3>
              <p>分类: {activePage.categoryTitleZh || 'N/A'}</p>
              <p>分类键: {activePage.categoryKey}</p>
              <p>菜品数量: {activePage.items?.length || 0}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadMenu}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            重新加载菜单数据
          </button>
          <button 
            onClick={() => console.log('菜单数据:', menu)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            在控制台打印菜单数据
          </button>
        </div>
      </div>
    );
  }

  // --- Admin Mode Render ---
  if (isAdminMode) {
    return <AdminQRCodeGenerator />;
  }
  
  // --- Test Mode Render ---
  if (isTestMode) {
    return (
      <div className="w-full h-screen bg-gray-100 p-4">
        <TestSuite />
      </div>
    );
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
      
      {/* 添加调试信息 */}
      {import.meta.env.DEV && (
        <div className="bg-red-500 text-white p-2 text-xs z-50">
          Debug: Pages: {pages.length}, Current: {currentPage}, Type: {activePage?.type}
        </div>
      )}
      
      <div 
        className="flex-1 relative w-full perspective-1500 overflow-hidden shadow-2xl mt-4 mb-0 md:my-8 rounded-t-sm bg-wood"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
            key={currentPage}
            className={`w-full h-full bg-paper absolute inset-0 ${is3DTransition ? 'origin-left backface-hidden preserve-3d' : ''} ${getAnimationClass()}`}
        >
           {/* 修复页面渲染逻辑，确保所有类型的页面都能正确显示 */}
           {activePage && (() => {
             switch (activePage.type) {
               case 'cover':
                 return renderCover();
               case 'search':
                 return renderSearch();
               case 'service':
                 return renderService();
               case 'about':
                 return renderAbout();
               case 'order':
                 return renderOrder();
               case 'content':
                 return renderContent(activePage);
               case 'back':
                 return renderBack();
               default:
                 return (
                   <div className="h-full flex items-center justify-center p-4">
                     <div className="text-center">
                       <p className="text-lg font-bold mb-2 text-ink">页面类型未识别</p>
                       <p className="text-stone-500">Page type not recognized: {activePage.type}</p>
                     </div>
                   </div>
                 );
             }
           })()}
           
           {/* 如果没有活动页面或处于加载状态，显示加载指示器 */}
           {(!activePage || isLoading) && (
             <div className="h-full flex items-center justify-center p-4">
               <div className="text-center">
                 <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4 mx-auto"></div>
                 <p className="text-lg font-bold mb-2 text-ink">加载中...</p>
                 <p className="text-stone-500">请稍候</p>
               </div>
             </div>
           )}
        </div>

        <div className="absolute inset-y-0 left-0 w-8 z-20 cursor-pointer" onClick={goToPrevCategory}></div>
        <div className="absolute inset-y-0 right-0 w-8 z-20 cursor-pointer" onClick={goToNextCategory}></div>
      </div>

      {/* 移动端导航按钮 - 在小屏幕上显示 */}
      <div className="flex md:hidden h-12 items-center justify-between px-4 text-stone-light/50 bg-wood border-t border-stone-800">
        <button 
          onClick={goToPrevCategory}
          className="p-2 rounded-full border border-current hover:bg-stone-800 hover:text-white transition-all"
          title="Previous Category"
        >
          <ChevronLeft />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-xs tracking-widest text-gold truncate max-w-[120px]">{activePage.categoryTitleZh || '首页 Home'}</span>
        </div>
        <button 
          onClick={goToNextCategory}
          className="p-2 rounded-full border border-current hover:bg-stone-800 hover:text-white transition-all"
          title="Next Category"
        >
          <ChevronRight />
        </button>
      </div>

      {/* 桌面端导航按钮 - 仅在中等及以上屏幕上显示 */}
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
        onOpenSearch={() => goToFeaturePage('search')}
        onOpenCart={() => goToFeaturePage('order')}
        onOpenInfo={() => goToFeaturePage('about')}
        onOpenService={() => goToFeaturePage('service')}
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;