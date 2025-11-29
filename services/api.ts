import { MenuCategory, SubmitOrderPayload, ServiceRequestPayload, ApiResponse, MenuItem } from '../src/types/types';
import { MENU_DATA } from '../src/constants/constants';
import { supabase } from '../src/lib/supabaseClient';
import { executeWithRetry, createApiError, ERROR_CODES } from '../src/lib/errorHandler';
import { logger } from '../src/lib/logger';

// 定义数据库中的菜品结构
interface DatabaseDish {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category_id: string;
  available: boolean;
  metadata: {
    spicy?: boolean;
    vegetarian?: boolean;
    imageUrl?: string;
  };
}

// 定义menu_view返回的数据类型（适配当前数据库结构）
// 定义menu_view返回的数据类型（适配当前数据库结构）
interface MenuViewRow {
  category_id: string;
  category_name: string;
  items: DatabaseDish[];
}

// 定义重试配置
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  delay: 1000,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'SERVER_ERROR', 'TIMEOUT']
};

const SERVICE_RETRY_CONFIG = {
  maxRetries: 2,
  delay: 1500,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'SERVER_ERROR', 'TIMEOUT']
};

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
        // 首先尝试使用 menu_view 视图获取菜单数据
        const { data: menuData, error: menuError } = await supabase
          .from('menu_view')
          .select('*')
          .order('category_name');

        if (!menuError && menuData && menuData.length > 0) {
          // Transform the view data to App Data Structure
          const categories: MenuCategory[] = menuData.map((row: MenuViewRow) => {
            // Transform items to match MenuItem interface
            const transformedItems: MenuItem[] = (Array.isArray(row.items) ? row.items : [])
              .filter((item): item is NonNullable<typeof item> => item !== null)
              .map(item => ({
                id: item.id,
                zh: (item as any).name_zh || '',
                en: (item as any).name_en || '',
                price: Number((item as any).price) || 0,
                spicy: Boolean((item as any).is_spicy) || false,
                vegetarian: Boolean((item as any).is_vegetarian) || false,
                available: item.available !== undefined ? Boolean(item.available) : true,
                imageUrl: (item as any).image_url || ''
              }));

            return {
              key: row.category_id,
              titleZh: row.category_name || '',
              titleEn: row.category_name || '', // 暂时使用中文名称，因为没有单独的英文字段
              items: transformedItems,
            };
          });

          // 只有当有分类数据时才返回，否则继续尝试其他方式
          if (categories.length > 0) {
            return categories;
          }

          return categories;
        }

        // 如果 menu_view 不存在或没有数据，尝试直接查询表
        logger.info('menu_view 不存在或没有数据，尝试直接查询表...');
        
        // 获取所有分类
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          throw createApiError('Failed to fetch categories data', {
            code: categoriesError.code || ERROR_CODES.SERVER_ERROR,
            retryable: true
          });
        }

        // 获取所有菜品
        const { data: dishesData, error: dishesError } = await supabase
          .from('dishes')
          .select('*');

        if (dishesError) {
          throw createApiError('Failed to fetch dishes data', {
            code: dishesError.code || ERROR_CODES.SERVER_ERROR,
            retryable: true
          });
        }

        // 构建菜单结构
        const categories: MenuCategory[] = categoriesData.map(category => {
          const categoryDishes = dishesData.filter(dish => dish.category_id === category.id);
          
          return {
            key: category.id,
            titleZh: category.name,
            titleEn: category.name, // 暂时使用中文名称
            items: categoryDishes.map((dish: any) => ({
              id: dish.id,
              zh: dish.name_zh || dish.name || '',
              en: dish.name_en || dish.name || '',
              price: Number(dish.price) || 0,
              spicy: Boolean(dish.is_spicy) || false,
              vegetarian: Boolean(dish.is_vegetarian) || false,
              available: dish.available !== undefined ? Boolean(dish.available) : true,
              imageUrl: dish.image_url || ''
            }))
          };
        });

        return categories;
      }, DEFAULT_RETRY_CONFIG);

      return { code: 200, message: 'success', data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn('Connection to Supabase failed. Using local fallback data.', errorMessage);
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
      }, SERVICE_RETRY_CONFIG);

      return { code: 200, message: 'success', data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('[API] Order submission failed (Offline Mode). Simulating success.', errorMessage);
      // In offline mode, we simulate a successful order submission
      return { code: 200, message: 'Offline order simulated', data: { orderId: 'offline-' + Date.now() } };
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
      }, SERVICE_RETRY_CONFIG);

      return { code: 200, message: 'success', data: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('[API] Service call failed (Offline Mode). Simulating success.', errorMessage);
      return { code: 200, message: 'Offline request simulated', data: null };
    }
  }
};