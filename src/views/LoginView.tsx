import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('crm_session_id', data.sessionId);
        localStorage.setItem('crm_username', data.username);
        onLoginSuccess(data.username);
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
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
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

          {error && (
            <div className="text-red-500 text-xs font-semibold text-center mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Command Center'}
          </button>
        </form>
      </div>
    </div>
  );
};
