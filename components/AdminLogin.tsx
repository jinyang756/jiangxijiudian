import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const { login, user } = useContext(AppContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        if (user && user.userType === 1) {
            navigate('/admin/dashboard');
        } else if (user && user.userType === 2) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!email) {
            alert("请输入管理员邮箱");
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("请输入有效的邮箱地址");
            return;
        }

        if (!password) {
            alert("请输入密码");
            return;
        }
        
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Mock admin credential check
            // 只允许特定邮箱登录管理员账户
            if (email === 'admin@jucaifund.com' && password === 'admin123456') {
                login(email, true);
                navigate('/');
            } else {
                alert('管理员账号或密码错误');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            
            {/* Login Form Container */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md z-0">
                <div className="flex justify-center mb-4 transition-colors text-gray-800">
                    <Shield className="w-12 h-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    后台管理系统
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    仅限授权人员访问
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-0">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-gray-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                管理员邮箱
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                                    placeholder="admin@jucaifund.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                密码
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                                    placeholder="请输入密码"
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
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 transition-colors bg-gray-800 hover:bg-gray-900 focus:ring-gray-600`}
                            >
                                {loading ? '安全验证中...' : '进入后台'}
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
                                    返回用户端
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                投资者登录 <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center text-xs text-gray-400">
                        <p>武汉聚财众发私募基金管理有限公司</p>
                        <p className="mt-1">基金管理人登记编号：P1072839</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;