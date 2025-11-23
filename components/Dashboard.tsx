
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { History, TrendingUp, AlertTriangle, Calculator, Shield, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, transactions, processSettlement } = useContext(AppContext);

    // 3=清算中
    const pendingCount = transactions.filter(t => t.tradeStatus === 3).length;

    // Calculate days since joining
    const daysJoined = useMemo(() => {
        if (!user.createTime) return 1;
        const start = new Date(user.createTime).getTime();
        const now = new Date().getTime();
        const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        return days < 1 ? 1 : days;
    }, [user.createTime]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold text-gray-800">欢迎回来, {user.realName || user.username}</h1>
                     <p className="text-gray-500 text-sm mt-1">今天是您在聚财众发投资的第 <span className="font-bold text-blue-600">{daysJoined}</span> 天</p>
                </div>
                {!user.extJson?.isQualifiedInvestor && (
                    <Link to="/qualification" className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        <Shield className="w-4 h-4" /> 立即完成合格认证
                    </Link>
                )}
            </div>

            {pendingCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-700">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <span className="font-medium text-sm">当前有 {pendingCount} 笔交易正在清算中 (T+N)</span>
                    </div>
                    <button 
                        onClick={processSettlement}
                        className="bg-orange-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-orange-700 shadow-sm"
                    >
                        执行 T+1 日终结算
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start gap-4 relative z-10">
                        <div className={`p-3 rounded-full ${user.riskLevel ? 'bg-blue-100' : 'bg-amber-100'}`}>
                            <AlertTriangle className={`w-6 h-6 ${user.riskLevel ? 'text-blue-600' : 'text-amber-600'}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700">风险承受能力</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{user.riskLevelLabel || '未测评'}</p>
                            <Link to="/market" className="text-sm text-gray-400 mt-1 flex items-center hover:text-blue-600 transition-colors">
                                {user.riskLevel ? '查看匹配产品' : '立即进行测评'} <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                <Link to="/tools" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="bg-purple-100 p-3 rounded-full">
                        <Calculator className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-700">投资工具箱</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-2">复利计算 / 收益模拟</p>
                        <span className="text-purple-600 text-sm font-medium flex items-center">
                            开始计算 <ChevronRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>
                </Link>

                 <Link to="/qualification" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className={`p-3 rounded-full ${user.extJson?.isQualifiedInvestor ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Shield className={`w-6 h-6 ${user.extJson?.isQualifiedInvestor ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-700">合格投资者认证</h3>
                        <p className={`text-sm font-medium mt-1 ${user.extJson?.isQualifiedInvestor ? 'text-green-600' : 'text-red-500'}`}>
                             {user.extJson?.isQualifiedInvestor ? '已认证' : '未认证'}
                        </p>
                         <p className="text-xs text-gray-400 mt-1">
                            {user.extJson?.isQualifiedInvestor ? '享有全产品交易权限' : '交易功能受限，请先认证'}
                        </p>
                    </div>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-bold text-gray-800">最近交易记录</h3>
                    </div>
                    <Link to="/portfolio" className="text-sm text-blue-600 hover:text-blue-700">查看全部</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3">时间</th>
                                <th className="px-6 py-3">类型</th>
                                <th className="px-6 py-3">标的/说明</th>
                                <th className="px-6 py-3 text-right">金额(¥)</th>
                                <th className="px-6 py-3 text-center">状态</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        暂无交易记录
                                    </td>
                                </tr>
                            ) : (
                                [...transactions].reverse().slice(0, 5).map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">{tx.applyTime.split('T')[0]}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                tx.tradeType === 1 ? 'bg-blue-100 text-blue-700' :
                                                tx.tradeType === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {tx.tradeTypeLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {tx.fundInfo?.fundName || '账户余额'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-right">
                                            {tx.tradeType === 2 || tx.tradeType === 3 ? '+' : '-'}{tx.actualAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {tx.tradeStatus === 3 ? (
                                                <span className="text-orange-600 inline-flex items-center gap-1 text-xs bg-orange-50 px-2 py-1 rounded border border-orange-100 animate-pulse">
                                                    清算中...
                                                </span>
                                            ) : (
                                                <span className="text-green-600 inline-flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded border border-green-100">
                                                    成功
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
