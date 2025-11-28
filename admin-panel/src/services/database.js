// admin-panel/src/services/database.js
// 数据库管理API

import { getSupabaseClient } from '../utils/helpers.js';

/**
 * 数据库处理器
 */
export const databaseHandler = {
  /**
   * 加载表列表
   * @param {string} containerId - 容器ID
   */
  async loadTableList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
      // 显示加载状态
      container.innerHTML = `
        <div class="flex justify-center items-center h-64">
          <div class="text-center">
            <div class="spinner mx-auto mb-4"></div>
            <p class="text-gray-500">加载中...</p>
          </div>
        </div>
      `;
      
      // 获取表信息
      const tables = [
        { name: 'categories', description: '菜品分类表', records: 0 },
        { name: 'dishes', description: '菜品表', records: 0 },
        { name: 'orders', description: '订单表', records: 0 },
        { name: 'order_items', description: '订单项表', records: 0 },
        { name: 'service_requests', description: '服务请求表', records: 0 }
      ];
      
      // 获取每张表的记录数
      const supabase = getSupabaseClient();
      for (let i = 0; i < tables.length; i++) {
        try {
          const { count, error } = await supabase
            .from(tables[i].name)
            .select('*', { count: 'exact', head: true });
          
          if (!error && count !== null) {
            tables[i].records = count;
          }
        } catch (e) {
          // 忽略错误，保持记录数为0
        }
      }
      
      // 渲染表列表
      this.renderTableList(container, tables);
    } catch (error) {
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div class="text-red-500 mb-2">
            <i class="fas fa-exclamation-circle fa-2x"></i>
          </div>
          <h3 class="text-lg font-medium text-red-800 mb-2">加载失败</h3>
          <p class="text-red-600">${error.message}</p>
          <button onclick="databaseHandler.loadTableList('${containerId}')" class="mt-4 btn-primary text-white font-medium py-2 px-4 rounded-lg">
            重新加载
          </button>
        </div>
      `;
    }
  },
  
  /**
   * 渲染表列表
   * @param {HTMLElement} container - 容器元素
   * @param {Array} tables - 表数据
   */
  renderTableList(container, tables) {
    // 生成HTML
    let html = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-sm p-6 text-white">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-white bg-opacity-20 mr-4">
              <i class="fas fa-database fa-lg"></i>
            </div>
            <div>
              <p class="text-blue-100">总表数</p>
              <h3 class="text-2xl font-bold">${tables.length}</h3>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-sm p-6 text-white">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-white bg-opacity-20 mr-4">
              <i class="fas fa-table fa-lg"></i>
            </div>
            <div>
              <p class="text-green-100">总记录数</p>
              <h3 class="text-2xl font-bold">${tables.reduce((sum, table) => sum + table.records, 0)}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">数据库表</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>表名</th>
                <th>描述</th>
                <th>记录数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    tables.forEach(table => {
      html += `
        <tr>
          <td class="font-medium text-gray-900">${table.name}</td>
          <td>${table.description}</td>
          <td>${table.records}</td>
          <td>
            <div class="flex space-x-2">
              <button class="text-blue-600 hover:text-blue-900" title="查看结构">
                <i class="fas fa-table"></i>
              </button>
              <button class="text-green-600 hover:text-green-900" title="导出数据">
                <i class="fas fa-download"></i>
              </button>
              <button class="text-red-600 hover:text-red-900" title="清空表">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    
    html += `
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">数据库操作</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <i class="fas fa-file-export"></i>
            </div>
            <span class="font-medium text-gray-900">备份数据库</span>
          </button>
          
          <button class="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
              <i class="fas fa-file-import"></i>
            </div>
            <span class="font-medium text-gray-900">恢复数据库</span>
          </button>
          
          <button class="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div class="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
              <i class="fas fa-terminal"></i>
            </div>
            <span class="font-medium text-gray-900">SQL编辑器</span>
          </button>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
};