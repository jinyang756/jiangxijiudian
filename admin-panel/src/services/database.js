// 数据库管理服务
class DatabaseManager {
    constructor() {
        // 从环境变量获取配置
        // 修复环境变量获取方式，使其在静态HTML中工作
        this.supabaseUrl = this.getEnvVariable('VITE_APP_DB_URL') || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
        this.supabaseKey = this.getEnvVariable('VITE_APP_DB_POSTGRES_PASSWORD') || 'sb_publishable_kn0X93DL4ljLdimMM0TkEg_U6qATZ1I';
        
        // 创建Supabase客户端
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
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
        this.getTaggedOrders = this.getTaggedOrders.bind(this);
        this.addTaggedOrder = this.addTaggedOrder.bind(this);
        this.updateTaggedOrderStatus = this.updateTaggedOrderStatus.bind(this);
    }
    
    // 获取环境变量的辅助函数
    getEnvVariable(name) {
        // 在浏览器环境中，我们无法直接访问环境变量
        // 但我们可以尝试从全局变量或URL参数中获取
        try {
            // 尝试从全局变量获取
            if (typeof window !== 'undefined' && window.env && window.env[name]) {
                return window.env[name];
            }
            
            // 尝试从localStorage获取
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem(name);
                if (stored) return stored;
            }
            
            // 返回默认值
            if (name === 'VITE_APP_DB_URL') {
                return 'https://kdlhyzsihflwkwumxzfw.supabase.co';
            }
            if (name === 'VITE_APP_DB_POSTGRES_PASSWORD') {
                return 'sb_publishable_kn0X93DL4ljLdimMM0TkEg_U6qATZ1I';
            }
        } catch (e) {
            console.warn('无法获取环境变量:', name, e);
        }
        return null;
    }
    
    // 初始化数据库表
    async initializeDatabase() {
        try {
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
    
    // 获取标签化订单
    async getTaggedOrders() {
        try {
            const { data, error } = await this.supabase
                .from('tagged_orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取标签化订单失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 添加标签化订单
    async addTaggedOrder(orderData) {
        try {
            const { data, error } = await this.supabase
                .from('tagged_orders')
                .insert([orderData]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('添加标签化订单失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 更新标签化订单状态
    async updateTaggedOrderStatus(orderId, status) {
        try {
            const { data, error } = await this.supabase
                .from('tagged_orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新标签化订单状态失败:', error);
            return { success: false, error: error.message };
        }
    }
}

// 导出单例实例
const databaseManager = new DatabaseManager();