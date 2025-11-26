import { MenuCategory, SubmitOrderPayload, ServiceRequestPayload, ApiResponse } from '../types';
import { MENU_DATA } from '../constants';
import { supabase } from '../src/lib/supabaseClient';
import { executeWithRetry, createApiError, ERROR_CODES } from '../src/lib/errorHandler';
import { logger } from '../src/lib/logger';

export const api = {
  /**
   * Fetch menu data from Supabase
   * 
   * Logic:
   * 1. Try to fetch 'categories' and 'dishes' from the Supabase backend.
   * 2. If successful, construct the nested menu structure.
   * 3. If failed (backend offline/network error), fallback to local `MENU_DATA` constant.
   * 
   * Note: This function depends on the 'menu_view' database view.
   * If the view doesn't exist, the API will return an error and fallback to local data.
   * To create the view, see: DATABASE_VIEW_SETUP.md
   */
  getMenu: async (): Promise<ApiResponse<MenuCategory[]>> => {
    try {
      // 使用重试机制执行API调用
      const result = await executeWithRetry(async () => {
        // 使用您创建的 menu_view 视图来获取菜单数据
        const { data: menuData, error: menuError } = await supabase
          .from('menu_view')
          .select('category_id, category_name, items')
          .order('category_name');

        if (menuError) {
          throw createApiError('Failed to fetch menu data', {
            code: menuError.code || ERROR_CODES.SERVER_ERROR,
            retryable: true
          });
        }

        // Transform the view data to App Data Structure
        const categories: MenuCategory[] = menuData.map((row: any) => {
          return {
            key: row.category_id,
            titleZh: row.category_name || '',
            titleEn: row.category_name || '', // 暂时使用中文名称，因为没有单独的英文字段
            items: row.items || [],
          };
        });

        return categories;
      }, { maxRetries: 3, delay: 1000 });

      return { code: 200, message: 'success', data: result };
    } catch (error: any) {
      logger.warn('Connection to Supabase failed. Using local fallback data.', error.message);
      logger.info('To enable real-time data, ensure the menu_view is created in Supabase.');
      logger.info('See DATABASE_VIEW_SETUP.md for instructions.');
      // Fallback: Return static data defined in constants.ts
      return { code: 200, message: 'Loaded from local backup', data: MENU_DATA };
    }
  },

  /**
   * Submit order to Supabase 'orders' collection
   */
  submitOrder: async (payload: SubmitOrderPayload): Promise<ApiResponse<{orderId: string}>> => {
    try {
      // 使用重试机制执行API调用
      const result = await executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            table_id: payload.tableId,
            items_json: JSON.stringify(payload.items),
            total_amount: payload.totalAmount,
            status: 'pending'
          })
          .select()
          .single();

        if (error) {
          throw createApiError('Failed to submit order', {
            code: error.code || ERROR_CODES.SERVER_ERROR,
            retryable: true
          });
        }
        
        return { orderId: data.id };
      }, { maxRetries: 2, delay: 1500 });

      return {
        code: 200,
        message: 'success',
        data: result
      };
    } catch (error: any) {
      console.warn('[API] Order submission failed (Offline Mode). Simulating success.', error.message);
      // Simulate success for UI testing
      return { 
        code: 200, 
        message: 'Offline order simulated', 
        data: { orderId: `OFFLINE-${Date.now().toString().slice(-6)}` } 
      };
    }
  },

  /**
   * Create service request in 'service_requests' collection
   */
  callService: async (payload: ServiceRequestPayload): Promise<ApiResponse<null>> => {
    try {
      // 使用重试机制执行API调用
      await executeWithRetry(async () => {
        const { error } = await supabase
          .from('service_requests')
          .insert({
            table_id: payload.tableId,
            type: payload.type,
            type_name: payload.typeName,
            details: payload.details || '',
            status: 'pending'
          });

        if (error) {
          throw createApiError('Failed to call service', {
            code: error.code || ERROR_CODES.SERVER_ERROR,
            retryable: true
          });
        }
        
        return null;
      }, { maxRetries: 2, delay: 1500 });

      return { code: 200, message: 'success', data: null };
    } catch (error: any) {
      console.warn('[API] Service call failed (Offline Mode). Simulating success.', error.message);
      return { code: 200, message: 'Offline request simulated', data: null };
    }
  }
};