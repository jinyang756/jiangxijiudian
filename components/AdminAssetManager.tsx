
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { UserPosition } from '../types';
import { Coins, Edit, Download, Briefcase, Plus, Calculator, Search, CheckCircle } from 'lucide-react';

const AdminAssetManager: React.FC = () => {
    const { holdings, funds, dividendRecords, adminActions } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'holdings' | 'dividend'>('holdings');
    
    // --- Holding Edit State ---
    const [editingHolding, setEditingHolding] = useState<UserPosition | null>(null);
    const [editForm, setEditForm] = useState({ shares: 0, cost: 0, remark: '' });

    // --- Dividend State ---
    const [dividendForm, setDividendForm] = useState({
        fundId: funds[0]?.id || 0,
        type: 1 as 1 | 2, // 1 Cash, 2 Reinvest
        amountPerShare: 0.1,
        date: new Date().toISOString().split('T')[0]
    });
    const [dividendModalOpen, setDividendModalOpen] = useState(false);

    // Filter Logic for Holdings
    const [searchTerm, setSearchTerm] = useState('');
    const filteredHoldings = holdings.filter(h => 
        h.fundInfo.fundName.includes(searchTerm) || h.userId.toString().includes(searchTerm)
    );

    // Actions
    const handleEditHolding = (h: UserPosition) => {
        setEditingHolding(h);
        setEditForm({ shares: h.holdShares, cost: h.averageCost, remark: '' });
    };

    const submitHoldingEdit = () => {
        if (!editingHolding) return;
        if (!editForm.remark.trim()) {
            alert("请务必填写修改原因以便审计追溯");
            return;
        }
        adminActions.adjustHolding(editingHolding.id, editForm.shares, editForm.cost, editForm.remark);
        setEditingHolding(null);
    };

    const handleExport = () => {
        // Mock Export
        console.table(holdings);
        alert(`已成功导出 ${holdings.length} 条持仓数据至 Excel/CSV`);
    };

    const openDividendModal = () => {
        setDividendForm({
            fundId: funds[0]?.id || 0,
            type: 1,
            amountPerShare: 0.1,
            date: new Date().toISOString().split('T')[0]
        });
        setDividendModalOpen(true);
    };

    const submitDividend = () => {
        if (window.confirm('确定要执行分红操作吗？这将直接影响用户账户/持仓。')) {
            adminActions.executeDividend(
                dividendForm.fundId, 
                dividendForm.type, 
                dividendForm.amountPerShare, 
                dividendForm.date
            );
            setDividendModalOpen(false);
            setActiveTab('dividend'); // Switch to view record
        }
    };

    // Derived Preview Data
    const targetFundHoldings = holdings.filter(h => h.fundId === Number(dividendForm.fundId));
    const totalShares = targetFundHoldings.reduce((sum, h) => sum + h.holdShares, 0);
    const estimatedPayout = totalShares * dividendForm.amountPerShare;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        持仓与分红管理
                    </h1>
                    <p className="text-sm text-gray-500">用户资产修正、分红派息及权益登记</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('holdings')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'holdings' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Briefcase className="w-4 h-4" /> 持仓管理
                    </button>
                    <button 
                        onClick={() => setActiveTab('dividend')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'dividend' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Coins className="w-4 h-4" /> 分红控制
                    </button>
                </div>
            </div>

            {activeTab === 'holdings' && (
                <div className="animate-in fade-in">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input 
                                type="text"
                                placeholder="搜索基金名称或用户ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button 
                            onClick={handleExport}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200"
                        >
                            <Download className="w-4 h-4" /> 导出明细
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">用户 ID</th>
                                    <th className="px-6 py-4">持有产品</th>
                                    <th className="px-6 py-4 text-right">持有份额</th>
                                    <th className="px-6 py-4 text-right">平均成本</th>
                                    <th className="px-6 py-4 text-right">最新市值</th>
                                    <th className="px-6 py-4 text-center">盈亏状态</th>
                                    <th className="px-6 py-4 text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHoldings.map(h => {
                                    const pnl = (h.latestNav - h.averageCost) / h.averageCost * 100;
                                    return (
                                        <tr key={h.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-500">#{h.userId}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{h.fundInfo.fundName}</td>
                                            <td className="px-6 py-4 text-right font-mono">{h.holdShares.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-gray-500">{h.averageCost.toFixed(4)}</td>
                                            <td className="px-6 py-4 text-right font-bold">¥{h.totalAsset.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs ${pnl >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleEditHolding(h)}
                                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 mx-auto"
                                                >
                                                    <Edit className="w-3 h-3" /> 编辑
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredHoldings.length === 0 && (
                            <div className="p-8 text-center text-gray-400">暂无持仓数据</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'dividend' && (
                <div className="animate-in fade-in">
                    <div className="flex justify-end mb-6">
                        <button 
                            onClick={openDividendModal}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> 发起新分红
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">分红历史记录</div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">权益登记日</th>
                                    <th className="px-6 py-4">分红编号</th>
                                    <th className="px-6 py-4">基金名称</th>
                                    <th className="px-6 py-4 text-center">类型</th>
                                    <th className="px-6 py-4 text-right">每份分红</th>
                                    <th className="px-6 py-4 text-right">分红总额</th>
                                    <th className="px-6 py-4 text-center">涉及用户</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dividendRecords.length === 0 ? (
                                     <tr><td colSpan={7} className="text-center py-8 text-gray-400">暂无分红记录</td></tr>
                                ) : (
                                    dividendRecords.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{r.dividendDate}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-mono">{r.dividendNo}</td>
                                            <td className="px-6 py-4 font-medium">{r.fundName}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs border ${r.dividendType === 1 ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                                                    {r.dividendTypeLabel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">{r.dividendPerShare}</td>
                                            <td className="px-6 py-4 text-right font-bold">¥{r.totalDividendAmount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">{r.affectedUserCount}人</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Holding Edit Modal */}
            {editingHolding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                             <Edit className="w-5 h-5 text-blue-600" />
                             修正持仓信息 #{editingHolding.userId}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">持有份额</label>
                                <input 
                                    type="number"
                                    value={editForm.shares}
                                    onChange={e => setEditForm({...editForm, shares: Number(e.target.value)})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">平均成本 (元)</label>
                                <input 
                                    type="number" step="0.0001"
                                    value={editForm.cost}
                                    onChange={e => setEditForm({...editForm, cost: Number(e.target.value)})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">修改原因 (必填备注)</label>
                                <textarea 
                                    value={editForm.remark}
                                    onChange={e => setEditForm({...editForm, remark: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="请输入调整原因，例如：历史数据同步错误修正、系统补偿等..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setEditingHolding(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50">取消</button>
                            <button onClick={submitHoldingEdit} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200">确认修改</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dividend Modal */}
            {dividendModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-blue-600" /> 分红配置
                        </h3>
                        
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">选择分红基金</label>
                                <select 
                                    value={dividendForm.fundId}
                                    onChange={e => setDividendForm({...dividendForm, fundId: Number(e.target.value)})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                    {funds.map(f => (
                                        <option key={f.id} value={f.id}>{f.fundName} ({f.fundCode})</option>
                                    ))}
                                </select>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">权益登记日</label>
                                    <input 
                                        type="date"
                                        value={dividendForm.date}
                                        onChange={e => setDividendForm({...dividendForm, date: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">每份分红 (元)</label>
                                    <input 
                                        type="number" step="0.01"
                                        value={dividendForm.amountPerShare}
                                        onChange={e => setDividendForm({...dividendForm, amountPerShare: Number(e.target.value)})}
                                        className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-blue-600"
                                    />
                                 </div>
                             </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">分红方式</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 border p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 ${dividendForm.type === 1 ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200'}`}>
                                        <input 
                                            type="radio" name="divType" 
                                            checked={dividendForm.type === 1}
                                            onChange={() => setDividendForm({...dividendForm, type: 1})}
                                            className="hidden"
                                        />
                                        现金分红
                                    </label>
                                    <label className={`flex-1 border p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 ${dividendForm.type === 2 ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200'}`}>
                                        <input 
                                            type="radio" name="divType" 
                                            checked={dividendForm.type === 2}
                                            onChange={() => setDividendForm({...dividendForm, type: 2})}
                                            className="hidden"
                                        />
                                        红利再投资
                                    </label>
                                </div>
                             </div>

                             {/* Preview Panel */}
                             <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-sm space-y-2">
                                 <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-2">方案预估</h4>
                                 <div className="flex justify-between">
                                     <span className="text-gray-500">当前总份额:</span>
                                     <span className="font-mono">{totalShares.toFixed(2)}</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-gray-500">涉及用户数:</span>
                                     <span>{targetFundHoldings.length} 人</span>
                                 </div>
                                 <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                     <span className="font-bold text-gray-800">预计分红总额:</span>
                                     <span className="text-xl font-bold text-blue-600">¥{estimatedPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setDividendModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium">取消</button>
                            <button 
                                onClick={submitDividend} 
                                disabled={totalShares === 0}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <CheckCircle className="w-4 h-4 inline mr-1" /> 确认执行
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAssetManager;
