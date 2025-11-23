import React, { useState, useEffect } from 'react';
import { getGeneralMarketAdvice } from '../services/geminiService';
import { MessageCircle, X, Send, Bot, WifiOff, Zap } from 'lucide-react';

const suggestedQuestions = [
    "今日市场行情如何？",
    "如何进行风险测评？",
    "推荐几款稳健型基金",
    "什么是最大回撤？",
    "最近有哪些热门板块？"
];

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
        { role: 'ai', text: '您好，我是聚财众发智能投顾助手。有关市场趋势或投资建议的问题都可以问我。' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSend = async (textOverride?: string) => {
        const textToSend = typeof textOverride === 'string' ? textOverride : input;
        if (!textToSend.trim()) return;
        
        if (typeof textOverride !== 'string') {
            setInput('');
        }
        
        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setLoading(true);

        const aiRes = await getGeneralMarketAdvice(textToSend);
        
        setMessages(prev => [...prev, { role: 'ai', text: aiRes }]);
        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center gap-2"
                >
                    <Bot className="w-6 h-6" />
                    <span className="font-semibold hidden md:inline">智能投顾</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col h-[550px] border border-gray-200 overflow-hidden transition-all">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <h3 className="font-bold">智能投顾助手</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-blue-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Offline Warning */}
                    {!isOnline && (
                        <div className="bg-red-50 text-red-600 px-4 py-2 text-xs flex items-center justify-center gap-2 border-b border-red-100 transition-all duration-300 shrink-0">
                             <WifiOff className="w-3 h-3" />
                             网络连接中断，部分功能可能受限
                        </div>
                    )}

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-3 rounded-lg rounded-bl-none shadow-sm text-sm text-gray-400 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions & Input Area */}
                    <div className="bg-white border-t border-gray-100 shrink-0">
                        {/* Quick Questions Chips */}
                        <div className="px-3 py-2 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2 bg-gray-50/50">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    disabled={loading || !isOnline}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-100 rounded-full text-xs text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm shrink-0"
                                >
                                    <Zap className="w-3 h-3" />
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input Box */}
                        <div className="p-3">
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isOnline ? "输入您的问题..." : "离线模式"}
                                    disabled={!isOnline}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                                />
                                <button 
                                    onClick={() => handleSend()}
                                    disabled={loading || !isOnline || !input.trim()}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;