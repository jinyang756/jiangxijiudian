
import React, { useState, useEffect, useContext } from 'react';
import { Building2, TrendingUp, ShieldCheck, Award, ChevronRight, Menu, X, LogIn, Newspaper, MapPin, CreditCard, User, RefreshCw, ExternalLink, Target, Lightbulb, HeartHandshake, LayoutDashboard, Phone, Mail, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewsItem } from '../types';
import { fetchMarketNews } from '../services/newsService';
import CustomerService from './CustomerService';
import { AppContext } from '../App';

const OfficialSite: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useContext(AppContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);

    // Legal Modal State
    const [legalModalOpen, setLegalModalOpen] = useState(false);
    const [legalTitle, setLegalTitle] = useState('');
    const [legalContent, setLegalContent] = useState<React.ReactNode>(null);

    const isLoggedIn = !!user.extJson?.phone;
    const dashboardPath = user.userType === 1 ? '/admin/dashboard' : '/';
    const buttonText = isLoggedIn ? (user.userType === 1 ? '进入管理后台' : '进入交易账户') : '登录交易系统';

    // Company Constants
    const COMPANY_INFO = {
        name: "武汉聚财众发私募基金管理有限公司",
        code: "91420100MAEC200T12",
        amacId: "P1072839",
        capital: "1000万人民币",
        rep: "赖泳锋",
        address: "湖北省武汉市武汉经济技术开发区12C2地块武汉经开万达广场B区S5-1栋19层B1-19室",
        phone: "027-84239999",
        email: "service@jucaizhongfa.com",
        icp: "鄂ICP备20250088号-1",
        police: "鄂公网安备 42011302000128号"
    };

    const loadNews = async () => {
        setLoadingNews(true);
        try {
            const data = await fetchMarketNews();
            setNews(data);
        } catch (e) {
            console.error("Failed to load news", e);
        } finally {
            setLoadingNews(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const handleNav = (path: string) => {
        setMobileMenuOpen(false);
        navigate(path);
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle Footer Legal Links
    const openLegalModal = (e: React.MouseEvent, type: string) => {
        e.preventDefault();
        setLegalTitle(type);
        
        let content;
        switch(type) {
            case '合格投资者认定':
                content = (
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <p>根据《私募投资基金监督管理暂行办法》之规定，私募基金的合格投资者是指具备相应风险识别能力和风险承担能力，投资于单只私募基金的金额不低于100万元且符合下列相关标准的单位和个人：</p>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <ul className="list-disc pl-5 space-y-2 text-blue-800">
                                <li><strong>机构投资者：</strong>净资产不低于1000万元的单位；</li>
                                <li><strong>个人投资者：</strong>金融资产不低于300万元或者最近三年个人年均收入不低于50万元。</li>
                            </ul>
                        </div>
                        <p>前款所称金融资产包括银行存款、股票、债券、基金份额、资产管理计划、银行理财产品、信托计划、保险产品、期货权益等。</p>
                    </div>
                );
                break;
            case '反洗钱公告':
                content = (
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <p>武汉聚财众发私募基金管理有限公司（以下简称“本公司”）严格遵守《中华人民共和国反洗钱法》、《金融机构反洗钱规定》等法律法规，履行反洗钱义务。</p>
                        <h4 className="font-bold text-gray-800">1. 客户身份识别</h4>
                        <p>在与客户建立业务关系时，我们将依法核对客户的有效身份证件，登记客户身份基本信息，并留存有效身份证件的复印件或影印件。对于代理他人办理业务的，我们将同时核对代理人和被代理人的身份证件。</p>
                        <h4 className="font-bold text-gray-800">2. 客户资料保存</h4>
                        <p>我们将妥善保存客户身份资料和交易记录。客户身份资料在业务关系结束后、交易记录在交易结束后，至少保存20年。</p>
                        <h4 className="font-bold text-gray-800">3. 大额与可疑交易报告</h4>
                        <p>本公司建立了大额交易和可疑交易监测系统，对于符合标准的交易将依法向中国反洗钱监测分析中心报告。</p>
                        <p className="text-xs text-gray-500 mt-2">请广大投资者配合本公司的反洗钱工作，提供真实、准确、完整的身份信息及资料。如您拒绝提供有效身份证件或身份证明文件，本公司有权拒绝为您办理业务。</p>
                    </div>
                );
                break;
            case '风险揭示书':
                content = (
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-3 text-orange-800 font-medium">
                            重要提示：私募基金投资属于高风险投资活动。基金财产不保证本金，可能面临亏损。
                        </div>
                        <h4 className="font-bold text-gray-800">一、特殊风险</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>基金合同与中国基金业协会合同指引不一致所涉风险；</li>
                            <li>基金未托管所涉风险（如适用）；</li>
                            <li>基金委托募集所涉风险；</li>
                            <li>外包事项所涉风险。</li>
                        </ul>
                        <h4 className="font-bold text-gray-800">二、一般风险</h4>
                        <p>包括但不限于资金损失风险、基金运营风险、流动性风险、募集失败风险、投资标的风险、税收风险等。</p>
                        <p>投资者在做出投资决策前，应仔细阅读基金合同、风险揭示书等法律文件，充分认识投资风险，并自行承担投资损失。</p>
                    </div>
                );
                break;
            case '隐私政策':
                content = (
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <p>我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。</p>
                        <h4 className="font-bold text-gray-800">1. 信息收集</h4>
                        <p>我们仅收集为了提供投资服务所必需的信息，包括姓名、证件号码、联系方式、资产证明、银行账户信息等。</p>
                        <h4 className="font-bold text-gray-800">2. 信息使用</h4>
                        <p>您的信息将用于合格投资者认定、基金份额登记、分红派息、客户服务及监管报送。</p>
                        <h4 className="font-bold text-gray-800">3. 信息保护</h4>
                        <p>我们采用业界领先的安全技术（如SSL加密、数据脱敏）防止信息泄露。除法律法规规定或监管要求外，我们不会向任何第三方出售或提供您的个人信息。</p>
                    </div>
                );
                break;
            default:
                content = <p>内容加载中...</p>;
        }
        setLegalContent(content);
        setLegalModalOpen(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Include Customer Service Button */}
            <CustomerService />

            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <Building2 className="w-8 h-8 text-blue-700 mr-2" />
                            <span className="font-bold text-xl text-gray-900 tracking-tight">聚财众发</span>
                        </div>
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#" onClick={(e) => scrollToSection(e, 'hero')} className="text-gray-600 hover:text-blue-600 font-medium">首页</a>
                            <a href="#profile" onClick={(e) => scrollToSection(e, 'profile')} className="text-gray-600 hover:text-blue-600 font-medium">公司简介</a>
                            <a href="#strategy" onClick={(e) => scrollToSection(e, 'strategy')} className="text-gray-600 hover:text-blue-600 font-medium">业务范围</a>
                            <a href="#news" onClick={(e) => scrollToSection(e, 'news')} className="text-gray-600 hover:text-blue-600 font-medium">市场观点</a>
                            <button 
                                onClick={() => navigate(isLoggedIn ? dashboardPath : '/login')}
                                className={`px-5 py-2 rounded-full font-medium transition-colors flex items-center gap-2 shadow-md ${
                                    isLoggedIn 
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                }`}
                            >
                                {isLoggedIn ? <LayoutDashboard className="w-4 h-4" /> : <LogIn className="w-4 h-4" />} 
                                {buttonText}
                            </button>
                        </div>
                        {/* Mobile Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 p-2">
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t absolute w-full shadow-xl z-50">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <a href="#" onClick={(e) => scrollToSection(e, 'hero')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">首页</a>
                            <a href="#profile" onClick={(e) => scrollToSection(e, 'profile')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">公司简介</a>
                            <a href="#strategy" onClick={(e) => scrollToSection(e, 'strategy')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">业务范围</a>
                            <a href="#news" onClick={(e) => scrollToSection(e, 'news')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">市场观点</a>
                            <button 
                                onClick={() => handleNav(isLoggedIn ? dashboardPath : '/login')}
                                className={`w-full mt-4 px-5 py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-white ${
                                    isLoggedIn ? 'bg-green-600' : 'bg-blue-600'
                                }`}
                            >
                                {isLoggedIn ? <LayoutDashboard className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                                {buttonText}
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div id="hero" className="relative bg-blue-900 text-white py-20 md:py-32 px-6 overflow-hidden scroll-mt-20">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                <div className="relative max-w-7xl mx-auto text-center md:text-left z-10">
                    <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        专业私募 <br/>
                        <span className="text-blue-400">稳健致远</span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed">
                        {COMPANY_INFO.name}，专注股权投资与资产管理，致力于为投资者创造长期可持续的价值回报。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button 
                            onClick={() => navigate(isLoggedIn ? dashboardPath : '/login')} 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                        >
                            {buttonText} <ChevronRight className="w-5 h-5" />
                        </button>
                        <a href="#profile" onClick={(e) => scrollToSection(e, 'profile')} className="border border-blue-300/30 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center cursor-pointer">
                            了解我们
                        </a>
                    </div>
                </div>
            </div>

            {/* Data Highlights */}
            <div className="bg-white py-12 border-b border-gray-100 -mt-8 relative z-20 shadow-sm rounded-t-3xl md:rounded-none mx-4 md:mx-0">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
                    <div>
                        <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1000万</p>
                        <p className="text-gray-500 text-sm">注册资本 (人民币)</p>
                    </div>
                    <div>
                        <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">2025年</p>
                        <p className="text-gray-500 text-sm">公司成立时间</p>
                    </div>
                    <div>
                        <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">专业</p>
                        <p className="text-gray-500 text-sm">核心管理团队</p>
                    </div>
                    <div>
                        <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">合规</p>
                        <p className="text-gray-500 text-sm">严格风控体系</p>
                    </div>
                </div>
            </div>

            {/* Company Profile Section */}
            <div id="profile" className="py-16 px-6 bg-gray-50 scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">公司简介</h2>
                        <p className="text-gray-500 mt-4 max-w-3xl mx-auto leading-relaxed">
                            {COMPANY_INFO.name}成立于2025年2月20日，总部位于武汉经济技术开发区。作为一家注册资本{COMPANY_INFO.capital}的新锐资产管理机构，我们始终坚持“专业创造价值，合规行稳致远”的经营理念，深耕私募股权投资与创业投资基金管理领域。
                        </p>
                    </div>

                    {/* Vision & Mission Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Mission */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-3">企业使命</h3>
                            <p className="text-blue-600 font-medium mb-3 text-sm tracking-wide uppercase">赋能实体 · 财富增值</p>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                致力于通过专业的资本运作与资源整合，赋能实体经济高质量发展，同时为投资者创造长期、稳健、可持续的财富增值。
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lightbulb className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-3">企业愿景</h3>
                            <p className="text-purple-600 font-medium mb-3 text-sm tracking-wide uppercase">值得信赖的资管机构</p>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                立足武汉，辐射全国，致力成为中国资本市场中具有重要影响力、深受投资者信赖的领先资产管理机构。
                            </p>
                        </div>

                        {/* Values */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HeartHandshake className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-3">核心价值观</h3>
                            <p className="text-amber-600 font-medium mb-3 text-sm tracking-wide uppercase">合规 · 诚信 · 专业 · 共赢</p>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                坚持合规底线，恪守诚信原则，以专业能力为核心竞争力，实现公司、客户与被投企业的共同成长。
                            </p>
                        </div>
                    </div>
                    
                    {/* Registration Info Detail */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-8 md:p-12 space-y-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Building2 className="w-6 h-6 text-blue-600" /> 工商注册信息
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 text-sm flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-600" /> 法定代表人
                                            </span>
                                            <span className="font-medium text-gray-900">{COMPANY_INFO.rep}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 text-sm flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-blue-600" /> 注册资本
                                            </span>
                                            <span className="font-medium text-gray-900">{COMPANY_INFO.capital}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 text-sm flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-blue-600" /> 公司类型
                                            </span>
                                            <span className="font-medium text-gray-900">有限责任公司(自然人独资)</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 text-sm flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-blue-600" /> 信用代码
                                            </span>
                                            <span className="font-mono text-gray-900 text-sm">{COMPANY_INFO.code}</span>
                                        </div>
                                        <div className="border-b border-gray-100 pb-3">
                                            <div className="flex items-start gap-2 mb-1">
                                                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> 
                                                <span className="text-gray-500 text-sm">注册地址</span>
                                            </div>
                                            <p className="font-medium text-gray-900 text-sm pl-6 leading-relaxed">
                                                {COMPANY_INFO.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                    <h4 className="font-bold text-blue-900 mb-3 text-sm flex items-center gap-2">
                                        <Award className="w-4 h-4" /> 经营范围
                                    </h4>
                                    <p className="text-xs text-blue-800 leading-relaxed text-justify">
                                        一般项目：私募股权投资基金管理、创业投资基金管理服务（须在中国证券投资基金业协会完成登记备案后方可从事经营活动）；以私募基金从事股权投资、投资管理、资产管理等活动（须在中国证券投资基金业协会完成登记备案后方可从事经营活动）；以自有资金从事投资活动；自有资金投资的资产管理服务；非融资担保服务；融资咨询服务；票据信息咨询服务；资产评估；破产清算服务；土地调查评估服务；企业管理；信息技术咨询服务；财政资金项目预算绩效评价服务；接受金融机构委托从事信息技术和流程外包服务（不含金融信息服务）。
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-100 min-h-[400px] bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-900/20 flex items-end p-8">
                                    <div className="text-white">
                                        <p className="text-sm uppercase tracking-widest font-semibold mb-2 opacity-80">ESTABLISHED 2025</p>
                                        <h3 className="text-2xl font-bold">与时间做朋友<br/>与优秀企业共成长</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategy/Business Section */}
            <div id="strategy" className="py-16 px-6 bg-white scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">核心业务领域</h2>
                        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                           依托专业的投研团队，深耕具有高成长潜力的投资领域。
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="bg-gray-50 p-8 rounded-2xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group">
                            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">私募股权投资</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">聚焦科技创新、高端制造等领域的未上市优质企业股权投资，助力实体经济发展。</p>
                         </div>
                         <div className="bg-gray-50 p-8 rounded-2xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group">
                            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">创业投资基金</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">为初创期、成长期的高新技术企业提供资金支持与增值服务，陪伴企业共同成长。</p>
                         </div>
                         <div className="bg-gray-50 p-8 rounded-2xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group">
                            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">资产管理服务</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">为高净值客户及机构投资者提供定制化的资产管理解决方案，实现财富保值增值。</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* News Section - Dynamic */}
            <div id="news" className="py-16 px-6 bg-gray-50 scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">市场观点</h2>
                            <div className="h-1 w-20 bg-blue-600 mt-3"></div>
                        </div>
                        <div className="flex gap-4 items-center">
                             {loadingNews ? (
                                <div className="text-sm text-gray-400 flex items-center gap-2"><RefreshCw className="w-3 h-3 animate-spin"/> 更新资讯中...</div>
                             ) : (
                                <button onClick={loadNews} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors group">
                                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform"/> 刷新
                                </button>
                             )}
                             <a href="https://www.amac.org.cn/" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:text-blue-800 text-sm hidden md:flex items-center gap-1">
                                查看更多 <ExternalLink className="w-3 h-3"/>
                             </a>
                        </div>
                    </div>
                    
                    {loadingNews && news.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             {[1,2,3].map(i => (
                                 <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm h-80 animate-pulse">
                                     <div className="bg-gray-200 h-48 w-full"></div>
                                     <div className="p-6 space-y-3">
                                         <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                         <div className="h-4 bg-gray-200 rounded w-full"></div>
                                         <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {news.slice(0, 6).map(item => (
                                <div 
                                    key={item.id} 
                                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
                                    onClick={() => item.sourceUrl && window.open(item.sourceUrl, '_blank')}
                                >
                                    <div className="h-48 overflow-hidden relative shrink-0">
                                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10 flex items-center gap-1">
                                            {item.source && <span className="font-bold border-r border-blue-400 pr-1 mr-1">{item.source}</span>}
                                            {item.category === 'Market' ? '市场研报' : item.category === 'Education' ? '投资者教育' : '公司动态'}
                                        </div>
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="text-gray-400 text-xs mb-2 flex items-center gap-2">
                                            <Newspaper className="w-3 h-3" /> {item.date}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 flex-1">{item.summary}</p>
                                        
                                        {item.sourceUrl && (
                                            <div className="mt-4 text-blue-500 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                阅读全文 <ExternalLink className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Updated Professional Footer */}
            <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 px-6 mt-auto border-t border-gray-800">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Col 1: Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center text-white mb-6">
                            <Building2 className="w-8 h-8 mr-2 text-blue-500" />
                            <span className="font-bold text-xl tracking-wide">聚财众发</span>
                        </div>
                        <p className="text-xs leading-relaxed mb-4 text-gray-500">
                            有限责任公司(自然人独资)<br/>
                            统一社会信用代码：{COMPANY_INFO.code}
                        </p>
                        <div className="space-y-2 text-xs">
                            <p className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-green-500"/> 管理人登记编号：{COMPANY_INFO.amacId}</p>
                            <p className="flex items-center gap-2"><CreditCard className="w-3 h-3 text-blue-500"/> 注册资本：{COMPANY_INFO.capital}</p>
                        </div>
                    </div>
                    
                    {/* Col 2: Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">快速导航</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" onClick={(e) => scrollToSection(e, 'profile')} className="hover:text-blue-400 transition-colors block w-full text-left">关于我们</a></li>
                            <li><a href="#" onClick={(e) => scrollToSection(e, 'strategy')} className="hover:text-blue-400 transition-colors block w-full text-left">业务体系</a></li>
                            <li><a href="#" onClick={(e) => scrollToSection(e, 'news')} className="hover:text-blue-400 transition-colors block w-full text-left">市场动态</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate(isLoggedIn ? dashboardPath : '/login'); }} className="hover:text-blue-400 transition-colors block w-full text-left">客户登录</a></li>
                        </ul>
                    </div>

                    {/* Col 3: Compliance */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">合规专区</h4>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={(e) => openLegalModal(e, '合格投资者认定')} className="hover:text-blue-400 transition-colors text-left w-full">合格投资者认定</button></li>
                            <li><button onClick={(e) => openLegalModal(e, '风险揭示书')} className="hover:text-blue-400 transition-colors text-left w-full">风险揭示书</button></li>
                            <li><button onClick={(e) => openLegalModal(e, '反洗钱公告')} className="hover:text-blue-400 transition-colors text-left w-full">反洗钱公告</button></li>
                            <li><button onClick={(e) => openLegalModal(e, '隐私政策')} className="hover:text-blue-400 transition-colors text-left w-full">隐私政策</button></li>
                        </ul>
                    </div>

                    {/* Col 4: Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">联系方式</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-1 text-blue-500 shrink-0" />
                                <span className="text-gray-400">湖北省武汉市武汉经济技术开发区<br/>12C2地块万达广场B区S5-1栋19层</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <User className="w-4 h-4 text-blue-500 shrink-0" />
                                <span>法定代表人：{COMPANY_INFO.rep}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                                <span>{COMPANY_INFO.phone}</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                                <span>{COMPANY_INFO.email}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Bottom Bar */}
                <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800">
                    {/* Risk Warning Banner */}
                    <div className="bg-orange-900/20 border border-orange-900/50 p-4 rounded-lg text-xs leading-relaxed mb-8 text-orange-200/80">
                        <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold">
                            <Award className="w-4 h-4" /> 
                            <span>重要风险提示</span>
                        </div>
                        <p>1. 私募基金投资具有较高风险，不适合所有投资者。投资者在进行投资前请务必仔细阅读基金合同、招募说明书等法律文件。</p>
                        <p>2. 本网站所载信息仅供合格投资者参考，不构成任何投资建议或承诺。基金的过往业绩不代表未来表现。</p>
                        <p>3. 依据《私募投资基金监督管理暂行办法》，合格投资者指具备相应风险识别能力和风险承担能力，投资于单只私募基金的金额不低于100万元且符合相关标准的单位和个人。</p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
                        <p>&copy; 2025 {COMPANY_INFO.name} 版权所有</p>
                        <div className="flex gap-4 flex-wrap justify-center">
                            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-gray-400 cursor-pointer transition-colors">{COMPANY_INFO.icp}</a>
                            <span className="hover:text-gray-400 cursor-pointer transition-colors">{COMPANY_INFO.police}</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Generic Legal Modal */}
            {legalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Scale className="w-5 h-5 text-blue-600" />
                                {legalTitle}
                            </h3>
                            <button onClick={() => setLegalModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto text-justify">
                            {legalContent}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                            <button 
                                onClick={() => setLegalModalOpen(false)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                我已了解
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficialSite;
