import React, { useState } from 'react';
import { Activity, Lock, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="bg-indigo-900 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Activity className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Inter, Cairo, sans-serif' }}>
            MedScope CMS
          </h1>
          <p className="text-slate-600" style={{ fontFamily: 'Inter, Cairo, sans-serif' }}>
            Smart Clinic Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-900 text-white py-3 px-4 rounded-lg hover:bg-indigo-800 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
          >
            تسجيل الدخول
          </button>
        </form>

        {/* Sample Credentials */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-3">بيانات تسجيل الدخول التجريبية:</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div><strong>المدير:</strong> admin / password123</div>
            <div><strong>الطبيب:</strong> doctor / doc123</div>
            <div><strong>الاستقبال:</strong> reception / rec123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
