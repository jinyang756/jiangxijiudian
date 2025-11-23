
import React, { useState } from 'react';
import { Calculator, TrendingUp, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Tools: React.FC = () => {
    const [principal, setPrincipal] = useState(100000);
    const [annualContribution, setAnnualContribution] = useState(50000);
    const [rate, setRate] = useState(8);
    const [years, setYears] = useState(10);
    const [data, setData] = useState<any[]>([]);

    const calculate = () => {
        let current = principal;
        const result = [];
        for (let i = 0; i <= years; i++) {
            result.push({
                year: `第${i}年`,
                amount: Math.round(current),
                principal: Math.round(principal + annualContribution * i)
            });
            current = current * (1 + rate / 100) + annualContribution;
        }
        setData(result);
    };

    // Auto calc on mount or change
    React.useEffect(() => {
        calculate();
    }, [principal, annualContribution, rate, years]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                投资工具箱
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calculator Input */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        复利计算器
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">初始本金 (元)</label>
                            <input 
                                type="number" 
                                value={principal}
                                onChange={e => setPrincipal(Number(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">每年追加投入 (元)</label>
                            <input 
                                type="number" 
                                value={annualContribution}
                                onChange={e => setAnnualContribution(Number(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">预期年化收益率 (%)</label>
                            <input 
                                type="number" 
                                value={rate}
                                onChange={e => setRate(Number(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input 
                                type="range" 
                                min="1" max="20" 
                                value={rate}
                                onChange={e => setRate(Number(e.target.value))}
                                className="w-full mt-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">投资年限 (年)</label>
                            <input 
                                type="number" 
                                value={years}
                                onChange={e => setYears(Number(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">期末总资产</span>
                            <span className="font-bold text-xl text-blue-600">
                                {data[data.length - 1]?.amount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">累计投入本金</span>
                            <span className="text-gray-700">
                                {data[data.length - 1]?.principal.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">投资收益</span>
                            <span className="text-green-600 font-medium">
                                +{(data[data.length - 1]?.amount - data[data.length - 1]?.principal).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chart Result */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold mb-6">资产增长趋势图</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                                <XAxis dataKey="year" tick={{fontSize: 12}} />
                                <YAxis tick={{fontSize: 12}} tickFormatter={val => `${val/10000}万`} />
                                <Tooltip 
                                    formatter={(val: number) => `¥${val.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} name="总资产" dot={false} />
                                <Line type="monotone" dataKey="principal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="投入本金" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-xs text-gray-400 text-center">
                        * 此计算器仅用于模拟复利效应，不代表实际投资收益，投资有风险。
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tools;
