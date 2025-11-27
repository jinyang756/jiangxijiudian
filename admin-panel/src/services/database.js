// 数据库管理服务
import { createClient } from '@supabase/supabase-js';

class DatabaseManager {
    constructor() {
        // 从环境变量获取配置
        this.supabaseUrl = import.meta.env.VITE_APP_DB_URL || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
        this.supabaseKey = import.meta.env.VITE_APP_DB_POSTGRES_PASSWORD || 'J2nkgp0cGZYF8iHk';
        
        // 创建Supabase客户端
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        
        // 绑定方法
        this.initializeDatabase = this.initializeDatabase.bind(this);
        this.getMenuData = this.getMenuData.bind(this);
        this.addDish = this.addDish.bind(this);
        this.updateDish = this.updateDish.bind(this);
        this.deleteDish = this.deleteDish.bind(this);
        this.getCategories = this.getCategories.bind(this);
        this.addCategory = this.addCategory.bind(this);
        this.updateCategory = this.updateCategory.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
        this.getOrders = this.getOrders.bind(this);
        this.updateOrderStatus = this.updateOrderStatus.bind(this);
        this.getServiceRequests = this.getServiceRequests.bind(this);
        this.updateServiceRequestStatus = this.updateServiceRequestStatus.bind(this);
    }

    // 初始化数据库表
    async initializeDatabase() {
        try {
            // 创建categories表
            const { error: categoriesError } = await this.supabase.rpc('execute_sql', {
                sql: `
                    CREATE TABLE IF NOT EXISTS categories (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        key TEXT UNIQUE NOT NULL,
                        title_zh TEXT NOT NULL,
                        title_en TEXT NOT NULL,
                        sort INTEGER DEFAULT 0,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            if (categoriesError) throw categoriesError;

            // 创建dishes表
            const { error: dishesError } = await this.supabase.rpc('execute_sql', {
                sql: `
                    CREATE TABLE IF NOT EXISTS dishes (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
                        dish_id TEXT UNIQUE NOT NULL,
                        name_zh TEXT NOT NULL,
                        name_en TEXT NOT NULL,
                        price NUMERIC NOT NULL,
                        is_spicy BOOLEAN DEFAULT FALSE,
                        is_vegetarian BOOLEAN DEFAULT FALSE,
                        available BOOLEAN DEFAULT TRUE,
                        image_url TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            if (dishesError) throw dishesError;

            // 创建orders表
            const { error: ordersError } = await this.supabase.rpc('execute_sql', {
                sql: `
                    CREATE TABLE IF NOT EXISTS orders (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        table_id TEXT NOT NULL,
                        items_json TEXT NOT NULL,
                        total_amount NUMERIC NOT NULL,
                        status TEXT NOT NULL DEFAULT 'pending',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            if (ordersError) throw ordersError;

            // 创建service_requests表
            const { error: serviceRequestsError } = await this.supabase.rpc('execute_sql', {
                sql: `
                    CREATE TABLE IF NOT EXISTS service_requests (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        table_id TEXT NOT NULL,
                        type TEXT NOT NULL,
                        type_name TEXT NOT NULL,
                        details TEXT,
                        status TEXT NOT NULL DEFAULT 'pending',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            if (serviceRequestsError) throw serviceRequestsError;

            // 创建索引
            const { error: indexesError } = await this.supabase.rpc('execute_sql', {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_categories_key ON categories(key);
                    CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort);
                    CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);
                    CREATE INDEX IF NOT EXISTS idx_dishes_dish_id ON dishes(dish_id);
                    CREATE INDEX IF NOT EXISTS idx_dishes_available ON dishes(available);
                    CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
                    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
                    CREATE INDEX IF NOT EXISTS idx_service_requests_table_id ON service_requests(table_id);
                    CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
                `
            });

            if (indexesError) throw indexesError;

            console.log('数据库初始化完成');
            return { success: true };
        } catch (error) {
            console.error('数据库初始化失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取菜单数据
    async getMenuData() {
        try {
            // 使用menu_view视图获取数据
            const { data, error } = await this.supabase
                .from('menu_view')
                .select('*')
                .order('category_name');

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取菜单数据失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 添加菜品
    async addDish(dishData) {
        try {
            const { data, error } = await this.supabase
                .from('dishes')
                .insert([dishData]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('添加菜品失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新菜品
    async updateDish(dishId, dishData) {
        try {
            const { data, error } = await this.supabase
                .from('dishes')
                .update(dishData)
                .eq('dish_id', dishId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新菜品失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 删除菜品
    async deleteDish(dishId) {
        try {
            const { data, error } = await this.supabase
                .from('dishes')
                .delete()
                .eq('dish_id', dishId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('删除菜品失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取分类
    async getCategories() {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('sort');

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取分类失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 添加分类
    async addCategory(categoryData) {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .insert([categoryData]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('添加分类失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新分类
    async updateCategory(categoryId, categoryData) {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .update(categoryData)
                .eq('id', categoryId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新分类失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 删除分类
    async deleteCategory(categoryId) {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .delete()
                .eq('id', categoryId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('删除分类失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取订单
    async getOrders() {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取订单失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新订单状态
    async updateOrderStatus(orderId, status) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新订单状态失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取服务请求
    async getServiceRequests() {
        try {
            const { data, error } = await this.supabase
                .from('service_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取服务请求失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新服务请求状态
    async updateServiceRequestStatus(requestId, status) {
        try {
            const { data, error } = await this.supabase
                .from('service_requests')
                .update({ status })
                .eq('id', requestId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新服务请求状态失败:', error);
            return { success: false, error: error.message };
        }
    }
}

// 导出单例实例
export const databaseManager = new DatabaseManager();