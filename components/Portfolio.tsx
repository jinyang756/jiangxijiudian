
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Briefcase, Coins, History, X, Search, Info, Wallet, Calculator, TrendingUp, Truck, FileSignature, Timer } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Portfolio: React.FC = () => {
    const { user, holdings, transactions, redeemFund, depositCash } = useContext(AppContext);
    
    // Redemption Modal State
    const [redeemModal, setRedeemModal] = useState<{ id: number, name: string, maxShares: number, nav: number, cycle: number } | null>(null);
    const [sharesToRedeem, setSharesToRedeem] = useState('');
    
    // Transaction History Detail Modal State
    const [historyFundId, setHistoryFundId] = useState<number | null>(null);
    
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isDepositing, setIsDepositing] = useState(false);

    // --- Calculator State ---
    const [calcPrincipal, setCalcPrincipal] = useState(100000);
    const [calcRate, setCalcRate] = useState(8);
    const [calcYears, setCalcYears] = useState(10);
    const [calcData, setCalcData] = useState<any[]>([]);

    useEffect(() => {
        const data = [];
        let current = calcPrincipal;
        for (let i = 0; i <= calcYears; i++) {
            data.push({
                year: `第${i}年`,
                amount: Math.round(current),
                principal: calcPrincipal
            });
            current = current * (1 + calcRate / 100);
        }
        setCalcData(data);
    }, [calcPrincipal, calcRate, calcYears]);

    // Calculate Global Totals
    const totalFundValue = holdings.reduce((sum, h) => sum + h.totalAsset, 0);
    const totalAssets = user.accountBalance + totalFundValue + (user.unsettledCash || 0);

    const chartData = [
        { name: '现金余额', value: user.accountBalance },
        { name: '在途资金', value: user.unsettledCash || 0 },
        ...holdings.map(h => ({ name: h.fundInfo.fundName, value: h.totalAsset }))
    ].filter(i => i.value > 0);

    const handleRedeem = async () => {
        if (!redeemModal || !sharesToRedeem) return;
        const res = await redeemFund(redeemModal.id, parseFloat(sharesToRedeem));
        if (res.success) {
            setMsg({ type: 'success', text: res.message });
            setTimeout(() => {
                setRedeemModal(null);
                setSharesToRedeem('');
                setMsg(null);
            }, 2000);
        } else {
            setMsg({ type: 'error', text: res.message });
        }
    };

    const handleQuickDeposit = () => {
        setIsDepositing(true);
        setTimeout(() => {
            depositCash(10000);
            setIsDepositing(false);
        }, 1000);
    };

    const getFundDetailData = (fundId: number) => {
        const relatedTxs = transactions
            .filter(t => t.fundId === fundId)
            .sort((a, b) => new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime());
            
        const currentHolding = holdings.find(h => h.fundId === fundId);
        const fundName = currentHolding?.fundInfo.fundName || relatedTxs[0]?.fundInfo?.fundName || '未知基金';
        
        let totalInvested = 0;
        let totalRedeemed = 0;
        let totalFees = 0;

        relatedTxs.forEach(tx => {
            if (tx.tradeStatus === 1) return; // Ignore unconfirmed
            // Status 5 (Cooling Off) counts as invested for now as cash is deducted
            
            if (tx.tradeType === 1) { // Buy
                totalInvested += tx.actualAmount;
                totalFees += tx.feeAmount;
            } else if (tx.tradeType === 2) { // Sell
                totalRedeemed += tx.actualAmount;
                totalFees += tx.feeAmount;
            }
        });

        const currentVal = currentHolding ? currentHolding.totalAsset : 0;
        const netPnL = (currentVal + totalRedeemed) - totalInvested;
        const roi = totalInvested > 0 ? (netPnL / totalInvested) * 100 : 0;

        return {
            fundName,
            relatedTxs,
            metrics: {
                totalInvested,
                totalRedeemed,
                totalFees,
                netPnL,
                roi,
                currentVal
            }
        };
    };

    const detailData = historyFundId ? getFundDetailData(historyFundId) : null;

    const getRedemptionPreview = () => {
        if (!redeemModal || !sharesToRedeem) return null;
        const shares = parseFloat(sharesToRedeem);
        if (isNaN(shares)) return null;

        const gross = shares * redeemModal.nav;
        const fee = gross * 0.005; // 0.5% estimate
        const net = gross - fee;
        return { gross, fee, net };
    };
    const redeemPreview = getRedemptionPreview();

    return (
        <div className="p-6 space-y-6">
            {/* Asset Summary */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <p className="text-blue-200 text-sm mb-1">总资产 (CNY)</p>
                        <h2 className="text-4xl font-bold tracking-tight">¥{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        <div className="flex gap-4 mt-4 text-sm flex-wrap">
                            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                <Briefcase className="w-4 h-4" /> 持仓: ¥{totalFundValue.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                <Coins className="w-4 h-4" /> 余额: ¥{user.accountBalance.toLocaleString()}
                            </span>
                             <span className="flex items-center gap-1 bg-orange-500/30 border border-orange-400/50 px-3 py-1 rounded-full text-orange-100">
                                <Truck className="w-4 h-4" /> 在途: ¥{(user.unsettledCash || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <button 
                            onClick={handleQuickDeposit}
                            disabled={isDepositing}
                            className="bg-white text-blue-800 px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-50 transition-colors"
                        >
                            {isDepositing ? '充值中...' : '快捷充值 (¥1万)'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Holdings List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">我的持仓</h3>
                    {holdings.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">暂无持仓，快去基金超市看看吧</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">基金名称</th>
                                        <th className="px-4 py-3">持有份额</th>
                                        <th className="px-4 py-3">最新市值</th>
                                        <th className="px-4 py-3">收益率(估)</th>
                                        <th className="px-4 py-3 rounded-r-lg text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {holdings.map(h => {
                                        // Simple PnL calc based on avg cost
                                        const pnl = h.holdShares > 0 ? (h.latestNav - h.averageCost) / h.averageCost * 100 : 0;
                                        const isProfit = pnl >= 0;
                                        return (
                                            <tr key={h.fundId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div 
                                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 group"
                                                        onClick={() => setHistoryFundId(h.fundId)}
                                                        title="点击查看交易明细与累计盈亏"
                                                    >
                                                        {h.fundInfo.fundName}
                                                        <Search className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">{h.holdShares.toFixed(2)}</td>
                                                <td className="px-4 py-4">¥{h.totalAsset.toLocaleString()}</td>
                                                <td className={`px-4 py-4 ${isProfit ? 'text-red-500' : 'text-green-500'}`}>
                                                    <div className="flex items-center gap-1">
                                                        {isProfit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        {Math.abs(pnl).toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button 
                                                        onClick={() => setRedeemModal({ 
                                                            id: h.fundId, 
                                                            name: h.fundInfo.fundName, 
                                                            maxShares: h.holdShares,
                                                            nav: h.latestNav,
                                                            cycle: h.fundInfo.simulateSettlementDays || 3
                                                        })}
                                                        className="text-orange-600 hover:text-orange-800 font-medium px-3 py-1 rounded hover:bg-orange-50 transition-colors"
                                                    >
                                                        赎回
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-400 mt-3 text-right flex items-center justify-end gap-1">
                                <Search className="w-3 h-3" /> 点击基金名称可查看详细盈亏分析（含费率）
                            </p>
                        </div>
                    )}
                </div>

                {/* Allocation Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">资产配置</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Investment Calculator Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Calculator className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">收益模拟计算器</h3>
                        <p className="text-xs text-gray-500">基于复利模型，规划您的财富增值路径</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-sm font-medium text-gray-600 mb-2">初始投入金额 (¥)</label>
                            <input 
                                type="number" 
                                value={calcPrincipal}
                                onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-600">预期年化收益率</label>
                                <span className="text-sm font-bold text-purple-600">{calcRate}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" max="20" step="0.5"
                                value={calcRate}
                                onChange={(e) => setCalcRate(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-600">投资持有年限</label>
                                <span className="text-sm font-bold text-purple-600">{calcYears}年</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" max="30" step="1"
                                value={calcYears}
                                onChange={(e) => setCalcYears(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="md:col-span-2 h-[300px] border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={calcData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="year" 
                                    tick={{fontSize: 12, fill: '#6b7280'}} 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={calcYears > 15 ? 4 : calcYears > 8 ? 2 : 0}
                                />
                                <YAxis 
                                    tickFormatter={(val) => `¥${(val/10000).toFixed(0)}w`} 
                                    tick={{fontSize: 12, fill: '#6b7280'}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    formatter={(value: number) => [`¥${value.toLocaleString()}`, '资产总额']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#9333ea" 
                                    strokeWidth={3} 
                                    dot={false} 
                                    name="复利增长曲线" 
                                    activeDot={{ r: 6 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="principal" 
                                    stroke="#cbd5e1" 
                                    strokeWidth={2} 
                                    strokeDasharray="5 5" 
                                    dot={false} 
                                    name="本金基准" 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Redemption Modal */}
            {redeemModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-800">基金赎回</h3>
                            <button onClick={() => { setRedeemModal(null); setMsg(null); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">{redeemModal.name}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                            <span>持有份额: {redeemModal.maxShares.toFixed(2)}</span>
                            <span>当前净值: {redeemModal.nav.toFixed(4)}</span>
                        </div>

                        <label className="block text-sm font-medium mb-2 text-gray-700">赎回份额</label>
                        <input 
                            type="number"
                            max={redeemModal.maxShares}
                            value={sharesToRedeem}
                            onChange={(e) => setSharesToRedeem(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="请输入数量"
                        />
                        
                        {redeemPreview && (
                             <div className="mb-4 text-xs space-y-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex justify-between text-gray-500">
                                    <span>赎回总额(估):</span>
                                    <span>¥{redeemPreview.gross.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                                </div>
                                <div className="flex justify-between text-orange-600">
                                    <span>手续费 (0.5%):</span>
                                    <span>-¥{redeemPreview.fee.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                                </div>
                                <div className="flex justify-between text-blue-600">
                                    <span>到账周期:</span>
                                    <span>T+{redeemModal.cycle}</span>
                                </div>
                                <div className="border-t border-blue-200 pt-1 mt-1 flex justify-between font-bold text-gray-900">
                                    <span>预计到账:</span>
                                    <span>¥{redeemPreview.net.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                                </div>
                             </div>
                        )}

                        {msg && (
                            <div className={`mb-4 text-xs p-2 rounded flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {msg.text}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button 
                                onClick={() => { setRedeemModal(null); setMsg(null); }}
                                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleRedeem}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md shadow-blue-200"
                            >
                                确认赎回
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History Detail Modal */}
            {historyFundId && detailData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{detailData.fundName}</h3>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Info className="w-3 h-3" /> 数据包含申购费(0.15%)与赎回费(0.5%)精准测算
                                </p>
                            </div>
                            <button onClick={() => setHistoryFundId(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-gray-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-4 bg-white">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">累计投入本金 (实付)</p>
                                <p className="font-bold text-gray-800 text-lg">¥{detailData.metrics.totalInvested.toLocaleString()}</p>
                            </div>
                            
                            <div className={`p-4 rounded-xl border ${detailData.metrics.netPnL >= 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                <p className={`text-xs mb-1 ${detailData.metrics.netPnL >= 0 ? 'text-red-600' : 'text-green-600'}`}>净盈亏 (扣费后)</p>
                                <div className="flex items-center gap-2">
                                    <p className={`font-bold text-2xl ${detailData.metrics.netPnL >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                                        {detailData.metrics.netPnL >= 0 ? '+' : ''}{detailData.metrics.netPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${detailData.metrics.netPnL >= 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    ROI: {detailData.metrics.roi.toFixed(2)}%
                                </span>
                            </div>

                            <div className="col-span-2 bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex justify-between items-center text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs">当前持仓市值</span>
                                    <span className="font-semibold text-gray-900">¥{detailData.metrics.currentVal.toLocaleString()}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-gray-500 block text-xs">累计已赎回(实收)</span>
                                    <span className="font-semibold text-gray-900">¥{detailData.metrics.totalRedeemed.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 block text-xs">累计交易成本</span>
                                    <span className="font-semibold text-gray-600">-¥{detailData.metrics.totalFees.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <History className="w-4 h-4" /> 历史交易流水
                            </h4>
                            {detailData.relatedTxs.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    暂无相关交易记录
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left">日期</th>
                                            <th className="px-4 py-3 text-left">类型</th>
                                            <th className="px-4 py-3 text-right">发生金额</th>
                                            <th className="px-4 py-3 text-right text-xs">费率</th>
                                            <th className="px-4 py-3 text-center">状态</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {detailData.relatedTxs.map(tx => (
                                            <tr key={tx.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                                                    {tx.applyTime.split('T')[0]}
                                                    <div className="text-[10px] text-gray-400">{tx.applyTime.split('T')[1].substring(0,5)}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                        tx.tradeType === 1 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {tx.tradeTypeLabel}
                                                    </span>
                                                    {tx.signature && (
                                                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1" title={`电子签名: ${tx.signature}`}>
                                                            <FileSignature className="w-3 h-3"/> 已签约
                                                        </div>
                                                    )}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-mono font-medium ${
                                                    tx.tradeType === 1 ? 'text-gray-900' : 'text-orange-600'
                                                }`}>
                                                    {tx.tradeType === 2 || tx.tradeType === 3 ? '+' : '-'}{tx.actualAmount.toLocaleString()}
                                                </td>
                                                 <td className="px-4 py-3 text-right text-gray-400 text-xs">
                                                    {tx.feeAmount.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center text-xs">
                                                    {tx.tradeStatus === 3 ? (
                                                        <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded">清算中...</span>
                                                    ) : tx.tradeStatus === 5 ? (
                                                        <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 flex items-center justify-center gap-1">
                                                            <Timer className="w-3 h-3"/> 冷静期
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">已完成</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-right">
                             <button 
                                onClick={() => setHistoryFundId(null)}
                                className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm shadow-sm"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Portfolio;
