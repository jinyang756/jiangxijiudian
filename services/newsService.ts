
import { NewsItem } from '../types';

// Fallback Mock Data
const getMockNews = (): NewsItem[] => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return [
        {
            id: '101',
            title: '中基协发布最新私募登记备案数据，行业规模稳步增长',
            summary: '截至本月，存续私募基金管理人数量保持稳定，管理基金规模突破20万亿元大关，行业扶优限劣效果显著。',
            date: formatDate(today),
            category: 'Market',
            source: '中国基金业协会',
            imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: '102',
            title: '聚财众发投研早报：A股市场震荡上行，关注科技成长板块',
            summary: '昨日市场成交量温和放大，北向资金净流入。建议投资者关注半导体、人工智能及高端制造领域的长期配置机会。',
            date: formatDate(today),
            category: 'Company',
            source: '聚财众发投研部',
            imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: '103',
            title: '监管动态：私募投资基金监督管理条例实施细则即将落地',
            summary: '监管部门强调，将进一步细化合格投资者认定标准及募资行为规范，推动行业高质量发展。',
            date: formatDate(yesterday),
            category: 'Market',
            source: '证监会发布',
            imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: '106',
            title: '量化私募指增策略表现亮眼，超额收益显著',
            summary: '在近期震荡市中，量化指数增强策略凭借高换手和多因子模型，持续跑赢基准指数。',
            date: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
            category: 'Market',
            source: '私募排排网',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400'
        }
    ];
};

export const fetchMarketNews = async (): Promise<NewsItem[]> => {
    // Return mock data directly
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getMockNews());
        }, 800);
    });
};
