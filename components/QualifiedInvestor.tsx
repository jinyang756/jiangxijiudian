
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { CheckCircle, Upload, FileText, Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QualifiedInvestor: React.FC = () => {
    const { certifyInvestor, user } = useContext(AppContext);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [agreed, setAgreed] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleUpload = () => {
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            setStep(2);
        }, 1500);
    };

    const handleCertify = () => {
        if (!agreed) return;
        certifyInvestor();
        setStep(3);
    };

    if (user.extJson?.isQualifiedInvestor && step !== 3) {
        return (
            <div className="p-8 text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">您已完成合格投资者认证</h2>
                <p className="text-gray-600 mb-6">您可以自由浏览和交易私募基金产品。</p>
                <button 
                    onClick={() => navigate('/market')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    前往基金超市
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-8 h-8 text-blue-600" />
                    合格投资者认证
                </h1>
                <p className="text-gray-500 mt-2">根据《私募投资基金监督管理暂行办法》，私募产品仅面向合格投资者募集。</p>
            </div>

            <div className="flex items-center mb-10">
                <div className={`flex-1 h-2 rounded-l ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex-1 h-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex-1 h-2 rounded-r ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {step === 1 && (
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                            资产证明上传
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                            <p className="font-bold mb-2">合格投资者标准（满足其一即可）：</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>金融资产不低于300万元（包括银行存款、股票、债券、基金份额等）</li>
                                <li>最近三年个人年均收入不低于50万元</li>
                            </ul>
                        </div>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleUpload}>
                            {uploading ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <Upload className="w-12 h-12 text-blue-400 mb-3" />
                                    <p className="text-gray-500">正在验证文件...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                    <p className="text-gray-600 font-medium">点击上传资产证明文件</p>
                                    <p className="text-gray-400 text-xs mt-1">支持 JPG, PNG, PDF (最大 10MB)</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 text-right">
                            <button 
                                onClick={() => setStep(2)}
                                className="text-gray-400 text-sm hover:text-gray-600 underline"
                            >
                                跳过上传 (开发测试)
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                         <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                            风险揭示书签署
                        </h3>
                        <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border border-gray-200 text-xs leading-relaxed text-gray-600 mb-6">
                            <p className="font-bold text-center text-sm mb-2">私募基金风险揭示书</p>
                            <p className="mb-2">尊敬的投资者：</p>
                            <p className="mb-2">投资有风险。当您认购或申购私募基金时，可能获得投资收益，但同时也面临着投资风险。您在做出投资决策之前，请仔细阅读本风险揭示书...</p>
                            <p className="mb-2">一、特殊风险提示</p>
                            <p className="mb-2">1. 基金合同与中国基金业协会合同指引不一致所涉风险...</p>
                            <p className="mb-2">2. 基金未托管所涉风险...</p>
                            <p className="mb-2">3. 基金委托募集所涉风险...</p>
                            <p className="mb-2">二、一般风险提示</p>
                            <p className="mb-2">1. 资金损失风险：基金投资不保证本金，可能面临亏损...</p>
                            <p className="mb-2">2. 流动性风险：私募基金通常有封闭期...</p>
                            <p className="mb-2">...</p>
                            <p className="mb-2">（以下内容省略5000字）</p>
                        </div>
                        
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                本人已认真阅读《私募基金风险揭示书》，充分了解并承担私募基金投资风险，承诺作为合格投资者参与投资。
                            </span>
                        </label>

                        <button 
                            disabled={!agreed}
                            onClick={handleCertify}
                            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            确认签署并提交
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-8">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">认证成功</h3>
                        <p className="text-gray-600 mb-8">您已成为“武汉聚财众发”认证合格投资者。</p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                返回首页
                            </button>
                            <button 
                                onClick={() => navigate('/market')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                            >
                                立即投资
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QualifiedInvestor;
