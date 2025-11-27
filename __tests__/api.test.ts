import { MENU_DATA } from '../src/constants/constants';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('API Service Tests', () => {
  beforeEach(() => {
    // 清除所有模拟调用历史
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();
    
    // 清除模块缓存
    vi.resetModules();
  });

  describe('getMenu', () => {
    it('should fetch menu data successfully from Supabase', async () => {
      // 模拟成功响应
      const mockCategories = [
        { id: '1', key: 'appetizers', title_zh: '开胃菜', title_en: 'Appetizers', sort: 1 }
      ];
      
      const mockDishes = [
        { 
          id: '101', 
          category_id: '1', 
          name_zh: '春卷', 
          name_en: 'Spring Rolls', 
          price: 250, 
          is_spicy: false, 
          is_vegetarian: true, 
          available: true,
          image_url: null
        }
      ];

      // 在测试中动态模拟模块
      vi.doMock('../src/lib/supabaseClient', () => {
        const mockFrom = vi.fn().mockReturnThis();
        const mockSelect = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        
        mockFrom.mockImplementation((table) => {
          if (table === 'categories') {
            mockSelect.mockReturnThis();
            mockOrder.mockReturnValueOnce({ data: mockCategories, error: null });
            return {
              select: mockSelect,
              order: mockOrder
            };
          } else if (table === 'dishes') {
            mockSelect.mockReturnThis();
            mockEq.mockReturnThis();
            mockOrder.mockReturnValueOnce({ data: mockDishes, error: null });
            return {
              select: mockSelect,
              eq: mockEq,
              order: mockOrder
            };
          }
          return {
            from: mockFrom
          };
        });
        
        return {
          supabase: {
            from: mockFrom
          }
        };
      });

      // 重新导入模块以应用模拟
      const { api: freshApi } = await vi.importActual<any>('../services/api');

      const response = await freshApi.getMenu();
      
      expect(response.code).toBe(200);
      expect(response.data).toHaveLength(1);
      expect(response.data?.[0].key).toBe('appetizers');
      expect(response.data?.[0].items).toHaveLength(1);
      expect(response.data?.[0].items[0].zh).toBe('春卷');
    }, 10000); // 增加超时时间

    it('should fallback to local data when Supabase fails', async () => {
      // 在测试中动态模拟模块
      vi.doMock('../src/lib/supabaseClient', () => {
        const mockFrom = vi.fn().mockReturnThis();
        const mockSelect = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockReturnThis();
        
        mockFrom.mockImplementation(() => {
          mockSelect.mockReturnThis();
          mockOrder.mockReturnValueOnce({ data: null, error: new Error('Network error') });
          return {
            select: mockSelect,
            order: mockOrder
          };
        });
        
        return {
          supabase: {
            from: mockFrom
          }
        };
      });

      // 重新导入模块以应用模拟
      const { api: freshApi } = await vi.importActual<any>('../services/api');

      const response = await freshApi.getMenu();
      
      expect(response.code).toBe(200);
      expect(response.message).toContain('local backup');
      expect(response.data).toEqual(MENU_DATA);
    }, 10000); // 增加超时时间
  });

  describe('submitOrder', () => {
    it('should submit order successfully', async () => {
      const mockOrderData = { id: 'order-123' };
      
      // 在测试中动态模拟模块
      vi.doMock('../src/lib/supabaseClient', () => {
        const mockFrom = vi.fn().mockReturnThis();
        const mockInsert = vi.fn().mockReturnThis();
        const mockSelect = vi.fn().mockReturnThis();
        const mockSingle = vi.fn().mockReturnThis();
        
        mockFrom.mockReturnValue({
          insert: mockInsert,
          select: mockSelect,
          single: mockSingle
        });
        
        mockInsert.mockReturnThis();
        mockSelect.mockReturnThis();
        mockSingle.mockReturnValue({ data: mockOrderData, error: null });
        
        return {
          supabase: {
            from: mockFrom
          }
        };
      });

      // 重新导入模块以应用模拟
      const { api: freshApi } = await vi.importActual<any>('../services/api');

      const payload = {
        tableId: 'T-01',
        items: [{ dishId: '101', quantity: 2 }],
        totalAmount: 500
      };

      const response = await freshApi.submitOrder(payload);
      
      expect(response.code).toBe(200);
      expect(response.data?.orderId).toBe('order-123');
    });

    it('should simulate success in offline mode', async () => {
      // 在测试中动态模拟模块
      vi.doMock('../src/lib/supabaseClient', () => {
        const mockFrom = vi.fn().mockReturnThis();
        const mockInsert = vi.fn().mockReturnThis();
        const mockSelect = vi.fn().mockReturnThis();
        const mockSingle = vi.fn().mockReturnThis();
        
        mockFrom.mockReturnValue({
          insert: mockInsert,
          select: mockSelect,
          single: mockSingle
        });
        
        mockInsert.mockReturnThis();
        mockSelect.mockReturnThis();
        mockSingle.mockReturnValue({ data: null, error: new Error('Network error') });
        
        return {
          supabase: {
            from: mockFrom
          }
        };
      });

      // 重新导入模块以应用模拟
      const { api: freshApi } = await vi.importActual<any>('../services/api');

      const payload = {
        tableId: 'T-01',
        items: [{ dishId: '101', quantity: 2 }],
        totalAmount: 500
      };

      const response = await freshApi.submitOrder(payload);
      
      expect(response.code).toBe(200);
      expect(response.message).toContain('Offline order simulated');
      expect(response.data?.orderId).toMatch(/^OFFLINE-/);
    });
  });

  describe('callService', () => {
    it('should call service successfully', async () => {
      // 在测试中动态模拟模块
      vi.doMock('../src/lib/supabaseClient', () => {
        const mockFrom = vi.fn().mockReturnThis();
        const mockInsert = vi.fn().mockReturnThis();
        
        mockFrom.mockReturnValue({
          insert: mockInsert
        });
        
        mockInsert.mockReturnValue({ data: null, error: null });
        
        return {
          supabase: {
            from: mockFrom
          }
        };
      });

      // 重新导入模块以应用模拟
      const { api: freshApi } = await vi.importActual<any>('../services/api');

      const payload = {
        tableId: 'T-01',
        type: 'call_service',
        typeName: '呼叫服务'
      };

      const response = await freshApi.callService(payload);
      
      expect(response.code).toBe(200);
      expect(response.data).toBeNull();
    });

    it('should simulate success in offline mode', async () => {
      // 在测试中动态模拟模块
      vi.doMock('../src/lib/supabaseClient', () => {
        const mockFrom = vi.fn().mockReturnThis();
        const mockInsert = vi.fn().mockReturnThis();
        
        mockFrom.mockReturnValue({
          insert: mockInsert
        });
        
        mockInsert.mockReturnValue({ data: null, error: new Error('Network error') });
        
        return {
          supabase: {
            from: mockFrom
          }
        };
      });

      // 重新导入模块以应用模拟
      const { api: freshApi } = await vi.importActual<any>('../services/api');

      const payload = {
        tableId: 'T-01',
        type: 'call_service',
        typeName: '呼叫服务'
      };

      const response = await freshApi.callService(payload);
      
      expect(response.code).toBe(200);
      expect(response.message).toContain('Offline request simulated');
      expect(response.data).toBeNull();
    });
  });
});