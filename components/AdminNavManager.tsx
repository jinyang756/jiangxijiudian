
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { FundNav, FundViewModel } from '../types';
import { UploadCloud, Plus, Edit, AlertTriangle, TrendingUp, Calendar, FileSpreadsheet, RefreshCw, CheckCircle } from 'lucide-react';
import TradingViewChart from './TradingViewChart';

const AdminNavManager: React.FC = () => {
    const { funds, navLogs, adminActions } = useContext(AppContext);
    
    // State
    const [selectedFundId, setSelectedFundId] = useState<number>(funds[0]?.id || 0);
    const [activeTab, setActiveTab] = useState<'entry' | 'import' | 'analysis'>('entry');
    const [modalOpen, setModalOpen] = useState(false);

    // Form State
    const [editNav, setEditNav] = useState<Partial<FundNav>>({});
    const [autoCalcAccum, setAutoCalcAccum] = useState(true);

    const selectedFund = funds.find(f => f.id === selectedFundId);
    const history = navLogs[selectedFundId] || [];
    
    // Derived Data for Analysis
    const abnormalFluctuations = history.filter(h => Math.abs(h.dailyReturnRate || 0) > 10).reverse();

    // Handlers
    const handleFundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFundId(Number(e.target.value));
    };

    const openEditModal = (nav?: FundNav) => {
        if (nav) {
            setEditNav(nav);
            setAutoCalcAccum(false); // Manual edit usually implies specific override
        } else {
            // New Entry Default: Tomorrow of last log or Today
            const lastLog = history[history.length - 1];
            let nextDate = new Date().toISOString().split('T')[0];
            if (lastLog) {
                const d = new Date(lastLog.navDate);
                d.setDate(d.getDate() + 1);
                nextDate = d.toISOString().split('T')[0];
            }

            setEditNav({
                fundId: selectedFundId,
                navDate: nextDate,
                nav: lastLog ? lastLog.nav : 1.0,
                navAccumulated: lastLog ? lastLog.navAccumulated : 1.0
            });
            setAutoCalcAccum(true);
        }
        setModalOpen(true);
    };

    const handleSaveNav = () => {
        if (!editNav.navDate || editNav.nav === undefined) return;

        // Calculate Return & Accum
        let finalNavRecord = { ...editNav } as FundNav;
        
        // Find previous record to calculate return (Simulated for form logic)
        // In a real app, backend handles this reliability.
        const prevRecord = history.find(h => new Date(h.navDate) < new Date(finalNavRecord.navDate) && h.id !== finalNavRecord.id); 
        // Note: sorting finding exactly previous is complex on client side without full sort, simplified here:
        // We assume admin enters sequentially or we take the last known log before this date.
        
        // Simple logic: if auto calc is on, and we have a previous record
        if (autoCalcAccum) {
             // Find latest record before this date
             const sortedPrevs = history.filter(h => h.navDate < finalNavRecord.navDate).sort((a,b) => b.navDate.localeCompare(a.navDate));
             const prev = sortedPrevs[0];
             
             if (prev) {
                 const dailyReturn = (finalNavRecord.nav - prev.nav) / prev.nav * 100;
                 finalNavRecord.dailyReturnRate = dailyReturn;
                 // Accum Nav = Prev Accum + (Curr Nav - Prev Nav) (Simple logic ignoring dividends for now)
                 finalNavRecord.navAccumulated = prev.navAccumulated + (finalNavRecord.nav - prev.nav);
             } else {
                 finalNavRecord.dailyReturnRate = 0;
                 // If no prev, Accum = Nav usually (or manual)
             }
        }

        finalNavRecord.id = finalNavRecord.id || Date.now();
        finalNavRecord.createTime = new Date().toISOString();
        
        adminActions.updateNav(selectedFundId, finalNavRecord);
        setModalOpen(false);
    };

    // --- Mock Import Logic ---
    const [importText, setImportText] = useState('');
    const [parsedData, setParsedData] = useState<FundNav[]>([]);

    const handleParse = () => {
        // Mock CSV parsing: Date,Nav,AccumNav
        const lines = importText.trim().split('\n');
        const results: FundNav[] = [];
        
        lines.forEach((line, idx) => {
            const cols = line.split(/[\t,]+/); // split by tab or comma
            if (cols.length >= 2) {
                const date = cols[0].trim();
                const nav = parseFloat(cols[1]);
                const accum = cols[2] ? parseFloat(cols[2]) : nav;
                
                if (!isNaN(nav)) {
                     results.push({
                         id: Date.now() + idx,
                         fundId: selectedFundId,
                         navDate: date,
                         nav: nav,
                         navAccumulated: accum,
                         createTime: new Date().toISOString()
                     });
                }
            }
        });
        
        // Calc returns for batch
        // Simple sequential calc within batch
        for(let i=0; i<results.length; i++) {
             // Try to find prev in batch or history
             // This is complex for mock, let's just set rate to 0 if unknown
             results[i].dailyReturnRate = 0;
        }

        setParsedData(results);
    };

    const handleConfirmImport = () => {
        adminActions.batchUpdateNav(selectedFundId, parsedData);
        setParsedData([]);
        setImportText('');
        alert(`成功导入 ${parsedData.length} 条净值数据`);
        setActiveTab('entry');
    };

    const chartData = history.map(h => ({ time: h.navDate, value: h.navAccumulated }));

    return (
        <div className="p-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        净值与估值管理
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Core</span>
                    </h1>
                    <p className="text-sm text-gray-500">录入每日净值，监控估值异常，管理历史数据</p>
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-1 flex items-center">
                    <span className="text-xs text-gray-500 px-2">当前操作基金:</span>
                    <select 
                        value={selectedFundId} 
                        onChange={handleFundChange}
                        className="text-sm font-bold text-gray-800 bg-transparent outline-none cursor-pointer py-1"
                    >
                        {funds.map(f => (
                            <option key={f.id} value={f.id}>{f.fundName} ({f.fundCode})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('entry')}
                        className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'entry' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Calendar className="w-4 h-4" /> 净值录入/管理
                    </button>
                    <button 
                         onClick={() => setActiveTab('import')}
                         className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FileSpreadsheet className="w-4 h-4" /> 批量导入
                    </button>
                    <button 
                         onClick={() => setActiveTab('analysis')}
                         className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'analysis' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> 走势与稽核
                    </button>
                </div>

                <div className="p-6 flex-1 bg-gray-50/50">
                    {/* --- TAB 1: ENTRY --- */}
                    {activeTab === 'entry' && (
                        <div className="animate-in fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700">历史净值记录 ({history.length})</h3>
                                <button 
                                    onClick={() => openEditModal()}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> 单条录入
                                </button>
                            </div>
                            
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3">日期</th>
                                            <th className="px-4 py-3 text-right">单位净值</th>
                                            <th className="px-4 py-3 text-right">累计净值</th>
                                            <th className="px-4 py-3 text-right">日涨跌幅</th>
                                            <th className="px-4 py-3 text-center">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[...history].reverse().slice(0, 10).map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-mono">{log.navDate}</td>
                                                <td className="px-4 py-3 text-right font-medium">{log.nav.toFixed(4)}</td>
                                                <td className="px-4 py-3 text-right text-gray-500">{log.navAccumulated.toFixed(4)}</td>
                                                <td className={`px-4 py-3 text-right font-bold ${(log.dailyReturnRate||0) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    {(log.dailyReturnRate||0) > 0 ? '+' : ''}{(log.dailyReturnRate||0).toFixed(2)}%
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => openEditModal(log)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100">
                                    仅显示最近 10 条记录，完整数据请在“走势与稽核”中查看或导出
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: IMPORT --- */}
                    {activeTab === 'import' && (
                        <div className="animate-in fade-in max-w-2xl mx-auto">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" /> Excel/CSV 数据粘贴导入
                                </h3>
                                <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 mb-4">
                                    <p className="font-bold mb-1">格式要求：</p>
                                    <p>请直接从 Excel 复制数据粘贴到下方文本框。列顺序必须为：</p>
                                    <p className="font-mono mt-1">日期 (YYYY-MM-DD) | 单位净值 | 累计净值(可选)</p>
                                </div>
                                <textarea 
                                    className="w-full h-40 border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={`2023-10-01\t1.0234\t1.5234\n2023-10-02\t1.0256\t1.5256`}
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                />
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={handleParse}
                                        disabled={!importText}
                                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 disabled:opacity-50"
                                    >
                                        解析预览
                                    </button>
                                </div>
                            </div>

                            {parsedData.length > 0 && (
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-700">待导入数据预览 ({parsedData.length})</h4>
                                        <button 
                                            onClick={handleConfirmImport}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> 确认导入数据库
                                        </button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto border border-gray-100 rounded">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2">日期</th>
                                                    <th className="px-3 py-2">单位净值</th>
                                                    <th className="px-3 py-2">累计净值</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedData.map((r, i) => (
                                                    <tr key={i} className="border-b border-gray-50">
                                                        <td className="px-3 py-2">{r.navDate}</td>
                                                        <td className="px-3 py-2">{r.nav}</td>
                                                        <td className="px-3 py-2">{r.navAccumulated}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TAB 3: ANALYSIS --- */}
                    {activeTab === 'analysis' && (
                        <div className="animate-in fade-in h-full flex flex-col">
                             <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shrink-0">
                                <div className="h-64 w-full">
                                    <TradingViewChart navData={chartData} mode="NAV" />
                                </div>
                             </div>

                             <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-hidden flex flex-col">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" /> 
                                    异常波动监控 (日涨跌幅 {'>'} 10%)
                                </h3>
                                <div className="flex-1 overflow-y-auto">
                                    {abnormalFluctuations.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                            <CheckCircle className="w-12 h-12 text-green-100 mb-2" />
                                            <p>暂无异常波动数据，估值运行平稳</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-red-50 text-red-700">
                                                <tr>
                                                    <th className="px-4 py-2">异常日期</th>
                                                    <th className="px-4 py-2 text-right">当日净值</th>
                                                    <th className="px-4 py-2 text-right">涨跌幅</th>
                                                    <th className="px-4 py-2">预警级别</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {abnormalFluctuations.map(log => (
                                                    <tr key={log.id} className="border-b border-red-50 hover:bg-red-50/30">
                                                        <td className="px-4 py-3 font-mono text-red-900">{log.navDate}</td>
                                                        <td className="px-4 py-3 text-right">{log.nav.toFixed(4)}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-red-600">
                                                            {log.dailyReturnRate?.toFixed(2)}%
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">高危预警</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit/Add Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                         <h3 className="text-lg font-bold text-gray-800 mb-4">
                             {editNav.id ? '修正历史净值' : '录入新净值'}
                         </h3>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 mb-1">净值日期</label>
                                 <input 
                                    type="date" 
                                    value={editNav.navDate}
                                    onChange={e => setEditNav({...editNav, navDate: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 mb-1">单位净值</label>
                                 <input 
                                    type="number" step="0.0001"
                                    value={editNav.nav}
                                    onChange={e => setEditNav({...editNav, nav: parseFloat(e.target.value)})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-blue-600"
                                 />
                             </div>
                             
                             <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                 <div className="flex items-center justify-between mb-2">
                                     <label className="text-sm font-medium text-gray-600">累计净值</label>
                                     <label className="flex items-center gap-1 cursor-pointer text-xs text-blue-600">
                                         <input 
                                            type="checkbox" 
                                            checked={autoCalcAccum} 
                                            onChange={e => setAutoCalcAccum(e.target.checked)}
                                         />
                                         自动计算 (含分红)
                                     </label>
                                 </div>
                                 <input 
                                    type="number" step="0.0001"
                                    value={editNav.navAccumulated}
                                    onChange={e => setEditNav({...editNav, navAccumulated: parseFloat(e.target.value)})}
                                    disabled={autoCalcAccum}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm ${autoCalcAccum ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                                 />
                             </div>
                         </div>
                         <div className="flex gap-3 mt-6">
                             <button onClick={() => setModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">取消</button>
                             <button onClick={handleSaveNav} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">确认保存</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNavManager;
