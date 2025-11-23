
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Play, Users, Database, FileInput, Activity, RefreshCw } from 'lucide-react';

const AdminSimulation: React.FC = () => {
    const { adminActions, funds } = useContext(AppContext);
    const [generating, setGenerating] = useState<string | null>(null);

    // Mock Generators
    const runGen = (type: string, fn: () => void) => {
        setGenerating(type);
        setTimeout(() => {
            fn();
            setGenerating(null);
        }, 1500);
    };

    return (
        <div className="p-6">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        系统测试沙箱
                    </h1>
                    <p className="text-sm text-gray-500">快速搭建测试环境，批量生成数据，回测策略</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* User Gen */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                        <Users className="w-6 h-6" />
                        <h3 className="font-bold">生成测试用户</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 h-10">
                        批量创建带随机余额和持仓的虚拟用户，用于压力测试和报表统计。
                    </p>
                    <button 
                        onClick={() => runGen('user', () => adminActions.generateMockUsers(10))}
                        disabled={!!generating}
                        className="w-full bg-blue-50 text-blue-600 border border-blue-100 py-2 rounded-lg font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                    >
                        {generating === 'user' ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4" />}
                        生成 10 个用户
                    </button>
                </div>

                {/* Tx Gen */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4 text-orange-600">
                        <FileInput className="w-6 h-6" />
                        <h3 className="font-bold">生成随机交易</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 h-10">
                        随机生成申购、赎回流水，测试清算逻辑及大额预警功能。
                    </p>
                     <button 
                        onClick={() => runGen('tx', () => adminActions.generateMockTransactions(20))}
                        disabled={!!generating}
                        className="w-full bg-orange-50 text-orange-600 border border-orange-100 py-2 rounded-lg font-medium hover:bg-orange-100 flex items-center justify-center gap-2"
                    >
                         {generating === 'tx' ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4" />}
                        生成 20 笔交易
                    </button>
                </div>

                {/* NAV Gen */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4 text-purple-600">
                        <Activity className="w-6 h-6" />
                        <h3 className="font-bold">净值走势补全</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 h-10">
                        为所有基金补全最近30天的净值走势数据 (基于布朗运动模型)。
                    </p>
                     <button 
                        onClick={() => runGen('nav', () => {
                            // Actually this logic is in App init, here we simulate a re-gen
                            alert("净值数据已重置");
                        })}
                        disabled={!!generating}
                        className="w-full bg-purple-50 text-purple-600 border border-purple-100 py-2 rounded-lg font-medium hover:bg-purple-100 flex items-center justify-center gap-2"
                    >
                        {generating === 'nav' ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4" />}
                        重置净值数据
                    </button>
                </div>
            </div>

            {/* Backtest Monitor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-gray-600" /> 策略回测任务监控
                </h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-4 py-3">任务 ID</th>
                            <th className="px-4 py-3">用户</th>
                            <th className="px-4 py-3">策略类型</th>
                            <th className="px-4 py-3">状态</th>
                            <th className="px-4 py-3">耗时</th>
                            <th className="px-4 py-3">进度</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[1,2,3].map(i => (
                            <tr key={i}>
                                <td className="px-4 py-3 font-mono">TASK-{1000+i}</td>
                                <td className="px-4 py-3">User-{200+i}</td>
                                <td className="px-4 py-3">{i===1 ? '网格交易' : i===2 ? '定投回测' : '均线策略'}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs ${i===1 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {i===1 ? '已完成' : '运行中'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{i*1.5}s</td>
                                <td className="px-4 py-3">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: i===1 ? '100%' : '60%' }}></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSimulation;
