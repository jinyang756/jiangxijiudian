
import { FundProduct, FundNav } from '../types';

// 后端接口基础路径 (根据实际部署环境配置，如 '/api' 或 'http://localhost:8080/api')
const API_BASE_URL = '/api'; 

/** 通用响应结构 (适配 Spring Boot Result<T>) */
interface ApiResponse<T> {
    code: number;     // 200=成功, 其他=失败
    message: string;
    data: T;
}

/**
 * 核心请求封装
 * 1. 自动携带 Token
 * 2. 统一处理 HTTP 状态码
 * 3. 统一处理业务错误码
 */
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    // 从 LocalStorage 获取 Token (对接登录系统)
    const token = localStorage.getItem('authToken');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const resJson: ApiResponse<T> = await response.json();

        // 假设后端约定 code === 200 为成功
        if (resJson.code !== 200) {
            throw new Error(resJson.message || 'Request failed');
        }

        return resJson.data;
    } catch (error) {
        console.error(`API Request Failed: ${endpoint}`, error);
        throw error;
    }
};

/**
 * 基金相关接口
 * 对应后端 Controller: FundProductController, FundNavController
 */
export const FundApi = {
    /**
     * 分页查询基金产品列表
     * GET /fund/product/list
     */
    getFundList: (params?: { 
        fundType?: number; 
        riskLevel?: number; 
        keyword?: string;
        page?: number;
        size?: number;
    }) => {
        const query = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query.append(key, String(value));
                }
            });
        }
        return request<FundProduct[]>(`/fund/product/list?${query.toString()}`);
    },

    /**
     * 获取单个基金详情
     * GET /fund/product/{id}
     */
    getFundDetail: (id: number) => {
        return request<FundProduct>(`/fund/product/${id}`);
    },

    /**
     * 查询基金净值历史 (用于图表绘制)
     * GET /fund/nav/history
     */
    getFundNavHistory: (fundId: number, startDate?: string, endDate?: string) => {
        const query = new URLSearchParams({ fundId: String(fundId) });
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);
        
        return request<FundNav[]>(`/fund/nav/history?${query.toString()}`);
    },

    /**
     * 获取最新净值 (用于列表展示)
     * GET /fund/nav/latest
     */
    getLatestNavs: (fundIds: number[]) => {
        return request<Record<number, FundNav>>('/fund/nav/latest', {
            method: 'POST',
            body: JSON.stringify({ fundIds })
        });
    }
};
