
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Search, Calendar, FileText, Database, Users } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminReports: React.FC = () => {
    const { transactions, operationLogs, funds, holdings, adminActions } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'ops' | 'users' | 'txs' | 'audit'>('ops');
    
    // --- Data Prep ---
    
    // 1. Ops Data (AUM distribution)
    const fundAumData = funds.map(f => {
        const totalAsset = holdings.filter(h => h.fundId === f.id).reduce((s, h) => s + h.totalAsset, 0);
        return { name: f.fundName, aum: totalAsset + Math.random() * 1000000 }; // Add mock base
    });

    // 2. User Data (Risk Level Distribution) - Mocked since we only have 1 active user object in context state
    const riskDistData = [
        { name: 'C1 保守型', value: 15 },
        { name: 'C2 稳健型', value: 45 },
        { name: 'C3 平衡型', value: 80 },
        { name: 'C4 进取型', value: 30 },
        { name: 'C5 激进型', value: 10 },
    ];

    // 3. Tx Data (Daily Volume)
    const txMap = new Map<string, number>();
    transactions.forEach(t => {
        const date = t.applyTime.split('T')[0];
        txMap.set(date, (txMap.get(date) || 0) + t.actualAmount);
    });
    const txTrendData = Array.from(txMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a,b) => a.date.localeCompare(b.date))
        .slice(-7); // Last 7 days

    const handleExport = () => {
        adminActions.backupData();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">数据报表与审计中心</h1>
                    <p className="text-sm text-gray-500">可视化监控平台运营数据，确保操作可追溯</p>
                </div>
                <div className="flex gap-2">
                    <button 
                         onClick={handleExport}
                         className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200"
                    >
                        <Download className="w-4 h-4" /> 导出全量数据
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">
                {/* Tab Header */}
                <div className="flex border-b border-gray-100">
                    {[
                        { id: 'ops', label: '基金运营报表', icon: Database },
                        { id: 'users', label: '用户资产报表', icon: Users },
                        { id: 'txs', label: '交易统计报表', icon: BarChart },
                        { id: 'audit', label: '操作日志审计', icon: FileText }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 flex-1 bg-gray-50/50 overflow-y-auto">
                    {/* Ops Report */}
                    {activeTab === 'ops' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-4">基金规模分布 (AUM)</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={fundAumData} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                                            <Tooltip formatter={(val: number) => `¥${val.toLocaleString()}`} />
                                            <Bar dataKey="aum" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-4">净值走势概览</h3>
                                <div className="flex items-center justify-center h-64 text-gray-400">
                                    请选择特定基金查看详细走势 (见净值管理)
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Report */}
                    {activeTab === 'users' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-4">用户风险偏好分布</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={riskDistData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {riskDistData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-4">高净值客户排行 (Top 5)</h3>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="px-2 py-2 text-left">排名</th>
                                            <th className="px-2 py-2 text-left">用户</th>
                                            <th className="px-2 py-2 text-right">总资产</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[1,2,3,4,5].map(i => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="px-2 py-3">
                                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i<=3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{i}</span>
                                                </td>
                                                <td className="px-2 py-3">User-{1000+i}</td>
                                                <td className="px-2 py-3 text-right font-mono">¥{(10000000 - i*500000).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tx Report */}
                    {activeTab === 'txs' && (
                        <div className="grid grid-cols-1 gap-6 animate-in fade-in">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-4">近 7 日交易金额趋势</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={txTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" tick={{fontSize: 12}} />
                                            <YAxis tickFormatter={v => `${v/1000}k`} tick={{fontSize: 12}} />
                                            <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                                            <Legend />
                                            <Line type="monotone" dataKey="amount" name="交易额" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audit Logs */}
                    {activeTab === 'audit' && (
                        <div className="animate-in fade-in bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">时间 / IP</th>
                                        <th className="px-6 py-4">操作人</th>
                                        <th className="px-6 py-4">类型</th>
                                        <th className="px-6 py-4">对象</th>
                                        <th className="px-6 py-4">详情内容</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {operationLogs.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-10 text-gray-400">暂无审计日志</td></tr>
                                    ) : (
                                        operationLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3">
                                                    <div className="text-gray-900 font-mono text-xs">{log.createTime.replace('T', ' ').substring(0,19)}</div>
                                                    <div className="text-gray-400 text-xs">{log.ipAddress}</div>
                                                </td>
                                                <td className="px-6 py-3 font-medium">{log.operatorName}</td>
                                                <td className="px-6 py-3">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200">{log.actionType}</span>
                                                </td>
                                                <td className="px-6 py-3 text-gray-600">{log.targetObject}</td>
                                                <td className="px-6 py-3 text-gray-500 max-w-md truncate" title={log.content}>{log.content}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
