
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { Lock, Phone, ArrowRight, ShieldCheck, FileText, CheckCircle, Shield, Eye, EyeOff, RefreshCw } from 'lucide-react';

const Login: React.FC = () => {
    const { login, user } = useContext(AppContext);
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState(''); // Serves as password
    const [loading, setLoading] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Captcha State
    const [captchaCode, setCaptchaCode] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Legal Modal State
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'service' | 'privacy'>('service');
    const [legalAgreed, setLegalAgreed] = useState(false);
    const [dontRemind, setDontRemind] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        const skipLegal = localStorage.getItem('jucai_skip_legal_modal');
        if (skipLegal !== 'true') {
            setShowLegalModal(true);
        }
        refreshCaptcha();
    }, []);

    // Check if user is already logged in
    useEffect(() => {
        if (user && user.extJson?.phone) {
             navigate(user.userType === 1 ? '/admin/dashboard' : '/');
        }
    }, [user, navigate]);

    // --- Captcha Logic ---
    const generateRandomString = (length: number) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Remove confusing chars like I, 1, 0, O
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const refreshCaptcha = () => {
        const newCode = generateRandomString(4);
        setCaptchaCode(newCode);
        // Use setTimeout to ensure canvas is rendered if toggling modes
        setTimeout(() => drawCaptcha(newCode), 0);
        setCaptchaInput('');
    };

    const drawCaptcha = (text: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text
        ctx.font = 'bold 24px sans-serif';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < text.length; i++) {
            const x = 20 + i * 20;
            const y = canvas.height / 2;
            const angle = (Math.random() - 0.5) * 0.4; // Random rotation
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = `rgb(${Math.random()*100}, ${Math.random()*100}, ${Math.random()*100})`;
            ctx.fillText(text[i], -8, 0);
            ctx.restore();
        }

        // Noise Lines
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = `rgba(${Math.random()*200}, ${Math.random()*200}, ${Math.random()*200}, 0.5)`;
            ctx.stroke();
        }

        // Noise Dots
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = `rgba(${Math.random()*200}, ${Math.random()*200}, ${Math.random()*200}, 0.6)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
            ctx.fill();
        }
    };

    // --- Phone Formatting ---
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (val.length > 11) val = val.slice(0, 11);
        
        // Format 3-4-4 (e.g., 138 0000 0000)
        if (val.length > 3 && val.length <= 7) {
            val = `${val.slice(0, 3)} ${val.slice(3)}`;
        } else if (val.length > 7) {
            val = `${val.slice(0, 3)} ${val.slice(3, 7)} ${val.slice(7)}`;
        }
        setPhone(val);
    };

    const handleLegalConfirm = () => {
        if (!legalAgreed) return;
        if (dontRemind) {
            localStorage.setItem('jucai_skip_legal_modal', 'true');
        } else {
            localStorage.removeItem('jucai_skip_legal_modal');
        }
        setShowLegalModal(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const skipLegal = localStorage.getItem('jucai_skip_legal_modal');
        if (!skipLegal && showLegalModal) return;

        const cleanPhone = phone.replace(/\s/g, '');

        // Basic Validation
        if (!cleanPhone) {
            alert(isAdminMode ? "请输入管理员账号" : "请输入手机号码");
            return;
        }
        if (!code) {
            alert("请输入密码");
            return;
        }
        
        if (!isAdminMode && cleanPhone.length !== 11) {
            alert("请输入有效的11位手机号码");
            return;
        }

        // Captcha Validation
        if (captchaInput.toUpperCase() !== captchaCode) {
            alert("图形验证码错误，请重新输入");
            refreshCaptcha();
            return;
        }
        
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            if (isAdminMode) {
                // Mock admin credential check
                if (cleanPhone === 'admin' && code === 'admin') {
                     login('admin', true);
                     navigate('/admin/dashboard');
                } else {
                    alert('管理员账号或密码错误 (默认账号: admin / admin)');
                    refreshCaptcha();
                }
            } else {
                login(cleanPhone, false);
                navigate('/');
            }
            setLoading(false);
        }, 1000);
    };

    // --- Legal Texts ---
    const ServiceAgreement = (
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed h-full">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                 <span className="font-bold text-gray-800">武汉聚财众发私募基金管理有限公司</span>
                 <span className="font-mono text-xs text-gray-400">版本：2025-V1.0</span>
            </div>
            
            <h4 className="font-bold text-gray-800">1. 协议确认与接纳</h4>
            <p>
                欢迎您使用武汉聚财众发私募基金管理有限公司（以下简称“本公司”或“聚财众发”）提供的基金交易系统服务。
                本公司系依据《中华人民共和国证券投资基金法》及相关法律法规设立的私募基金管理机构（统一社会信用代码：91420100MAEC200T12）。
                <strong>当您注册、登录或使用本系统时，即视为您已充分阅读、理解并同意本协议的全部内容。</strong>
            </p>

            <h4 className="font-bold text-gray-800 mt-4">2. 合格投资者承诺</h4>
            <p>
                依据《私募投资基金监督管理暂行办法》，本平台产品仅面向符合特定条件的“合格投资者”展示及销售。
                您在继续使用前，必须承诺符合以下合格投资者标准之一：
                <ul className="list-disc pl-5 mt-1 space-y-1 bg-gray-50 p-2 rounded-lg">
                    <li>金融资产不低于300万元（包括银行存款、股票、债券、基金份额、理财计划等）；</li>
                    <li>最近三年个人年均收入不低于50万元。</li>
                </ul>
                您保证向本公司提供的资产证明文件及身份信息真实、准确、完整、有效。
            </p>

            <h4 className="font-bold text-gray-800 mt-4">3. 风险揭示（重要）</h4>
            <p>
                <strong>私募基金投资属于高风险投资活动。</strong>
                本公司作为基金管理人，将依照恪尽职守、诚实信用、谨慎勤勉的原则管理和运用基金财产，但不保证基金财产一定盈利，也不保证最低收益。
                基金的过往业绩不代表未来表现。您在做出投资决策前，应仔细阅读基金合同、风险揭示书等法律文件，充分认识投资风险，并自行承担投资损失。
            </p>

            <h4 className="font-bold text-gray-800 mt-4">4. 账户安全与管理</h4>
            <p>
                您应妥善保管您的交易账号、密码及动态验证码。任何使用您账号进行的操作（包括但不限于产品申购、赎回、份额确认）均视为您本人的真实意思表示。
                如发现账号异常或被盗用，请立即联系本公司客服（地址：湖北省武汉市武汉经济技术开发区12C2地块武汉经开万达广场B区S5-1栋19层B1-19室）。
            </p>
            
             <h4 className="font-bold text-gray-800 mt-4">5. 协议修改与终止</h4>
            <p>
                本公司有权根据法律法规变化或业务发展需要修改本协议。修改后的协议将在本系统公告，自公告之日起生效。如您不同意修改，应立即停止使用本服务。
            </p>
        </div>
    );

    const PrivacyPolicy = (
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed h-full">
             <div className="border-b border-gray-100 pb-2 mb-4">
                 <p className="text-gray-800 font-medium">隐私政策摘要</p>
            </div>
            <p>武汉聚财众发私募基金管理有限公司（以下简称“我们”）非常重视您的隐私及个人信息保护。我们将严格遵守《中华人民共和国个人信息保护法》等相关法律法规。</p>

            <h4 className="font-bold text-gray-800 mt-4">1. 我们收集的信息范围</h4>
            <p>
                为履行反洗钱义务、合格投资者认定及提供交易服务，我们需要收集您的以下信息：
                <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>身份信息：</strong>姓名、身份证件号码、证件有效期、证件照片；</li>
                    <li><strong>联系方式：</strong>手机号码、通讯地址、电子邮箱；</li>
                    <li><strong>财产证明：</strong>银行流水、证券账户资产证明、收入证明等（用于合格投资者认定）；</li>
                    <li><strong>交易记录：</strong>风险测评记录、基金交易流水、资金进出记录。</li>
                </ul>
            </p>

            <h4 className="font-bold text-gray-800 mt-4">2. 信息使用用途</h4>
            <p>
                您的个人信息将仅用于以下合法目的：
                (1) 进行投资者适当性管理与风险承受能力评估；
                (2) 办理基金份额的登记、确权与过户；
                (3) 依照法律法规要求向监管部门（如中国证券投资基金业协会）进行必要的数据报送；
                (4) 向您发送交易确认单、资产净值披露报告及分红通知。
            </p>

            <h4 className="font-bold text-gray-800 mt-4">3. 信息存储与安全保障</h4>
            <p>
                我们将您的个人信息存储于中国境内的加密服务器中，并采用SSL/TLS加密技术保障数据传输安全。
                除法律法规强制规定或监管要求外，我们承诺不会向任何无关第三方出售、出租或提供您的个人信息。
                我们将保存您的交易记录至少20年，以符合《证券投资基金法》的要求。
            </p>

            <h4 className="font-bold text-gray-800 mt-4">4. 联系我们</h4>
            <p>
                如您对本隐私政策有任何疑问，或需要行使查阅、更正、删除个人信息的权利，请通过以下方式联系我们：
                <br/><strong>法定代表人：</strong>赖泳锋
                <br/><strong>联系地址：</strong>湖北省武汉市武汉经济技术开发区12C2地块武汉经开万达广场B区S5-1栋19层B1-19室
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            
            {/* Login Form Container */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md z-0">
                <div className={`flex justify-center mb-4 transition-colors ${isAdminMode ? 'text-gray-800' : 'text-blue-600'}`}>
                   {isAdminMode ? <Shield className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isAdminMode ? '后台管理系统' : (isRegister ? '注册聚财众发账户' : '登录交易系统')}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isAdminMode ? '仅限授权人员访问' : '专业 · 稳健 · 合规'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-0">
                <div className={`bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 ${isAdminMode ? 'border-gray-800' : 'border-blue-600'}`}>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                {isAdminMode ? '管理员账号' : '手机号码'}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="phone"
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                                    placeholder={isAdminMode ? "admin" : "请输入11位手机号"}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                {isAdminMode ? '密码' : (isRegister ? '设置密码' : '登录密码')}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="code"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                                    placeholder={isAdminMode ? "请输入密码" : "请输入登录密码"}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">
                                图形验证码
                            </label>
                            <div className="mt-1 flex gap-3">
                                <input
                                    id="captcha"
                                    type="text"
                                    required
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2.5 border px-3"
                                    placeholder="不区分大小写"
                                />
                                <div className="relative shrink-0 group cursor-pointer select-none" onClick={refreshCaptcha} title="点击刷新">
                                    <canvas ref={canvasRef} width="100" height="42" className="rounded-md border border-gray-200 bg-gray-50"></canvas>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 rounded-md transition-opacity">
                                        <RefreshCw className="w-4 h-4 text-gray-700" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    记住我
                                </label>
                            </div>

                            <div className="text-sm">
                                <button type="button" className="font-medium text-blue-600 hover:text-blue-500">
                                    忘记密码?
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 transition-colors ${
                                    isAdminMode 
                                    ? 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-600' 
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                }`}
                            >
                                {loading ? '安全验证中...' : (isAdminMode ? '进入后台' : (isRegister ? '立即注册' : '登录'))}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    {isAdminMode ? '返回用户端' : (isRegister ? '已有账号？' : '还没有账号？')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            {!isAdminMode ? (
                                <>
                                    <button
                                        onClick={() => { setIsRegister(!isRegister); refreshCaptcha(); }}
                                        className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        {isRegister ? '去登录' : '注册新账户'} <ArrowRight className="ml-2 h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => { setIsAdminMode(true); refreshCaptcha(); }}
                                        className="mt-2 text-xs text-center text-gray-400 hover:text-gray-600 hover:underline"
                                    >
                                        管理员入口
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { setIsAdminMode(false); refreshCaptcha(); }}
                                    className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    返回投资者登录
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center text-xs text-gray-400">
                        <p>武汉聚财众发私募基金管理有限公司</p>
                        <p className="mt-1">基金管理人登记编号：P1072839</p>
                    </div>
                </div>
            </div>

            {/* Legal Modal Overlay */}
            {showLegalModal && !isAdminMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                用户服务协议与隐私政策
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                欢迎使用聚财众发交易系统。为了保障您的合法权益，请在登录前仔细阅读并同意以下条款。
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('service')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'service' 
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                用户服务协议
                            </button>
                            <button
                                onClick={() => setActiveTab('privacy')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'privacy' 
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                隐私政策
                            </button>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {activeTab === 'service' ? ServiceAgreement : PrivacyPolicy}
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none group">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={legalAgreed}
                                            onChange={(e) => setLegalAgreed(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-blue-600 checked:bg-blue-600 focus:outline-none transition-all"
                                        />
                                        <CheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                                    </div>
                                    <span className={`text-sm ${legalAgreed ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                                        我已阅读并同意《用户服务协议》及《隐私政策》
                                    </span>
                                </label>
                                
                                <label className="flex items-center gap-2 cursor-pointer select-none ml-0.5">
                                    <input 
                                        type="checkbox" 
                                        checked={dontRemind}
                                        onChange={(e) => setDontRemind(e.target.checked)}
                                        className="h-4 w-4 text-gray-500 rounded border-gray-300 focus:ring-gray-400"
                                    />
                                    <span className="text-xs text-gray-500">
                                        下次不再自动弹窗提示（我已充分知晓相关风险）
                                    </span>
                                </label>

                                <button 
                                    onClick={handleLegalConfirm}
                                    disabled={!legalAgreed}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all mt-2 ${
                                        legalAgreed 
                                            ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' 
                                            : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    {legalAgreed ? '确认并继续登录' : '请先阅读并勾选同意'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
