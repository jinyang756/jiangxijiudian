
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Check, X, Search, FileText } from 'lucide-react';

const AdminTransactionAudit: React.FC = () => {
    const { transactions, adminActions } = useContext(AppContext);
    const [filter, setFilter] = useState<'all' | 'pending'>('pending');

    const filteredTxs = transactions.filter(t => {
        if (filter === 'pending') return t.tradeStatus === 1 || t.tradeStatus === 3 || t.tradeStatus === 5; // 1=Wait, 3=Clearing, 5=Cooling
        return true;
    });

    const handleAction = (id: number, action: 'confirm' | 'reject') => {
        if (window.confirm(`确认执行 ${action === 'confirm' ? '通过' : '驳回'} 操作?`)) {
            adminActions.auditTransaction(id, action);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">交易清算审核</h1>
                    <p className="text-sm text-gray-500">处理申购确认、赎回清算及异常交易</p>
                </div>
                <div className="flex bg-gray-200 rounded-lg p-1">
                    <button 
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'pending' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
                    >
                        待处理
                    </button>
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
                    >
                        全部记录
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">流水号 / 时间</th>
                            <th className="px-6 py-4">客户 ID</th>
                            <th className="px-6 py-4">类型</th>
                            <th className="px-6 py-4">标的资产</th>
                            <th className="px-6 py-4 text-right">金额 (¥)</th>
                            <th className="px-6 py-4 text-center">当前状态</th>
                            <th className="px-6 py-4 text-right">人工审核</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTxs.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">暂无相关数据</td></tr>
                        ) : (
                            filteredTxs.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-gray-800">{tx.tradeNo}</div>
                                        <div className="text-xs text-gray-400">{tx.applyTime.replace('T',' ').substring(0,16)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        USER-{tx.userId}
                                        {tx.signature && <span title={tx.signature} className="ml-1 inline-block"><FileText className="w-3 h-3 text-blue-400"/></span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            tx.tradeType === 1 ? 'bg-blue-50 text-blue-600' :
                                            tx.tradeType === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-100'
                                        }`}>
                                            {tx.tradeTypeLabel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{tx.fundInfo?.fundName || '现金账户'}</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold">
                                        {tx.tradeAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <span className={`inline-block px-2 py-0.5 rounded border text-xs ${
                                             tx.tradeStatus === 3 ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                             tx.tradeStatus === 5 ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                             'bg-gray-50 text-gray-500 border-gray-100'
                                         }`}>
                                            {tx.tradeStatusLabel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {(tx.tradeStatus === 1 || tx.tradeStatus === 3 || tx.tradeStatus === 5) && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleAction(tx.id, 'confirm')}
                                                    className="bg-green-50 text-green-600 hover:bg-green-100 p-1.5 rounded transition-colors"
                                                    title="通过/确认"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(tx.id, 'reject')}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded transition-colors"
                                                    title="驳回"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTransactionAudit;
