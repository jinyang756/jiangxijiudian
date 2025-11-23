
import { FundViewModel, NewsItem } from '../types';

// Mock implementation to replace AI functionality
export const analyzeFundWithAI = async (fund: FundViewModel): Promise<string> => {
    return "AI深度分析功能已停用。请参考基金详细披露文档或咨询专业理财顾问。";
};

export const getGeneralMarketAdvice = async (query: string): Promise<string> => {
    return "智能投顾功能已下线。如有投资疑问，请使用右下角人工客服功能。";
};

export const fetchFinancialNewsWithAI = async (): Promise<NewsItem[]> => {
    return [];
};
