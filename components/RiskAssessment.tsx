
import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
    onComplete: (score: number, level: number, label: string) => void;
}

const questions = [
    {
        id: 1,
        text: "您的年龄区间是？",
        options: [
            { text: "60岁以上", score: 2 },
            { text: "45-60岁", score: 5 },
            { text: "30-45岁", score: 8 },
            { text: "30岁以下", score: 10 },
        ]
    },
    {
        id: 2,
        text: "您的家庭总资产约为（折合人民币）？",
        options: [
            { text: "50万以下", score: 2 },
            { text: "50-200万", score: 5 },
            { text: "200-500万", score: 8 },
            { text: "500万以上", score: 10 },
        ]
    },
    {
        id: 3,
        text: "您进行投资的主要目的是？",
        options: [
            { text: "资产保值，抵抗通胀", score: 2 },
            { text: "资产稳健增值", score: 5 },
            { text: "追求较高收益", score: 8 },
            { text: "实现资产迅速大幅增长", score: 10 },
        ]
    },
    {
        id: 4,
        text: "您能承受的最大亏损幅度是？",
        options: [
            { text: "不能承受亏损", score: 0 },
            { text: "10%以内", score: 5 },
            { text: "20-30%", score: 8 },
            { text: "30%以上", score: 10 },
        ]
    },
    {
        id: 5,
        text: "您的投资经验年限是？",
        options: [
            { text: "无经验", score: 0 },
            { text: "1-3年", score: 5 },
            { text: "3-10年", score: 8 },
            { text: "10年以上", score: 10 },
        ]
    }
];

const RiskAssessment: React.FC<Props> = ({ onComplete }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [calculating, setCalculating] = useState(false);

    const handleSelect = (qId: number, score: number) => {
        setAnswers(prev => ({ ...prev, [qId]: score }));
    };

    const calculateResult = () => {
        setCalculating(true);
        setTimeout(() => {
            const totalScore = (Object.values(answers) as number[]).reduce((a, b) => a + b, 0);
            let level = 1;
            let label = 'C1 (保守型)';
            
            if (totalScore >= 45) { level = 5; label = 'C5 (激进型)'; }
            else if (totalScore >= 35) { level = 4; label = 'C4 (进取型)'; }
            else if (totalScore >= 25) { level = 3; label = 'C3 (平衡型)'; }
            else if (totalScore >= 15) { level = 2; label = 'C2 (稳健型)'; }

            onComplete(totalScore, level, label);
            setCalculating(false);
        }, 1500);
    };

    const allAnswered = questions.every(q => answers[q.id] !== undefined);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
            <div className="text-center mb-8">
                <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-gray-800">投资者风险测评</h2>
                <p className="text-gray-500 mt-2">根据相关法规，交易前请完成风险测评以确保为您推荐合适的产品。</p>
            </div>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={q.id} className="border-b border-gray-100 pb-4">
                        <p className="font-semibold text-gray-800 mb-3">{idx + 1}. {q.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt) => (
                                <button
                                    key={opt.text}
                                    onClick={() => handleSelect(q.id, opt.score)}
                                    className={`p-3 rounded-lg text-left text-sm transition-colors border ${
                                        answers[q.id] === opt.score
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {opt.text}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <button
                    disabled={!allAnswered || calculating}
                    onClick={calculateResult}
                    className={`w-full py-3 rounded-lg text-white font-medium shadow-md transition-all ${
                        allAnswered && !calculating
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    {calculating ? '正在评估风控模型...' : '提交测评'}
                </button>
            </div>
        </div>
    );
};

export default RiskAssessment;
