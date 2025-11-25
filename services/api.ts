import PocketBase from 'pocketbase';
import { MenuCategory, SubmitOrderPayload, ServiceRequestPayload, ApiResponse, MenuItem } from '../types';
import { MENU_DATA } from '../constants';

// --- Configuration ---
// Robust way to get environment variable without crashing if import.meta is undefined or unsupported
const getEnv = () => {
  try {
    return import.meta.env?.VITE_PB_URL;
  } catch (e) {
    return undefined;
  }
};

const PB_URL = getEnv() || 'http://127.0.0.1:8090';

console.log(`[App] Connecting to PocketBase at: ${PB_URL}`);

// Initialize SDK
const pb = new PocketBase(PB_URL);

// Disable auto-cancellation to prevent race conditions in React StrictMode
pb.autoCancellation(false);

export const api = {
  /**
   * Fetch menu data from PocketBase
   * 
   * Logic:
   * 1. Try to fetch 'categories' and 'dishes' from the backend.
   * 2. If successful, construct the nested menu structure.
   * 3. If failed (backend offline/network error), fallback to local `MENU_DATA` constant.
   */
  getMenu: async (): Promise<ApiResponse<MenuCategory[]>> => {
    try {
      // 1. Fetch all categories (sorted by sort order)
      const categoriesRecord = await pb.collection('categories').getFullList({
        sort: 'sort',
      });

      // 2. Fetch all available dishes (sorted by creation time)
      const dishesRecord = await pb.collection('dishes').getFullList({
        sort: '+created',
        filter: 'available = true',
      });

      // 3. Transform PocketBase records to App Data Structure
      const categories: MenuCategory[] = categoriesRecord.map((cat) => {
        // Find dishes belonging to this category
        // Matches both relation ID or raw string ID depending on DB setup
        const catDishes = dishesRecord.filter(d => d.category === cat.id || d.category_id === cat.id);

        const items: MenuItem[] = catDishes.map((record) => {
          // Generate full image URL if image exists
          const imgUrl = record.image 
            ? pb.files.getUrl(record, record.image)
            : undefined;

          return {
            id: record.dish_id || record.id,
            zh: record.name_zh,
            en: record.name_en,
            price: record.price,
            spicy: record.is_spicy,
            vegetarian: record.is_vegetarian,
            available: record.available,
            imageUrl: imgUrl,
          };
        });

        return {
          key: cat.key,
          titleZh: cat.title_zh,
          titleEn: cat.title_en,
          items: items,
        };
      });

      return { code: 200, message: 'success', data: categories };
    } catch (error: any) {
      console.warn(`[API] Connection to ${PB_URL} failed. Using local fallback data.`, error.message);
      // Fallback: Return static data defined in constants.ts
      return { code: 200, message: 'Loaded from local backup', data: MENU_DATA };
    }
  },

  /**
   * Submit order to PocketBase 'orders' collection
   */
  submitOrder: async (payload: SubmitOrderPayload): Promise<ApiResponse<{orderId: string}>> => {
    try {
      const data = {
        table_id: payload.tableId,
        items_json: JSON.stringify(payload.items),
        total_amount: payload.totalAmount,
        status: 'pending'
      };

      const record = await pb.collection('orders').create(data);
      
      return {
        code: 200,
        message: 'success',
        data: { orderId: record.id }
      };
    } catch (error: any) {
      console.warn("[API] Order submission failed (Offline Mode). Simulating success.", error.message);
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
      const data = {
        table_id: payload.tableId,
        type: payload.type,
        type_name: payload.typeName,
        details: payload.details || '',
        status: 'pending'
      };

      await pb.collection('service_requests').create(data);
      
      return { code: 200, message: 'success', data: null };
    } catch (error: any) {
      console.warn("[API] Service call failed (Offline Mode). Simulating success.", error.message);
      return { code: 200, message: 'Offline request simulated', data: null };
    }
  }
};