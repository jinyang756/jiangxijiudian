
import { createClient } from '@supabase/supabase-js';
import { FundProduct, FundNav, User, TransactionRecord, UserPosition, SysConfig, DividendRecord, OperationLog } from '../types';

// Vercel 会自动注入这些环境变量
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const ApiService = {
    // --- 认证模块 (Supabase Auth) ---
    auth: {
        // 登录
        login: async (email: string, password: string) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            
            // 获取扩展的用户信息
            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                return { token: data.session.access_token, user: profile };
            }
            throw new Error("Profile not found");
        },
        
        // 注册
        signUp: async (email: string, password: string, realName: string) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { real_name: realName } // 存入 metadata
                }
            });
            if (error) throw error;
            return data;
        },

        logout: async () => {
            await supabase.auth.signOut();
        },
        
        getProfile: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");
            
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            return data;
        }
    },

    // --- 基金产品模块 ---
    fund: {
        getList: async () => {
            const { data, error } = await supabase
                .from('fund_products')
                .select('*')
                .order('id');
            if (error) throw error;
            return data as FundProduct[];
        },
            
        getDetail: async (id: number) => {
            const { data, error } = await supabase
                .from('fund_products')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as FundProduct;
        },

        // 管理端：创建/更新基金
        createOrUpdate: async (fund: Partial<FundProduct>) => {
            const { error } = await supabase
                .from('fund_products')
                .upsert(fund);
            if (error) throw error;
        }
    },

    // --- 交易模块 ---
    transaction: {
        buy: async (fundId: number, amount: number) => {
            const { data: { user } } = await supabase.auth.getUser();
            if(!user) throw new Error("No user");

            const { error } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    fund_id: fundId,
                    amount: amount,
                    trade_type: 1, // 申购
                    trade_status: 1 // 待确认
                });
            if(error) throw error;
            return { success: true };
        },

        getList: async () => {
             const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    fund_info:fund_products(fund_name, fund_code)
                `)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    },
    
    // --- 资产模块 ---
    asset: {
        // 由于计算持仓比较复杂，通常建议写一个 Supabase Database Function (RPC)
        getMyHoldings: async () => {
            // 这里调用你在 Supabase 定义好的 SQL 函数
            // const { data, error } = await supabase.rpc('get_user_holdings');
            // return data;
            return []; // 暂时返回空，需在数据库端实现聚合逻辑
        }
    }
};
