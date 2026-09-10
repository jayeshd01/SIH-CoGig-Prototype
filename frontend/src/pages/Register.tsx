import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiBriefcase, FiMail, FiLock, FiPhone, FiCheck } from 'react-icons/fi';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'worker' ? 'WORKER' : 'CUSTOMER';

  const [role, setRole] = useState<'CUSTOMER' | 'WORKER'>(initialRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
      });
      if (role === 'WORKER') {
        navigate('/worker');
      } else {
        navigate('/customer');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#1B6B3A] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
          C
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create CoGig Account</h1>
        <p className="text-xs text-gray-500">
          Join India’s premier cooperative digital gig platform
        </p>
      </div>

      {/* Role Picker */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole('CUSTOMER')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            role === 'CUSTOMER' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiUser /> I Need Services
        </button>
        <button
          type="button"
          onClick={() => setRole('WORKER')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            role === 'WORKER' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiBriefcase /> I Am a Worker
        </button>
      </div>

      {/* Register Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Ramesh"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Patil"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <FiMail /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ramesh.patil@example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <FiPhone /> Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <FiLock /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          {role === 'WORKER' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <span className="font-bold block">Labour Cooperative Affiliation:</span>
              <p className="text-[11px] text-gray-600">
                You will be assigned to a local verified cooperative society (e.g. Shakti Labour Co-op) upon identity accreditation.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1B6B3A] hover:bg-[#145A2F] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'WORKER' ? 'Cooperative Worker' : 'Customer'}`}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-[#1B6B3A] hover:underline">
              Sign In &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
