
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { Search, MessageSquare, User, Send, Clock, Circle, TrendingUp, ShieldCheck, History, CreditCard } from 'lucide-react';

const AdminCustomerService: React.FC = () => {
    const { chatSessions, adminActions, managedUsers, transactions } = useContext(AppContext);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const selectedSession = chatSessions.find(s => s.sessionId === selectedSessionId);
    
    // Get detailed user info for sidebar
    const activeUser = selectedSession ? managedUsers.find(u => u.id === selectedSession.userId) : null;
    const recentTxs = activeUser ? transactions.filter(t => t.userId === activeUser.id).slice(0, 3) : [];

    // Filter sessions
    const filteredSessions = chatSessions.filter(s => 
        s.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.userId.toString().includes(searchTerm)
    ).sort((a, b) => new Date(b.lastActiveTime).getTime() - new Date(a.lastActiveTime).getTime());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        if (selectedSessionId) {
            // Mark as read when opening
             if (selectedSession?.unreadByAdmin) {
                 adminActions.markSessionRead(selectedSessionId);
             }
        }
    }, [selectedSessionId, selectedSession?.messages]);

    const handleSendReply = () => {
        if (!selectedSessionId || !replyText.trim()) return;
        adminActions.sendAdminMessage(selectedSessionId, replyText);
        setReplyText('');
    };

    // Canned responses
    const quickReplies = [
        "您好，请问有什么可以帮您？",
        "请提供一下您的相关截图，以便我们排查问题。",
        "资金提现通常在T+1日到账，请您耐心等待。",
        "感谢您的咨询，祝您投资顺利！"
    ];

    return (
        <div className="flex h-full bg-white border-t border-gray-200">
            {/* Left Sidebar: Session List */}
            <div className="w-72 border-r border-gray-200 flex flex-col bg-gray-50 shrink-0">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" /> 客服会话
                    </h2>
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input 
                            type="text" 
                            placeholder="搜索用户..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {filteredSessions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">暂无活跃会话</div>
                    ) : (
                        filteredSessions.map(session => (
                            <div 
                                key={session.sessionId}
                                onClick={() => setSelectedSessionId(session.sessionId)}
                                className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-white transition-colors flex items-start gap-3 ${
                                    selectedSessionId === session.sessionId ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                                }`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    {session.unreadByAdmin && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`text-sm font-medium truncate ${session.unreadByAdmin ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                                            {session.userName}
                                        </h4>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(session.lastActiveTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${session.unreadByAdmin ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                        {session.messages[session.messages.length - 1]?.text || '无消息'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Middle Main: Chat Area */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {selectedSessionId && selectedSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    {selectedSession.userName}
                                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">ID: {selectedSession.userId}</span>
                                </h3>
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                    <Circle className="w-2 h-2 fill-current" /> 在线
                                </p>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                            {selectedSession.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex flex-col max-w-[70%] ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                                        {msg.image ? (
                                            <div className="mb-1">
                                                <img src={msg.image} alt="user upload" className="max-w-[200px] rounded-lg border border-gray-300 shadow-sm cursor-pointer" onClick={() => window.open(msg.image)} />
                                            </div>
                                        ) : (
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                                msg.sender === 'agent' 
                                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                            }`}>
                                                {msg.text}
                                            </div>
                                        )}
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
                                {quickReplies.map((reply, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setReplyText(reply)}
                                        className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                    placeholder="输入回复内容..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button 
                                    onClick={handleSendReply}
                                    disabled={!replyText.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" /> 发送
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                        <p>请选择左侧会话开始接待</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar: User Profile Info */}
            {activeUser && (
                <div className="w-64 border-l border-gray-200 bg-white p-4 flex flex-col shrink-0 h-full overflow-y-auto">
                    <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide border-b border-gray-100 pb-2">用户画像</h3>
                    
                    <div className="mb-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{activeUser.realName}</p>
                                <p className="text-xs text-gray-500">{activeUser.extJson?.phone || '无手机号'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <p className="text-[10px] text-gray-400">风险等级</p>
                                <p className={`text-sm font-bold ${activeUser.riskLevel ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {activeUser.riskLevelLabel?.split(' ')[0] || '未测评'}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <p className="text-[10px] text-gray-400">投资者认证</p>
                                <p className={`text-sm font-bold ${activeUser.extJson?.isQualifiedInvestor ? 'text-green-600' : 'text-gray-400'}`}>
                                    {activeUser.extJson?.isQualifiedInvestor ? '已认证' : '未认证'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> 资产概览
                        </h4>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1">账户总资产</p>
                            <p className="text-lg font-bold text-blue-800">
                                ¥{activeUser.accountBalance.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-1">
                            <History className="w-3 h-3" /> 最近交易
                        </h4>
                        {recentTxs.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-2">暂无近期交易</p>
                        ) : (
                            <div className="space-y-2">
                                {recentTxs.map(tx => (
                                    <div key={tx.id} className="text-xs border border-gray-100 rounded p-2 bg-gray-50">
                                        <div className="flex justify-between mb-1">
                                            <span className={`font-medium ${tx.tradeType === 1 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                {tx.tradeTypeLabel}
                                            </span>
                                            <span className="text-gray-400">{tx.applyTime.substring(5,10)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span className="truncate w-24">{tx.fundInfo?.fundName || '余额充值'}</span>
                                            <span className="font-mono">¥{tx.tradeAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomerService;
