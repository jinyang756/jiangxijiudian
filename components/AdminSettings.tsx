
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Save, AlertTriangle, Settings, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';
import { SysConfig } from '../types';

const AdminSettings: React.FC = () => {
    const { sysConfig, adminActions } = useContext(AppContext);
    const [config, setConfig] = useState<SysConfig>(sysConfig);
    const [changed, setChanged] = useState(false);

    const handleChange = (key: keyof SysConfig, val: any) => {
        setConfig(prev => ({ ...prev, [key]: val }));
        setChanged(true);
    };

    const handleFeatureChange = (key: keyof SysConfig['features'], val: boolean) => {
        setConfig(prev => ({ ...prev, features: { ...prev.features, [key]: val } }));
        setChanged(true);
    };

    const handleSave = () => {
        adminActions.updateSysConfig(config);
        setChanged(false);
        alert("系统配置已更新并生效");
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        系统全局配置
                    </h1>
                    <p className="text-sm text-gray-500">灵活调整平台规则，无需修改代码</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={!changed}
                    className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                        changed 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <Save className="w-4 h-4" /> 保存配置
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Rules */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <DollarSign className="w-5 h-5 text-green-600" /> 基础费率规则
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">默认申购费率</label>
                            <input 
                                type="number" step="0.0001"
                                value={config.defaultSubFee}
                                onChange={e => handleChange('defaultSubFee', parseFloat(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">例如: 0.015 代表 1.5%</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">默认赎回费率</label>
                            <input 
                                type="number" step="0.0001"
                                value={config.defaultRedeemFee}
                                onChange={e => handleChange('defaultRedeemFee', parseFloat(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">大额交易阈值 (CNY)</label>
                            <input 
                                type="number"
                                value={config.largeTxThreshold}
                                onChange={e => handleChange('largeTxThreshold', parseInt(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-orange-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Rules */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <Settings className="w-5 h-5 text-blue-600" /> 业务规则 & 功能开关
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">小额交易自动审核</label>
                                <p className="text-xs text-gray-500">低于阈值的交易自动通过</p>
                            </div>
                            <button onClick={() => handleChange('enableAutoAudit', !config.enableAutoAudit)} className="text-blue-600">
                                {config.enableAutoAudit ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                            </button>
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">定投功能 (SIP)</label>
                                <p className="text-xs text-gray-500">前端显示定投入口</p>
                            </div>
                            <button onClick={() => handleFeatureChange('enableSIP', !config.features.enableSIP)} className="text-blue-600">
                                {config.features.enableSIP ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">分红功能</label>
                                <p className="text-xs text-gray-500">开启分红模块及记录</p>
                            </div>
                            <button onClick={() => handleFeatureChange('enableDividend', !config.features.enableDividend)} className="text-blue-600">
                                {config.features.enableDividend ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">净值更新频率</label>
                            <select 
                                value={config.navUpdateFreq}
                                onChange={e => handleChange('navUpdateFreq', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                            >
                                <option value="daily">每日 (Daily)</option>
                                <option value="weekly">每周 (Weekly)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Risk Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" /> 风控预警阈值
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">净值单日波动预警 (%)</label>
                        <div className="flex items-center gap-2">
                             <input 
                                type="number"
                                value={config.riskAlertThreshold}
                                onChange={e => handleChange('riskAlertThreshold', parseFloat(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                            <span className="text-sm text-gray-500">%</span>
                        </div>
                        <p className="text-xs text-red-500 mt-2">当录入净值涨跌幅超过此值时，系统将标记为异常并在报表中高亮。</p>
                    </div>
                </div>
                
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        平台基础信息
                    </h3>
                    <div>
                         <label className="block text-sm font-medium text-gray-600 mb-1">平台名称</label>
                         <input 
                            type="text"
                            value={config.platformName}
                            onChange={e => handleChange('platformName', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
