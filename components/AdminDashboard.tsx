
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Users, Database, ArrowRight, Activity, DollarSign, FileCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const { funds, transactions, user } = useContext(AppContext);

    // Calculate Admin Stats
    const totalAUM = transactions.reduce((sum, t) => sum + (t.tradeType === 1 ? t.actualAmount : 0), 0) + 50000000; // Mock initial base
    const pendingTransactions = transactions.filter(t => t.tradeStatus === 1 || t.tradeStatus === 3).length;
    const totalFunds = funds.length;
    const activeInvestors = 128; // Mock

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                管理控制台
                <span className="text-xs font-normal bg-gray-800 text-white px-2 py-1 rounded">Admin: {user.realName}</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">资产管理规模 (AUM)</p>
                            <h3 className="text-2xl font-bold text-gray-900">¥{(totalAUM / 10000).toFixed(0)}万</h3>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-green-600">
                        <Activity className="w-3 h-3 mr-1" />
                        +5.2% 较上月
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">待处理交易</p>
                            <h3 className="text-2xl font-bold text-gray-900">{pendingTransactions}</h3>
                        </div>
                         <div className={`p-2 rounded-lg ${pendingTransactions > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                            <FileCheck className="w-5 h-5" />
                        </div>
                    </div>
                     <div className="mt-4 text-xs text-gray-400">
                        需要尽快审核
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">存续产品数</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalFunds}</h3>
                        </div>
                         <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                            <Database className="w-5 h-5" />
                        </div>
                    </div>
                     <div className="mt-4 text-xs text-gray-400">
                        运行正常
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">活跃投资人</p>
                            <h3 className="text-2xl font-bold text-gray-900">{activeInvestors}</h3>
                        </div>
                         <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                     <div className="mt-4 text-xs text-gray-400">
                        本周新增 3 人
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">快捷入口</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/admin/funds" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100">
                            <div className="bg-white p-2 rounded shadow-sm">
                                <Database className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="font-medium text-sm">产品发行管理</span>
                            <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
                        </Link>
                         <Link to="/admin/transactions" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100">
                            <div className="bg-white p-2 rounded shadow-sm">
                                <FileCheck className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="font-medium text-sm">交易清算审核</span>
                            <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
                        </Link>
                    </div>
                </div>

                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" /> 系统公告 / 待办
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2 pb-3 border-b border-gray-100">
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">紧急</span>
                            <span className="text-gray-600">合规部提醒：请于今日完成"聚财稳健增长"的季度信息披露。</span>
                        </li>
                        <li className="flex items-start gap-2 pb-3 border-b border-gray-100">
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">待办</span>
                            <span className="text-gray-600">有 3 位新客户提交了《合格投资者》证明材料，等待人工复核。</span>
                        </li>
                        <li className="flex items-start gap-2">
                             <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">通知</span>
                            <span className="text-gray-600">系统计划于本周六凌晨进行维护升级。</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
