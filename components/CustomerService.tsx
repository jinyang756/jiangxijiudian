
import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageCircleMore, X, Send, User, Loader2, Image as ImageIcon, Headphones, CreditCard } from 'lucide-react';
import { AppContext } from '../App';

const CustomerService: React.FC = () => {
    const { user, sendUserMessage, chatSessions } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Identify current user session
    const sessionId = user.id ? `s_${user.id}` : null;
    const currentSession = chatSessions.find(s => s.sessionId === sessionId);
    const messages = currentSession ? currentSession.messages : [];
    
    // Check unread messages from admin
    const hasUnread = currentSession?.unreadByUser;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
             scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim() || !user.id) return;
        sendUserMessage(input);
        setInput('');
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("图片大小不能超过 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            sendUserMessage('已发送图片', base64); // Send generic text with image payload
        };
        reader.readAsDataURL(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Suggested questions (FAQ Chips)
    const faqChips = [
        "充值流程咨询", "提现到账时间", "签订电子合同", "资金安全保障"
    ];

    const handleChipClick = (q: string) => {
        if (!user.id) return;
        sendUserMessage(q);
    };
    
    // 新增：专属财务服务介绍
    const financialServiceIntro = [
        "您好，我是您的专属财务顾问",
        "可为您办理充值、提现、合同签署等业务",
        "请详细说明您的需求，我将为您提供专业服务"
    ];
    
    if (!user.id) return null; // Don't show if not logged in

    return (
        <div className="fixed bottom-24 right-6 z-50 font-sans">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2 group border-4 border-white/50 hover:border-white/80 relative"
                    title="联系专属财务"
                >
                    <CreditCard className="w-7 h-7" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-semibold whitespace-nowrap pl-0 group-hover:pl-2">
                        专属财务
                    </span>
                    {hasUnread && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col h-[600px] border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300 ring-1 ring-black/5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex justify-between items-center shrink-0 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/10">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">VIP 专属财务顾问</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
                                    <p className="text-xs opacity-90 font-light">在线为您服务</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors text-white/80 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="flex-1 bg-gray-50 p-4 overflow-y-auto scroll-smooth">
                        {messages.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm space-y-3">
                                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                     <CreditCard className="w-8 h-8 text-gray-300" />
                                 </div>
                                 {financialServiceIntro.map((line, index) => (
                                     <p key={index} className={index === 0 ? "font-medium text-gray-600" : "text-gray-500"}>
                                         {line}
                                     </p>
                                 ))}
                             </div>
                        ) : (
                            <div className="space-y-5">
                                {messages.map((m) => (
                                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                                                m.sender === 'user' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-blue-600'
                                            }`}>
                                                {m.sender === 'user' ? <User className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                                            </div>
                                            <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                                {m.image ? (
                                                    <div className="mb-1">
                                                        <img src={m.image} alt="sent" className="max-w-[180px] rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(m.image)} />
                                                    </div>
                                                ) : (
                                                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                                        m.sender === 'user'
                                                            ? 'bg-gray-800 text-white rounded-tr-sm'
                                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                                    }`}>
                                                        {m.text}
                                                    </div>
                                                )}
                                                <div className={`text-[10px] text-gray-400 mt-1.5 px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                                    {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer Area */}
                    <div className="bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
                        {/* FAQ Chips */}
                        <div className="px-4 py-3 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2 bg-gray-50/50 border-b border-gray-100">
                            {faqChips.map(chip => (
                                <button
                                    key={chip}
                                    onClick={() => handleChipClick(chip)}
                                    className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm shrink-0"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4">
                            <div className="flex gap-3 relative items-end">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors mb-0.5"
                                    title="上传图片"
                                >
                                    <ImageIcon className="w-6 h-6" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageSelect}
                                />
                                <div className="flex-1 bg-gray-100 border border-transparent focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl transition-all">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="请输入咨询内容..."
                                        className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none resize-none max-h-24 block"
                                        rows={1}
                                        style={{ minHeight: '44px' }}
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 mb-0.5"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerService;
