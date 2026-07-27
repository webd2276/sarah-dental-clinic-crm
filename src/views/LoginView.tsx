import React, { useState } from 'react';
import { Lock, Mail, UserCheck, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('dr.miller@saradental.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(email);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-sm shadow-lg overflow-hidden">
        <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
          <img src="/logo.png" alt="Sara AI Logo" className="w-16 h-16 object-contain mx-auto mb-3" />
          <h2 className="text-base font-bold uppercase tracking-wider">
            SARA AI DENTIST
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            CRM Command Center Staff Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 rounded-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 rounded-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Command Center'}
          </button>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('dr.miller@saradental.com');
                onLoginSuccess('Dr. Sarah Miller');
              }}
              className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center justify-center mx-auto"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              <span>Quick Demo Login as Dr. Sarah Miller</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
