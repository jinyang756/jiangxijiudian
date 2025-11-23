
import { FundViewModel } from '../types';

export interface ChartPoint {
    time: string;
    value: number;
}

export interface BacktestResult {
    totalInvested: number;
    finalValue: number;
    totalReturn: number;
    totalReturnPercent: number;
    maxDrawdown: number;
    assetCurve: ChartPoint[];
    costCurve: ChartPoint[];
}

/**
 * Generates mock historical NAV data for a fund based on its risk level.
 * Uses a Geometric Brownian Motion model with drift and volatility.
 */
export const generateMockHistory = (fund: FundViewModel, days: number = 730): ChartPoint[] => {
    const data: ChartPoint[] = [];
    const today = new Date();
    let currentNav = fund.nav || 1.0;
    
    // Define volatility and drift based on Risk Level (1-5)
    let volatility = 0.01;
    let drift = 0.0002;

    switch (fund.riskLevel) {
        case 1: volatility = 0.001; drift = 0.0001; break; // Bond/Money
        case 2: volatility = 0.005; drift = 0.00015; break;
        case 3: volatility = 0.012; drift = 0.0003; break; // Balanced
        case 4: volatility = 0.018; drift = 0.0004; break; // Growth
        case 5: volatility = 0.025; drift = 0.0005; break; // Aggressive
        default: volatility = 0.01; drift = 0.0002;
    }

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const timeString = date.toISOString().split('T')[0];

        data.unshift({
            time: timeString,
            value: currentNav
        });

        const shock = (Math.random() - 0.5) * 2 * volatility;
        const change = drift + shock;
        currentNav = currentNav / (1 + change);
    }

    return data;
};

export const runDCABacktest = (
    history: ChartPoint[], 
    amountPerPeriod: number, 
    frequencyDays: number
): BacktestResult => {
    let totalInvested = 0;
    let totalShares = 0;
    const assetCurve: ChartPoint[] = [];
    const costCurve: ChartPoint[] = [];
    
    let nextInvestIndex = 0;

    for (let i = 0; i < history.length; i++) {
        const point = history[i];
        
        if (i >= nextInvestIndex) {
            const sharesBought = amountPerPeriod / point.value;
            totalShares += sharesBought;
            totalInvested += amountPerPeriod;
            nextInvestIndex += frequencyDays;
        }

        const currentAssetValue = totalShares * point.value;
        
        assetCurve.push({
            time: point.time,
            value: currentAssetValue
        });
        
        costCurve.push({
            time: point.time,
            value: totalInvested
        });
    }

    const finalValue = totalShares * history[history.length - 1].value;
    const totalReturn = finalValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    let maxDd = 0;
    let peak = -Infinity;
    
    for (const p of assetCurve) {
        if (p.value > peak) peak = p.value;
        const dd = peak > 0 ? (peak - p.value) / peak : 0;
        if (dd > maxDd) maxDd = dd;
    }

    return {
        totalInvested,
        finalValue,
        totalReturn,
        totalReturnPercent,
        maxDrawdown: maxDd * 100,
        assetCurve,
        costCurve
    };
};
