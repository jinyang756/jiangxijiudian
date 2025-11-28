// 标签化订单API服务
class TaggedOrdersAPI {
    constructor() {
        this.dbService = window.dbService; // 引用全局数据库服务实例
    }

    // 获取所有标签化订单
    async getAllTaggedOrders() {
        try {
            const result = await this.dbService.getTaggedOrders();
            return result;
        } catch (error) {
            console.error('获取标签化订单失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 根据ID获取标签化订单
    async getTaggedOrderById(orderId) {
        try {
            const { data, error } = await this.dbService.supabase
                .from('tagged_orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取标签化订单失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新标签化订单状态
    async updateTaggedOrderStatus(orderId, status) {
        try {
            const result = await this.dbService.updateTaggedOrderStatus(orderId, status);
            return result;
        } catch (error) {
            console.error('更新标签化订单状态失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 生成标签化订单打印内容
    generatePrintContent(order) {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>标签化订单 - ${order.tag}</title>
                    <style>
                        body {
                            font-family: 'Microsoft YaHei', Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            font-size: 14px;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #333;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                        }
                        .order-info {
                            margin-bottom: 20px;
                        }
                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        .items-table th,
                        .items-table td {
                            border: 1px solid #333;
                            padding: 8px;
                            text-align: left;
                        }
                        .items-table th {
                            background-color: #f0f0f0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>江西大酒店</h1>
                        <h2>标签化订单 - ${order.tag}</h2>
                    </div>
                    
                    <div class="order-info">
                        <p><strong>桌号:</strong> ${order.table_id}</p>
                        <p><strong>订单ID:</strong> ${order.id}</p>
                        <p><strong>创建时间:</strong> ${new Date(order.created_at).toLocaleString('zh-CN')}</p>
                    </div>
                    
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>菜品</th>
                                <th>数量</th>
                                <th>单价</th>
                                <th>小计</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${JSON.parse(order.items_json).map(item => `
                                <tr>
                                    <td>${item.name_zh || item.name_en || item.zh || item.en}</td>
                                    <td>${item.quantity}</td>
                                    <td>¥${parseFloat(item.price).toFixed(2)}</td>
                                    <td>¥${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div style="text-align: right; font-weight: bold; font-size: 16px;">
                        <p>总计: ¥${parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                    
                    <div class="footer">
                        <p>*** 系统订单 ***</p>
                    </div>
                </body>
            </html>
        `;
    }
}

// 初始化API服务
document.addEventListener('DOMContentLoaded', function() {
    // 只在标签化订单页面激活时初始化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const link = document.querySelector('#tagged-orders-link').closest('a');
                if (link && link.classList.contains('active')) {
                    // 确保API服务只初始化一次
                    if (!window.taggedOrdersAPI) {
                        window.taggedOrdersAPI = new TaggedOrdersAPI();
                    }
                }
            }
        });
    });

    // 监听标签化订单链接
    const taggedOrdersLink = document.querySelector('#tagged-orders-link');
    if (taggedOrdersLink) {
        const parentLink = taggedOrdersLink.closest('a');
        if (parentLink) {
            observer.observe(parentLink, { attributes: true });
        }
    }
});