
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Shield, Key, Lock, UserCheck, AlertOctagon } from 'lucide-react';

const AdminSecurity: React.FC = () => {
    const { user, adminActions } = useContext(AppContext);
    
    // Mock Password Change
    const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });

    // Mock Permissions Tree
    const [roles, setRoles] = useState([
        { id: 1, name: '超级管理员', perms: ['view', 'edit', 'delete', 'export', 'audit'] },
        { id: 2, name: '运营专员', perms: ['view', 'edit', 'audit'] },
        { id: 3, name: '审计员', perms: ['view', 'export'] },
    ]);

    const handlePwdChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (pwdForm.new !== pwdForm.confirm) {
            alert("两次新密码输入不一致");
            return;
        }
        if (pwdForm.new.length < 8) {
            alert("密码长度需大于8位");
            return;
        }
        adminActions.logOperation('CHANGE_PWD', user.username, '修改管理员密码');
        alert("密码修改成功，下次登录请使用新密码");
        setPwdForm({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="p-6">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        安全与权限控制
                    </h1>
                    <p className="text-sm text-gray-500">保障管理端自身安全，精细化权限分配</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password Manager */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <Key className="w-5 h-5 text-blue-600" /> 管理员密码修改
                    </h3>
                    <form onSubmit={handlePwdChange} className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">当前密码</label>
                            <input 
                                type="password" required
                                value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">新密码</label>
                            <input 
                                type="password" required
                                value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="至少8位，包含字母数字"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">确认新密码</label>
                            <input 
                                type="password" required
                                value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">提交修改</button>
                    </form>
                </div>

                {/* Role Permissions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <UserCheck className="w-5 h-5 text-green-600" /> 角色权限分配 (演示)
                    </h3>
                    <div className="space-y-4">
                        {roles.map(role => (
                            <div key={role.id} className="border border-gray-100 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">{role.name}</span>
                                    <button className="text-xs text-blue-600">编辑</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {role.perms.map(p => (
                                        <span key={p} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                            {p === 'view' ? '查看' : p === 'edit' ? '编辑' : p === 'delete' ? '删除' : p === 'audit' ? '审核' : '导出'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sensitive Ops Config */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <AlertOctagon className="w-5 h-5 text-red-600" /> 敏感操作保护
                    </h3>
                    <div className="space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">删除基金需二次密码确认</span>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                                <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
                            </div>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">导出全量数据需验证码</span>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                                <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
                            </div>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">限制单IP每日错误登录次数 (5次)</span>
                             <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                                <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSecurity;
