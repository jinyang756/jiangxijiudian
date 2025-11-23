
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { FundViewModel } from '../types';
import { AlertCircle, Filter, Activity, TrendingUp, PlayCircle, Clock, FileSignature, CheckCircle, ChevronRight } from 'lucide-react';
import { generateMockHistory, runDCABacktest, ChartPoint, BacktestResult } from '../services/simulationService';
import TradingViewChart from './TradingViewChart';

const FundMarket: React.FC = () => {
    const { user, buyFund, funds } = useContext(AppContext); // Use global funds
    const [selectedFund, setSelectedFund] = useState<FundViewModel | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [buying, setBuying] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Purchase Wizard State
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: Sign, 3: Success
    const [signatureName, setSignatureName] = useState('');
    const [contractAgreed, setContractAgreed] = useState(false);

    // Strategy Simulator State
    const [activeTab, setActiveTab] = useState<'detail' | 'chart'>('detail');
    const [historyData, setHistoryData] = useState<ChartPoint[]>([]);
    const [backtestConfig, setBacktestConfig] = useState({ amount: 1000, freq: 7 });
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

    // Filters
    const [strategyFilter, setStrategyFilter] = useState('全部');

    const strategies = ['全部', '主观多头', '行业轮动', '债券策略', '管理期货', '量化中性'];
    const filteredFunds = strategyFilter === '全部' 
        ? funds 
        : funds.filter(f => f.extJson?.strategy === strategyFilter);

    // Risk Check
    const userRiskLevel = user.riskLevel || 0;
    
    const handleBuyClick = (fund: FundViewModel) => {
        setSelectedFund(fund);
        setAmount('');
        setMsg(null);
        setActiveTab('detail');
        setStep(1); // Reset Wizard
        setSignatureName('');
        setContractAgreed(false);
        const history = generateMockHistory(fund);
        setHistoryData(history);
        setBacktestResult(null);
    };

    const runBacktest = () => {
        if (!historyData.length) return;
        const res = runDCABacktest(historyData, backtestConfig.amount, backtestConfig.freq);
        setBacktestResult(res);
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!amount || parseFloat(amount) < 1000) {
                setMsg({ type: 'error', text: '请输入有效金额，最低起购1000元' });
                return;
            }
            if (user.accountBalance < parseFloat(amount)) {
                 setMsg({ type: 'error', text: '账户余额不足' });
                 return;
            }
            setMsg(null);
            setStep(2);
        }
    };

    const handleConfirmBuy = async () => {
        if (!selectedFund || !amount || !contractAgreed || !signatureName) return;
        setBuying(true);
        const res = await buyFund(selectedFund, parseFloat(amount), signatureName);
        if (res.success) {
            setMsg({ type: 'success', text: res.message });
            setStep(3); // Success Step
            setBuying(false);
        } else {
            setMsg({ type: 'error', text: res.message });
            setBuying(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        私募基金超市
                        <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded">数据来源：聚财众发投研部</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">专业严选，合规透明，历史业绩不代表未来表现</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 text-gray-600 text-sm font-medium shrink-0">
                        <Filter className="w-4 h-4" />
                        <span>策略筛选:</span>
                    </div>
                    <div className="flex gap-2">
                        {strategies.map(s => (
                            <button
                                key={s}
                                onClick={() => setStrategyFilter(s)}
                                className={`px-4 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
                                    strategyFilter === s 
                                        ? 'bg-blue-600 text-white font-medium' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold min-w-[200px]">基金名称 | 代码</th>
                                <th className="px-4 py-4 text-center font-semibold">基金经理</th>
                                <th className="px-4 py-4 text-center font-semibold">策略</th>
                                <th className="px-4 py-4 text-center font-semibold">赎回周期</th>
                                <th className="px-4 py-4 text-right font-semibold">单位净值</th>
                                <th className="px-4 py-4 text-right font-semibold text-red-600">今年以来</th>
                                <th className="px-4 py-4 text-right font-semibold">最大回撤</th>
                                <th className="px-4 py-4 text-center font-semibold">风险等级</th>
                                <th className="px-6 py-4 text-right font-semibold">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFunds.map(fund => (
                                <tr key={fund.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleBuyClick(fund)}>{fund.fundName}</span>
                                            <span className="text-xs text-gray-400 mt-0.5">{fund.fundCode} | {fund.issueDate}成立</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center text-gray-700">{fund.extJson?.manager}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{fund.extJson?.strategy}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-mono">T+{fund.simulateSettlementDays}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right font-mono font-medium">{fund.nav?.toFixed(4)}</td>
                                    <td className={`px-4 py-4 text-right font-mono font-bold ${ (fund.yearToDate || 0) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {(fund.yearToDate || 0) > 0 ? '+' : ''}{fund.yearToDate}%
                                    </td>
                                    <td className="px-4 py-4 text-right font-mono text-green-600">{fund.maxDrawdown}%</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                                            fund.riskLevel >= 4
                                                ? 'border-red-200 bg-red-50 text-red-600' 
                                                : 'border-blue-200 bg-blue-50 text-blue-600'
                                        }`}>
                                            R{fund.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => { handleBuyClick(fund); setActiveTab('chart'); }}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                                                title="策略回测"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleBuyClick(fund)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-all"
                                            >
                                                申购
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enhanced Wizard Modal */}
            {selectedFund && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-0 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-gray-50 p-6 border-b border-gray-100">
                            <button 
                                onClick={() => setSelectedFund(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedFund.fundName}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{selectedFund.fundCode}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> T+{selectedFund.simulateSettlementDays}</span>
                                        <span>|</span>
                                        <span>{selectedFund.extJson?.strategy}</span>
                                    </div>
                                </div>
                                
                                {step < 3 && (
                                    <div className="ml-auto flex bg-gray-200 rounded-lg p-1">
                                        <button 
                                            onClick={() => setActiveTab('detail')}
                                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'detail' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            交易详情
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('chart')}
                                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${activeTab === 'chart' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <TrendingUp className="w-3 h-3" /> 策略回测
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                             {activeTab === 'detail' ? (
                                <>
                                    {/* Progress Bar for Wizard */}
                                    <div className="mb-6 flex items-center justify-between text-xs font-medium text-gray-500 relative">
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -z-10 rounded"></div>
                                        <div className={`flex items-center gap-2 bg-white pr-2 ${step >= 1 ? 'text-blue-600' : ''}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                                            金额确认
                                        </div>
                                        <div className={`flex items-center gap-2 bg-white px-2 ${step >= 2 ? 'text-blue-600' : ''}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                                            电子签约
                                        </div>
                                        <div className={`flex items-center gap-2 bg-white pl-2 ${step >= 3 ? 'text-blue-600' : ''}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
                                            交易受理
                                        </div>
                                    </div>

                                    {step === 1 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1">今年以来</p>
                                                    <p className={`font-bold text-lg ${(selectedFund.yearToDate||0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {(selectedFund.yearToDate||0) >= 0 ? '+' : ''}{selectedFund.yearToDate}%
                                                    </p>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1">最新净值</p>
                                                    <p className="font-bold text-lg text-gray-900">{selectedFund.nav?.toFixed(4)}</p>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1">夏普比率</p>
                                                    <p className="font-bold text-lg text-gray-900">{selectedFund.sharpeRatio}</p>
                                                </div>
                                            </div>

                                            {userRiskLevel < selectedFund.riskLevel ? (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                                    <div className="text-sm text-red-700">
                                                        <p className="font-bold mb-1">风险不匹配警示</p>
                                                        <p>该产品风险等级为 <span className="font-bold">R{selectedFund.riskLevel}</span>，高于您的承受能力（R{userRiskLevel}）。</p>
                                                        <p className="mt-2 text-xs opacity-80">根据《证券期货投资者适当性管理办法》，您无法购买此产品。</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                                        申购金额 (最低 1000元)
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-3 text-gray-500 font-bold">¥</span>
                                                        <input 
                                                            type="number" 
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                                        <span>可用余额: ¥{user.accountBalance.toLocaleString()}</span>
                                                        <span>费率: <span className="line-through text-gray-400">1.5%</span> <span className="text-red-500">{(selectedFund.subscriptionFeeRate * 100).toFixed(2)}% (1折优惠)</span></span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 max-h-48 overflow-y-auto text-xs text-gray-600 leading-relaxed">
                                                <h4 className="font-bold text-gray-800 mb-2 text-center">基金合同与风险揭示书 (电子版)</h4>
                                                <p>甲方（投资者）：{user.realName} （身份证/账户：{user.virtualAccount}）</p>
                                                <p>乙方（管理人）：武汉聚财众发私募基金管理有限公司</p>
                                                <p className="mt-2 font-bold">第一条 投资范围</p>
                                                <p>本基金主要投资于国内依法发行上市的股票、债券...</p>
                                                <p className="mt-2 font-bold">第二条 风险揭示</p>
                                                <p>投资者应充分知晓私募基金投资属于高风险投资。基金财产不保证本金，可能面临亏损...</p>
                                                <p className="mt-2 font-bold">第三条 冷静期</p>
                                                <p>自本合同签署完毕且募集资金到账之日起，投资者享有24小时的投资冷静期。在冷静期内，投资者有权解除合同并申请全额退款...</p>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={contractAgreed}
                                                        onChange={(e) => setContractAgreed(e.target.checked)}
                                                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        本人已阅读并同意《基金合同》及《风险揭示书》，已知晓“投资冷静期”相关权利。
                                                    </span>
                                                </label>

                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                                                        <FileSignature className="w-4 h-4 inline mr-1" /> 
                                                        电子签名 (请输入真实姓名)
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={signatureName}
                                                        onChange={(e) => setSignatureName(e.target.value)}
                                                        placeholder="请在此输入姓名以签署"
                                                        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-2 text-right">
                                                        签署时间: {new Date().toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">申请已受理</h3>
                                            <p className="text-gray-600 text-sm mb-6">
                                                电子合同签署成功，交易已进入<span className="font-bold text-blue-600">24小时冷静期</span>。
                                                <br/>您可以在“交易记录”中查看状态。
                                            </p>
                                            <div className="bg-gray-50 p-4 rounded-lg text-left text-sm border border-gray-200 max-w-sm mx-auto">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-500">申购产品</span>
                                                    <span className="font-medium">{selectedFund.fundName}</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-500">申购金额</span>
                                                    <span className="font-bold">¥{parseFloat(amount).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">冷静期截止</span>
                                                    <span className="text-orange-600 font-mono">
                                                        {new Date(new Date().getTime() + 24*60*60*1000).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                             ) : (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-bold text-gray-600 mb-1">定投金额 (每期)</label>
                                            <input 
                                                type="number" 
                                                value={backtestConfig.amount} 
                                                onChange={e => setBacktestConfig(prev => ({...prev, amount: Number(e.target.value)}))}
                                                className="w-full px-3 py-2 border rounded-lg text-sm" 
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-bold text-gray-600 mb-1">定投频率</label>
                                            <select 
                                                value={backtestConfig.freq} 
                                                onChange={e => setBacktestConfig(prev => ({...prev, freq: Number(e.target.value)}))}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            >
                                                <option value={7}>每周</option>
                                                <option value={14}>每两周</option>
                                                <option value={30}>每月</option>
                                            </select>
                                        </div>
                                        <button 
                                            onClick={runBacktest}
                                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                                        >
                                            <PlayCircle className="w-4 h-4" /> 运行回测
                                        </button>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <TradingViewChart 
                                            navData={historyData} 
                                            assetData={backtestResult?.assetCurve} 
                                            costData={backtestResult?.costCurve}
                                            mode={backtestResult ? 'STRATEGY' : 'NAV'}
                                        />
                                    </div>
                                    
                                    {backtestResult && (
                                        <div className="grid grid-cols-4 gap-2 text-center text-xs bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                            <div>
                                                <p className="text-gray-500 mb-1">总投入</p>
                                                <p className="font-bold text-gray-900">¥{backtestResult.totalInvested.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">期末持仓</p>
                                                <p className="font-bold text-gray-900">¥{backtestResult.finalValue.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">总收益率</p>
                                                <p className={`font-bold ${backtestResult.totalReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {backtestResult.totalReturnPercent.toFixed(2)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">最大回撤</p>
                                                <p className="font-bold text-green-600">{backtestResult.maxDrawdown.toFixed(2)}%</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             )}
                        </div>

                        {activeTab === 'detail' && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                                {msg && (
                                    <div className={`absolute top-0 left-0 right-0 p-2 text-center text-sm z-10 ${msg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {msg.text}
                                    </div>
                                )}
                                
                                {step === 1 && (
                                    <>
                                        <button 
                                            onClick={() => setSelectedFund(null)}
                                            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                                        >
                                            取消
                                        </button>
                                        <button 
                                            onClick={handleNextStep}
                                            disabled={userRiskLevel < selectedFund.riskLevel}
                                            className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-1 ${
                                                userRiskLevel < selectedFund.riskLevel
                                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
                                            }`}
                                        >
                                            下一步 <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                                        >
                                            上一步
                                        </button>
                                        <button 
                                            onClick={handleConfirmBuy}
                                            disabled={buying || !contractAgreed || !signatureName}
                                            className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-1 ${
                                                buying || !contractAgreed || !signatureName
                                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
                                            }`}
                                        >
                                            {buying ? '提交签约中...' : '签署并申购'} <FileSignature className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                {step === 3 && (
                                    <button 
                                        onClick={() => setSelectedFund(null)}
                                        className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
                                    >
                                        完成
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FundMarket;
