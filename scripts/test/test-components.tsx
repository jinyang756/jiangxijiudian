// 测试各个组件的简单页面
import React, { useState, useEffect } from 'react';
import BottomBar from '../../components/BottomBar';
import SearchOverlay from '../../components/SearchOverlay';
import ServiceModal from '../../components/ServiceModal';
import InfoModal from '../../components/InfoModal';
import CartModal from '../../components/CartModal';
import CategoryNav from '../../components/CategoryNav';
import { MenuCategory, MenuItem } from '../../src/types/types';

const TestComponents: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);

  // 模拟菜单数据
  useEffect(() => {
    const mockMenuData: MenuCategory[] = [
      {
        key: 'jiangnan',
        titleZh: '江南小炒',
        titleEn: 'Jiangnan Stir-Fries',
        items: [
          { id: 'J1', zh: '宫保鸡丁', en: 'Kung Pao Chicken', price: 38, available: true },
          { id: 'J2', zh: '鱼香肉丝', en: 'Fish-Flavored Shredded Pork', price: 32, available: true },
        ]
      },
      {
        key: 'soup',
        titleZh: '汤类',
        titleEn: 'Soups',
        items: [
          { id: 'S1', zh: '酸辣汤', en: 'Hot and Sour Soup', price: 18, available: true },
          { id: 'S2', zh: '西红柿蛋汤', en: 'Tomato and Egg Soup', price: 16, available: true },
        ]
      }
    ];
    setMenuData(mockMenuData);
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id] -= 1;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };

  const itemsMap = new Map<string, MenuItem>();
  menuData.forEach(cat => {
    cat.items.forEach(item => itemsMap.set(item.id, item));
  });

  return (
    <div className="w-full h-screen bg-wood bg-wood-pattern flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gold mb-4 text-center">组件测试页面</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setActiveModal('search')}
            className="bg-gold text-wood py-3 px-4 rounded font-bold hover:bg-cinnabar transition-colors"
          >
            测试搜索功能
          </button>
          <button 
            onClick={() => setActiveModal('service')}
            className="bg-gold text-wood py-3 px-4 rounded font-bold hover:bg-cinnabar transition-colors"
          >
            测试服务功能
          </button>
          <button 
            onClick={() => setActiveModal('info')}
            className="bg-gold text-wood py-3 px-4 rounded font-bold hover:bg-cinnabar transition-colors"
          >
            测试关于功能
          </button>
          <button 
            onClick={() => setActiveModal('cart')}
            className="bg-gold text-wood py-3 px-4 rounded font-bold hover:bg-cinnabar transition-colors"
          >
            测试订单功能
          </button>
          <button 
            onClick={() => setActiveModal('menu')}
            className="bg-gold text-wood py-3 px-4 rounded font-bold hover:bg-cinnabar transition-colors col-span-2"
          >
            测试菜单导航
          </button>
        </div>

        <div className="bg-white/10 p-4 rounded">
          <h2 className="text-lg font-bold text-gold mb-2">当前购物车</h2>
          <p className="text-stone-300">商品数量: {Object.keys(cart).length}</p>
          <p className="text-stone-300">总数量: {Object.values(cart).reduce((a, b) => a + b, 0)}</p>
        </div>
      </div>

      <BottomBar 
        cartCount={Object.values(cart).reduce((a, b) => a + b, 0)}
        onOpenMenu={() => setActiveModal('menu')}
        onOpenSearch={() => setActiveModal('search')}
        onOpenCart={() => setActiveModal('cart')}
        onOpenInfo={() => setActiveModal('info')}
        onOpenService={() => setActiveModal('service')}
      />

      <SearchOverlay 
        isOpen={activeModal === 'search'}
        onClose={() => setActiveModal(null)}
        menuData={menuData}
        cart={cart}
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onItemClick={() => {}}
      />

      <ServiceModal
        isOpen={activeModal === 'service'}
        onClose={() => setActiveModal(null)}
        tableId="T-1"
        locationLabel="桌号 Table 1"
      />

      <InfoModal 
        isOpen={activeModal === 'info'}
        onClose={() => setActiveModal(null)}
        onOpen={() => {}}
        tableId="T-1"
        locationLabel="桌号 Table 1"
      />

      <CartModal 
        isOpen={activeModal === 'cart'}
        onClose={() => setActiveModal(null)}
        cart={cart}
        itemsMap={itemsMap}
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={() => {}}
        onClear={() => setCart({})}
        tableId="T-1"
        locationLabel="桌号 Table 1"
      />

      <CategoryNav 
        isOpen={activeModal === 'menu'}
        onClose={() => setActiveModal(null)}
        categories={menuData}
        onSelectCategory={() => {}}
      />
    </div>
  );
};

export default TestComponents;