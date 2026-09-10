import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiShield, FiLock, FiMail, FiCheck, FiArrowRight } from 'react-icons/fi';

const Login: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      if (redirect === 'booking') {
        navigate('/services');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'CUSTOMER' | 'WORKER' | 'ADMIN') => {
    setLoading(true);
    setError('');
    try {
      await loginAsDemo(role);
      if (role === 'CUSTOMER') navigate('/customer');
      if (role === 'WORKER') navigate('/worker');
      if (role === 'ADMIN') navigate('/admin');
    } catch (err: any) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#1B6B3A] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
          C
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sign In to CoGig</h1>
        <p className="text-xs text-gray-500">
          Cooperative digital marketplace for trusted household services
        </p>
      </div>

      {/* ─── 1-CLICK DEMO ACCOUNTS FOR REVIEWERS ──────────────────────────────── */}
      <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
            ⚡ 1-Click Instant Demo Login:
          </span>
          <span className="text-[10px] text-emerald-700 font-bold">No typing needed</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickDemo('CUSTOMER')}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl text-center text-xs font-bold text-blue-900 shadow-2xs hover:scale-102 transition-all cursor-pointer"
          >
            <span className="block text-base">👤</span>
            <span>Customer</span>
          </button>

          <button
            onClick={() => handleQuickDemo('WORKER')}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl text-center text-xs font-bold text-amber-900 shadow-2xs hover:scale-102 transition-all cursor-pointer"
          >
            <span className="block text-base">⚡</span>
            <span>Worker</span>
          </button>

          <button
            onClick={() => handleQuickDemo('ADMIN')}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-center text-xs font-bold text-purple-900 shadow-2xs hover:scale-102 transition-all cursor-pointer"
          >
            <span className="block text-base">🛡️</span>
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiMail className="text-gray-400" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. customer@demo.com"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiLock className="text-gray-400" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#1B6B3A] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-[#1B6B3A] hover:underline">
              Create an account &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
