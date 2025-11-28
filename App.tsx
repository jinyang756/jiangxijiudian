﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿// App.tsx
// 江西酒店智能菜单系统 - 前端展示页面与后台管理面板

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem, CartItems, MenuCategory } from './src/types/types';
import DishCard from './components/DishCard';
import BottomBar from './components/BottomBar';
import CategoryNav from './components/CategoryNav';
import SearchOverlay from './components/SearchOverlay';
import CartModal from './components/CartModal';
import InfoModal from './components/InfoModal';
import DishDetailModal from './components/DishDetailModal';
import ServiceModal from './components/ServiceModal';
import SectionHeader from './components/SectionHeader';
import { api } from './services/api';
import { ImageLoader } from './src/lib/imageLoader';

// Types for our Page system
type PageType = 'cover' | 'content' | 'back' | 'search' | 'service' | 'about' | 'order' | 'admin';

interface PageData {
  type: PageType;
  id: string;
  categoryKey: string;
  items?: MenuItem[];
  categoryTitleZh?: string;
  categoryTitleEn?: string;
  pageNumber?: number;
}

// 应用主组件
const App: React.FC = () => {
  // 状态管理
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItems>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showService, setShowService] = useState(false);
  const [showDishDetail, setShowDishDetail] = useState(false);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminView, setAdminView] = useState<'dashboard' | 'menu' | 'orders' | 'settings'>('dashboard');
  const [showCategoryNav, setShowCategoryNav] = useState(false);
  const [dbOperations] = useState({
    createView: false,
    updatePolicies: false,
    syncData: false
  });
  const [operationResult, setOperationResult] = useState<string>('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // 引用
  const menuRef = useRef<HTMLDivElement>(null);

  // 计算属性
  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  }, [cart]);

  // 切换调试信息显示
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  // 获取当前页面数据
  const activePage = pages[currentPage];

  // 添加到购物车
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => ({
      ...prevCart,
      [item.id]: (prevCart[item.id] || 0) + 1
    }));
  };

  // 从购物车移除
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

  // 清空购物车
  const clearCart = () => {
    setCart({});
  };

  // 更新购物车数量
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
      if (response.code === 200) {
        setMenu(response.data || []);
      } else {
        setError('加载菜单失败');
      }
    } catch (err) {
      setError('加载菜单时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化应用
  useEffect(() => {
    loadMenu();
  }, []);

  // 监听菜单变化，重新生成页面
  useEffect(() => {
    if (menu.length > 0) {
      generatePages(menu);
    }
  }, [menu]);

  // 加载菜单数据
  const loadMenu = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMenu();
      
      if (response.code === 200) {
        setMenu(response.data || []);
        
        // 预加载菜单图片
        response.data?.forEach(category => {
          category.items.forEach(item => {
            if (item.imageUrl) {
              ImageLoader.preloadImage(item.imageUrl);
            }
          });
        });
        
        // 生成页面数据
        generatePages(response.data || []);
      } else {
        setError('加载菜单失败');
      }
    } catch (err) {
      setError('加载菜单时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 生成页面数据
  const generatePages = (menuData: MenuCategory[]) => {
    const newPages: PageData[] = [];
    
    // 封面页
    newPages.push({
      type: 'cover',
      id: 'cover',
      categoryKey: 'cover'
    });
    
    // 内容页
    menuData.forEach(category => {
      // 每个分类作为一页
      newPages.push({
        type: 'content',
        id: category.key,
        categoryKey: category.key,
        categoryTitleZh: category.titleZh,
        categoryTitleEn: category.titleEn
      });
      
      // 如果分类下的菜品很多，可以分页显示
      if (category.items.length > 8) {
        const itemsPerPage = 8;
        const totalPages = Math.ceil(category.items.length / itemsPerPage);
        
        for (let i = 0; i < totalPages; i++) {
          const start = i * itemsPerPage;
          const end = start + itemsPerPage;
          const pageItems = category.items.slice(start, end);
          
          newPages.push({
            type: 'content',
            id: `${category.key}-page-${i+1}`,
            categoryKey: category.key,
            items: pageItems,
            categoryTitleZh: category.titleZh,
            categoryTitleEn: category.titleEn,
            pageNumber: i+1
          });
        }
      }
    });
    
    // 关于页
    newPages.push({
      type: 'about',
      id: 'about',
      categoryKey: 'about'
    });
    
    console.log('Generated pages:', newPages);
    setPages(newPages);
  };

  // 页面导航
  const goToPage = (index: number) => {
    setCurrentPage(Math.max(0, Math.min(index, pages.length - 1)));
    if (menuRef.current) {
      menuRef.current.scrollTop = 0;
    }
  };

  // 添加一个函数来导航到首页
  // const goToHomePage = () => {
  //   goToPage(0);
  // };

  // 添加一个函数来导航到管理界面
  const goToAdminPage = () => {
    // 检查是否已经有管理页面，如果没有则添加一个
    const adminPageIndex = pages.findIndex(page => page.type === 'admin');
    if (adminPageIndex === -1) {
      // 添加管理页面到页面数组
      const newPages: PageData[] = [...pages, {
        type: 'admin',
        id: 'admin',
        categoryKey: 'admin'
      }];
      setPages(newPages);
      goToPage(newPages.length - 1);
    } else {
      goToPage(adminPageIndex);
    }
  };

  // 显示菜品详情
  const showDishDetails = (dish: MenuItem) => {
    setSelectedDish(dish);
    setShowDishDetail(true);
  };

  // 提交订单
  // 注意：此函数未被使用，因为CartModal组件直接调用API
  /*const submitOrder = async () => {
    if (cartCount === 0) return;
    
    try {
      // 转换购物车数据格式
      const itemsPayload = Object.entries(cart).map(([dishId, quantity]) => ({
        dishId,
        quantity
      }));
      
      const response = await api.submitOrder({
        tableId: 'TABLE_1', // 在实际应用中，这应该从某个地方获取
        items: itemsPayload,
        totalAmount: cartTotal
      });
      
      if (response.code === 200) {
        clearCart();
        alert('订单提交成功！');
      } else {
        alert('订单提交失败，请重试');
      }
    } catch (err) {
      alert('订单提交失败，请重试');
    }
  };*/

  // 呼叫服务
  // 注意：此函数未被使用，因为ServiceModal组件直接调用API
  /*const callService = async (serviceType: string, details?: string) => {
    try {
      const serviceTypes: Record<string, { type: string; typeName: string }> = {
        'water': { type: 'water', typeName: '加水' },
        'napkin': { type: 'napkin', typeName: '纸巾' },
        'bill': { type: 'bill', typeName: '结账' },
        'other': { type: 'other', typeName: '其他' }
      };
      
      const serviceInfo = serviceTypes[serviceType] || serviceTypes['other'];
      
      const response = await api.callService({
        tableId: 'TABLE_1', // 在实际应用中，这应该从某个地方获取
        type: serviceInfo.type,
        typeName: serviceInfo.typeName,
        details: details || ''
      });
      
      if (response.code === 200) {
        alert('服务请求已提交！');
      } else {
        alert('服务请求失败，请重试');
      }
    } catch (err) {
      alert('服务请求失败，请重试');
    }
  };*/

  // 管理员登录
  const handleAdminLogin = () => {
    // 简单的密码验证（在实际应用中应该使用更安全的方法）
    if (adminPassword === 'admin123') { // 简单的默认密码
      setIsAuthenticated(true);
    } else {
      alert('密码错误');
    }
  };

  // 管理员登出
  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
    setAdminView('dashboard');
  };

  // 执行数据库操作
  const executeDbOperation = async (operation: keyof typeof dbOperations) => {
    setOperationResult('执行中...');
    
    try {
      switch (operation) {
        case 'createView':
          // 这里应该通过某种方式执行 SQL 脚本
          // 由于我们无法直接从客户端执行 DDL，我们会在 UI 中显示 SQL 脚本
          setOperationResult('请在 Supabase 控制台中执行以下 SQL:\n\n' + 
            'DROP VIEW IF EXISTS menu_view;\n\n' +
            'CREATE OR REPLACE VIEW menu_view AS\n' +
            'SELECT \n' +
            '    c.id as category_id,\n' +
            '    c.name as category_name,\n' +
            '    json_agg(\n' +
            '        json_build_object(\n' +
            "            'id', d.id,\n" +
            "            'dish_id', d.dish_id,\n" +
            "            'name_zh', d.name_zh,\n" +
            "            'name_en', d.name_en,\n" +
            "            'price', d.price,\n" +
            "            'is_spicy', d.is_spicy,\n" +
            "            'is_vegetarian', d.is_vegetarian,\n" +
            "            'available', d.available\n" +
            '        ) ORDER BY d.name_zh\n' +
            '    ) FILTER (WHERE d.id IS NOT NULL) as items\n' +
            'FROM categories c\n' +
            'LEFT JOIN dishes d ON c.id = d.category_id\n' +
            'GROUP BY c.id, c.name\n' +
            'ORDER BY c.name;');
          break;
          
        case 'updatePolicies':
          // 显示更新策略的 SQL
          setOperationResult('请在 Supabase 控制台中执行以下 SQL:\n\n' +
            '-- 为 dishes 表添加插入策略\n' +
            'CREATE POLICY "public can insert dishes"\n' +
            'ON dishes\n' +
            'FOR INSERT TO anon\n' +
            'WITH CHECK (true);\n\n' +
            '-- 为 categories 表添加插入策略\n' +
            'CREATE POLICY "public can insert categories"\n' +
            'ON categories\n' +
            'FOR INSERT TO anon\n' +
            'WITH CHECK (true);\n\n' +
            '-- 为 orders 表添加插入策略\n' +
            'CREATE POLICY "public can insert orders"\n' +
            'ON orders\n' +
            'FOR INSERT TO anon\n' +
            'WITH CHECK (true);\n\n' +
            '-- 为 service_requests 表添加插入策略\n' +
            'CREATE POLICY "public can insert service_requests"\n' +
            'ON service_requests\n' +
            'FOR INSERT TO anon\n' +
            'WITH CHECK (true);');
          break;
          
        case 'syncData':
          // 触发数据同步
          await fetchData();
          setOperationResult('数据同步完成');
          break;
      }
    } catch (error) {
      setOperationResult(`操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 渲染当前页面
  const renderCurrentPage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-xl font-bold text-red-800 mb-2">加载失败</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadMenu}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    if (!activePage) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">页面不存在</p>
        </div>
      );
    }

    switch (activePage.type) {
      case 'cover':
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-white">酒</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">江西酒店</h1>
              <p className="text-xl text-gray-600">智能菜单系统</p>
            </div>
            <div className="text-gray-500 mb-8">
              <p className="mb-2">欢迎光临江西酒店</p>
              <p>请翻页浏览我们的精美菜单</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => goToPage(1)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                开始浏览
              </button>
              <button
                onClick={() => setShowInfo(true)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                餐厅信息
              </button>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="h-full flex flex-col">
            <SectionHeader 
              zh={activePage.categoryTitleZh || ''} 
              en={activePage.categoryTitleEn || ''} 
            />
            <div 
              ref={menuRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {(activePage.items || menu.find(c => c.key === activePage.categoryKey)?.items || [])
                .map((item: any) => (
                  <DishCard 
                    key={item.id} 
                    item={item}
                    quantity={cart[item.id] || 0}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                    onClick={() => showDishDetails(item)}
                  />
                ))
              }
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="h-full flex flex-col p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">关于我们</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">餐厅介绍</h2>
              <p className="text-gray-600 mb-4">
                江西酒店是一家专注于提供正宗江西菜的餐厅。我们致力于为顾客提供最地道的江西美食体验，
                所有菜品均采用传统工艺精心制作。
              </p>
              <p className="text-gray-600">
                我们的厨师团队拥有丰富的经验，精选优质食材，确保每一道菜都能让您感受到江西的独特风味。
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">联系方式</h2>
              <div className="space-y-2 text-gray-600">
                <p>地址：江西省南昌市某某路123号</p>
                <p>电话：0791-12345678</p>
                <p>营业时间：11:00 - 22:00</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">特色服务</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>免费WiFi</li>
                <li>包间预订</li>
                <li>外卖服务</li>
                <li>生日优惠</li>
              </ul>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-200">
              <p className="text-center text-gray-500 text-sm">
                © 2025 江西酒店. 保留所有权利.
              </p>
            </div>
          </div>
        );

      case 'admin':
        if (!isAuthenticated) {
          return (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">管理员登录</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      密码
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="请输入管理员密码"
                    />
                  </div>
                  <button
                    onClick={handleAdminLogin}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    登录
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="h-full flex flex-col">
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
              <h1 className="text-xl font-bold">管理面板</h1>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                登出
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* 侧边栏 */}
              <div className="w-64 bg-gray-100 p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setAdminView('dashboard')}
                    className={`w-full text-left px-4 py-2 rounded ${
                      adminView === 'dashboard' ? 'bg-red-600 text-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    仪表板
                  </button>
                  <button
                    onClick={() => setAdminView('menu')}
                    className={`w-full text-left px-4 py-2 rounded ${
                      adminView === 'menu' ? 'bg-red-600 text-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    菜单管理
                  </button>
                  <button
                    onClick={() => setAdminView('orders')}
                    className={`w-full text-left px-4 py-2 rounded ${
                      adminView === 'orders' ? 'bg-red-600 text-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    订单管理
                  </button>
                  <button
                    onClick={() => setAdminView('settings')}
                    className={`w-full text-left px-4 py-2 rounded ${
                      adminView === 'settings' ? 'bg-red-600 text-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    系统设置
                  </button>
                </nav>
              </div>
              
              {/* 主内容区 */}
              <div className="flex-1 overflow-y-auto p-6">
                {adminView === 'dashboard' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">仪表板</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">今日订单</h3>
                        <p className="text-3xl font-bold text-red-600">24</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">总销售额</h3>
                        <p className="text-3xl font-bold text-green-600">¥2,480</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">待处理服务</h3>
                        <p className="text-3xl font-bold text-blue-600">3</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow mb-8">
                      <h3 className="text-lg font-semibold mb-4">数据库操作</h3>
                      <div className="space-y-4">
                        <div>
                          <button
                            onClick={() => executeDbOperation('createView')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                          >
                            创建菜单视图
                          </button>
                          <span className="text-gray-600">创建 menu_view 视图以优化菜单查询</span>
                        </div>
                        
                        <div>
                          <button
                            onClick={() => executeDbOperation('updatePolicies')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                          >
                            更新安全策略
                          </button>
                          <span className="text-gray-600">更新行级安全策略以允许数据插入</span>
                        </div>
                        
                        <div>
                          <button
                            onClick={() => executeDbOperation('syncData')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                          >
                            同步数据
                          </button>
                          <span className="text-gray-600">从本地数据同步到数据库</span>
                        </div>
                        
                        {operationResult && (
                          <div className="mt-4 p-4 bg-gray-100 rounded">
                            <pre className="whitespace-pre-wrap text-sm">{operationResult}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4">系统信息</h3>
                      <div className="space-y-2">
                        <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '已设置' : '未设置'}</p>
                        <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '已设置' : '未设置'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {adminView === 'menu' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">菜单管理</h2>
                    <p>菜单管理功能正在开发中...</p>
                  </div>
                )}
                
                {adminView === 'orders' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">订单管理</h2>
                    <p>订单管理功能正在开发中...</p>
                  </div>
                )}
                
                {adminView === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">系统设置</h2>
                    <p>系统设置功能正在开发中...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">页面类型未实现</p>
          </div>
        );
    }
  };

  // 创建菜品映射表供购物车使用
  const itemsMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    menu.forEach(category => {
      category.items.forEach(item => {
        map.set(item.id, item);
      });
    });
    return map;
  }, [menu]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">江西酒店智能菜单</h1>
          <button
            onClick={toggleDebugInfo}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          >
            {showDebugInfo ? '隐藏调试信息' : '显示调试信息'}
          </button>
        </div>
      </header>

      {/* Debug Info Panel */}
      {showDebugInfo && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-yellow-400 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">调试信息</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    <p>环境: {import.meta.env.MODE || 'unknown'}</p>
                    <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '已设置' : '未设置'}</p>
                    <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '已设置' : '未设置'}</p>
                    <p>API Base URL: {import.meta.env.VITE_API_BASE_URL || '/api'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={goToAdminPage}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                管理界面
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentPage()}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomBar 
        cartCount={cartCount}
        onOpenMenu={() => setShowCategoryNav(true)}
        onOpenSearch={() => setShowSearch(true)}
        onOpenCart={() => setShowCart(true)}
        onOpenInfo={() => setShowInfo(true)}
        onOpenService={() => setShowService(true)}
      />

      {/* Category Navigation */}
      <CategoryNav
        isOpen={showCategoryNav}
        onClose={() => setShowCategoryNav(false)}
        categories={menu}
        onSelectCategory={(key: string) => {
          // Find the page index for this category
          const categoryPageIndex = pages.findIndex(page => page.categoryKey === key);
          if (categoryPageIndex !== -1) {
            goToPage(categoryPageIndex);
          }
          // 关闭分类导航
          setShowCategoryNav(false);
        }}
      />

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          isOpen={showCart}
          cart={cart}
          itemsMap={itemsMap}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onClear={clearCart}
          onClose={() => setShowCart(false)}
          tableId="TABLE_1"
          locationLabel="Table 1"
        />
      )}

      {/* Search Overlay */}
      {showSearch && (
        <SearchOverlay
          isOpen={showSearch}
          menuData={menu}
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Info Modal */}
      {showInfo && (
        <InfoModal 
          isOpen={showInfo} 
          onClose={() => setShowInfo(false)} 
          onOpen={function (): void {
            throw new Error('Function not implemented.');
          }} 
          tableId="TABLE_1" 
          locationLabel="Table 1" 
        />
      )}

      {/* Service Modal */}
      {showService && (
        <ServiceModal 
          isOpen={showService}
          onClose={() => setShowService(false)} 
          tableId="TABLE_1"
          locationLabel="Table 1"
        />
      )}

      {/* Dish Detail Modal */}
      {showDishDetail && selectedDish && (
        <DishDetailModal 
          item={selectedDish}
          onClose={() => {
            setShowDishDetail(false);
            setSelectedDish(null);
          }}
          quantity={cart[selectedDish.id] || 0}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
};

export default App;