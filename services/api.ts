import { MenuCategory, SubmitOrderPayload, ServiceRequestPayload, ApiResponse, MenuItem } from '../types';
import { MENU_DATA } from '../constants';
import { supabase } from '../src/lib/supabaseClient';
import { executeWithRetry, createApiError, ERROR_CODES } from '../src/lib/errorHandler';

export const api = {
  /**
   * Fetch menu data from Supabase
   * 
   * Logic:
   * 1. Try to fetch 'categories' and 'dishes' from the Supabase backend.
   * 2. If successful, construct the nested menu structure.
   * 3. If failed (backend offline/network error), fallback to local `MENU_DATA` constant.
   */
  getMenu: async (): Promise<ApiResponse<MenuCategory[]>> => {
    try {
      // 使用重试机制执行API调用
      const result = await executeWithRetry(async () => {
        // 1. Fetch all categories (sorted by creation time)
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true });

        if (categoriesError) {
          throw createApiError('Failed to fetch categories', {
            code: categoriesError.code || ERROR_CODES.SERVER_ERROR,
            retryable: true
          });
        }

        // 2. Fetch all available dishes (sorted by creation time)
        const { data: dishesData, error: dishesError } = await supabase
          .from('dishes')
          .select('*')
          .order('created_at', { ascending: true });

        if (dishesError) {
          throw createApiError('Failed to fetch dishes', {
            code: dishesError.code || ERROR_CODES.SERVER_ERROR,
            retryable: true
          });
        }

        // 3. Transform Supabase records to App Data Structure
        const categories: MenuCategory[] = categoriesData.map((cat) => {
          // Find dishes belonging to this category
          const catDishes = dishesData.filter(d => d.category_id === cat.id);

          const items: MenuItem[] = catDishes.map((record) => {
            return {
              id: record.dish_id || record.id,
              zh: record.name || record.name_norm || '',
              en: record.en_title || '',
              price: record.price || 0,
              spicy: record.is_spicy || false,
              vegetarian: record.is_vegetarian || false,
              available: record.available !== undefined ? record.available : true,
              imageUrl: record.image_url || undefined,
            };
          });

          return {
            key: cat.id,
            titleZh: cat.name || '',
            titleEn: cat.name || '', // 暂时使用name字段，因为没有单独的英文字段
            items: items,
          };
        });

        return categories;
      }, { maxRetries: 3, delay: 1000 });

      return { code: 200, message: 'success', data: result };
    } catch (error: any) {
      console.warn('[API] Connection to Supabase failed. Using local fallback data.', error.message);
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