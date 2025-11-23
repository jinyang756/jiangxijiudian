
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { FundViewModel } from '../types';
import { Plus, Edit, Trash2, Search, X, Settings, UploadCloud, AlertCircle } from 'lucide-react';

const AdminFundManager: React.FC = () => {
    const { funds, adminActions } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFund, setEditingFund] = useState<FundViewModel | null>(null);
    const [tab, setTab] = useState<'list' | 'import'>('list');

    // Form State
    const [formData, setFormData] = useState<Partial<FundViewModel>>({});

    const handleOpenModal = (fund?: FundViewModel) => {
        if (fund) {
            setEditingFund(fund);
            setFormData(fund);
        } else {
            setEditingFund(null);
            setFormData({
                fundType: 1,
                riskLevel: 3,
                status: 1,
                nav: 1.0,
                simulateSettlementDays: 3,
                lockupPeriod: 7,
                subscriptionFeeRate: 0.015,
                redemptionFeeRate: 0.005,
                managementFeeRate: 0.015,
                issueDate: new Date().toISOString().split('T')[0],
                extJson: { manager: '', strategy: '' }
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = (fundCode: string) => {
        if(window.confirm(`确定要下架并删除基金产品 [${fundCode}] 吗？\n此操作不可恢复。`)) {
            // In a real app, this would be a delete call. For mock:
            alert("产品已标记为下架状态");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newFund = {
            ...formData,
            id: editingFund ? editingFund.id : Date.now(),
            fundTypeLabel: getFundTypeLabel(formData.fundType || 1),
            riskLevelLabel: getRiskLabel(formData.riskLevel || 3),
            statusLabel: getStatusLabel(formData.status || 1),
            extJson: { ...formData.extJson, strategy: formData.extJson?.strategy || '默认策略' }
        } as FundViewModel;

        if (editingFund) {
            adminActions.updateFund(newFund);
        } else {
            adminActions.addFund(newFund);
        }
        setIsModalOpen(false);
    };

    const getFundTypeLabel = (type: number) => {
        switch(type) {
            case 1: return '股票型';
            case 2: return '债券型';
            case 3: return '混合型';
            case 5: return '期货型';
            default: return '其他';
        }
    };

    const getRiskLabel = (level: number) => {
        return `R${level}`;
    };

    const getStatusLabel = (status: number) => {
        switch(status) {
            case 1: return '募集期';
            case 2: return '存续期';
            case 3: return '清算期';
            case 4: return '暂停交易';
            default: return '未知';
        }
    };

    const StatusBadge = ({ status }: { status: number }) => {
        let color = 'bg-gray-100 text-gray-600';
        let label = getStatusLabel(status);
        if (status === 1) color = 'bg-blue-100 text-blue-700'; // Raising
        if (status === 2) color = 'bg-green-100 text-green-700'; // Operating
        if (status === 3) color = 'bg-orange-100 text-orange-700'; // Liquidation
        if (status === 4) color = 'bg-red-100 text-red-700'; // Paused
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">产品发行管理</h1>
                    <p className="text-sm text-gray-500">基金产品全生命周期管理与参数配置</p>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setTab('import')}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm text-sm"
                    >
                        <UploadCloud className="w-4 h-4" /> 批量导入
                    </button>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" /> 发行新产品
                    </button>
                </div>
            </div>

            {tab === 'import' ? (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center animate-in fade-in zoom-in-95">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">批量导入基金产品</h3>
                        <p className="text-sm text-gray-500 mb-6">请上传标准 Excel 模板文件，系统将自动校验基金代码唯一性。</p>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-4 hover:border-blue-400 cursor-pointer transition-colors bg-gray-50">
                            <p className="text-gray-400 text-sm">点击选择文件或拖拽至此</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setTab('list')} className="text-gray-500 hover:text-gray-700 text-sm">返回列表</button>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">开始解析</button>
                        </div>
                    </div>
                 </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">代码/名称</th>
                                    <th className="px-6 py-4 text-center">基金经理</th>
                                    <th className="px-6 py-4 text-center">类型</th>
                                    <th className="px-6 py-4 text-center">状态</th>
                                    <th className="px-6 py-4 text-right">净值</th>
                                    <th className="px-6 py-4 text-center">交易规则 (T+N / 锁定期)</th>
                                    <th className="px-6 py-4 text-center">综合费率 (申/赎/管)</th>
                                    <th className="px-6 py-4 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {funds.map(fund => (
                                    <tr key={fund.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{fund.fundCode}</div>
                                            <div className="text-xs text-gray-500">{fund.fundName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-700 font-medium">
                                            {fund.extJson?.manager || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded">{fund.fundTypeLabel}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={fund.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium">{fund.nav?.toFixed(4)}</td>
                                        <td className="px-6 py-4 text-center text-xs text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <span>赎回: T+{fund.simulateSettlementDays}</span>
                                                <span>锁定: {fund.lockupPeriod}天</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs text-gray-500">
                                            <span title="申购费">{((fund.subscriptionFeeRate || 0)*100).toFixed(1)}%</span> / 
                                            <span title="赎回费">{((fund.redemptionFeeRate || 0)*100).toFixed(1)}%</span> / 
                                            <span title="管理费">{((fund.managementFeeRate || 0)*100).toFixed(1)}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenModal(fund)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors" title="编辑配置">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(fund.fundCode)} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" title="下架/删除">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editingFund ? '编辑产品配置' : '发行新产品'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">请配置产品全生命周期参数及交易规则</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 border-l-4 border-blue-600 pl-2">基础信息</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">产品代码 (唯一)</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.fundCode || ''}
                                            onChange={e => setFormData({...formData, fundCode: e.target.value})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            disabled={!!editingFund}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">产品全称</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.fundName || ''}
                                            onChange={e => setFormData({...formData, fundName: e.target.value})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">成立日期</label>
                                        <input 
                                            type="date" 
                                            value={formData.issueDate || ''}
                                            onChange={e => setFormData({...formData, issueDate: e.target.value})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">基金经理</label>
                                        <input 
                                            type="text"
                                            value={formData.extJson?.manager || ''}
                                            onChange={e => setFormData({...formData, extJson: { ...formData.extJson, manager: e.target.value }})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="请输入经理姓名"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Classification & Status */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 border-l-4 border-purple-600 pl-2">分类与状态管控</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">产品类型</label>
                                        <select 
                                            value={formData.fundType}
                                            onChange={e => setFormData({...formData, fundType: Number(e.target.value) as any})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                                        >
                                            <option value={1}>股票型</option>
                                            <option value={2}>债券型</option>
                                            <option value={3}>混合型</option>
                                            <option value={5}>期货型</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">风险等级</label>
                                        <select 
                                            value={formData.riskLevel}
                                            onChange={e => setFormData({...formData, riskLevel: Number(e.target.value) as any})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                                        >
                                            <option value={1}>R1 (低)</option>
                                            <option value={2}>R2 (中低)</option>
                                            <option value={3}>R3 (中)</option>
                                            <option value={4}>R4 (中高)</option>
                                            <option value={5}>R5 (高)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">生命周期状态</label>
                                        <select 
                                            value={formData.status}
                                            onChange={e => setFormData({...formData, status: Number(e.target.value) as any})}
                                            className={`w-full border rounded-lg px-3 py-2 text-sm font-bold ${
                                                formData.status === 1 ? 'text-blue-600' :
                                                formData.status === 2 ? 'text-green-600' :
                                                formData.status === 3 ? 'text-orange-600' : 'text-red-600'
                                            }`}
                                        >
                                            <option value={1}>1-募集期</option>
                                            <option value={2}>2-存续期</option>
                                            <option value={3}>3-清算期</option>
                                            <option value={4}>4-暂停交易</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Simulation Config */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 border-l-4 border-orange-500 pl-2">交易规则配置</h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">初始单位净值</label>
                                        <input 
                                            type="number" step="0.0001"
                                            value={formData.nav}
                                            onChange={e => setFormData({...formData, nav: Number(e.target.value)})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">封闭锁定期 (天)</label>
                                        <input 
                                            type="number"
                                            value={formData.lockupPeriod}
                                            onChange={e => setFormData({...formData, lockupPeriod: Number(e.target.value)})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">赎回到账周期 (T+N)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500 text-sm">T +</span>
                                            <input 
                                                type="number"
                                                value={formData.simulateSettlementDays}
                                                onChange={e => setFormData({...formData, simulateSettlementDays: Number(e.target.value)})}
                                                className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">申购费率 (小数)</label>
                                        <input 
                                            type="number" step="0.0001"
                                            value={formData.subscriptionFeeRate}
                                            onChange={e => setFormData({...formData, subscriptionFeeRate: Number(e.target.value)})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                            placeholder="0.015"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">例：0.015 代表 1.5%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 text-sm"
                                >
                                    取消
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 text-sm"
                                >
                                    {editingFund ? '保存配置修改' : '确认发行产品'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFundManager;
