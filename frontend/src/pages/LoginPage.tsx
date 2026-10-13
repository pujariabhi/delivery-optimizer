import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Tab = 'customer' | 'admin';

const LoginPage: React.FC = () => {
  const { login, register, demoLogin, demoCustomerLogin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('customer');

  // Admin form
  const [adminEmail, setAdminEmail] = useState('pujariabhiram06@gmail.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Customer form
  const [custIsRegister, setCustIsRegister] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearMsg = () => setError('');

  // Handle Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMsg();
    setLoading(true);
    try {
      await login(adminEmail.trim().toLowerCase(), adminPassword);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid Admin email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle 1-Click Demo Admin Login
  const handleDemoAdmin = async () => {
    clearMsg();
    setLoading(true);
    try {
      await demoLogin();
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Demo admin login failed. Please ensure the backend is connected.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Login or Registration
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMsg();
    setLoading(true);
    try {
      if (custIsRegister) {
        await register(custName.trim(), custEmail.trim().toLowerCase(), custPassword);
      } else {
        await login(custEmail.trim().toLowerCase(), custPassword);
      }
      navigate('/customer');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Customer login/registration failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle 1-Click Demo Customer Login
  const handleDemoCustomer = async () => {
    clearMsg();
    setLoading(true);
    try {
      await demoCustomerLogin();
      navigate('/customer');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Demo customer login failed. Please ensure the backend is connected.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Delivery Optimizer</h1>
          <p className="text-gray-500 text-sm mt-1">AI-Powered Last-Mile Logistics Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Portal Tabs */}
          <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100">
            <button
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === 'customer'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => { setTab('customer'); clearMsg(); }}
            >
              🛒 Customer Portal
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === 'admin'
                  ? 'bg-gray-900 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => { setTab('admin'); clearMsg(); }}
            >
              🔒 Admin Portal
            </button>
          </div>

          <div className="p-6">
            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ═══ ADMIN TAB ═══ */}
            {tab === 'admin' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs leading-relaxed">
                  🔒 Admin Portal access for <strong>pujariabhiram06@gmail.com</strong>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition disabled:opacity-50 text-sm shadow"
                  >
                    {loading ? 'Signing in…' : 'Sign In as Admin'}
                  </button>
                </form>

                {/* Instant 1-Click Demo Admin Button */}
                <div className="relative pt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-400">or instant demo</span>
                  </div>
                </div>

                <button
                  onClick={handleDemoAdmin}
                  disabled={loading}
                  className="w-full py-2.5 border-2 border-gray-800 hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  ⚡ 1-Click Demo Admin Login
                </button>
              </div>
            )}

            {/* ═══ CUSTOMER TAB ═══ */}
            {tab === 'customer' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-1">
                  <span className="text-xs font-medium text-gray-500">
                    {custIsRegister ? 'Create your customer account' : 'Access orders & tracking'}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setCustIsRegister(!custIsRegister); clearMsg(); }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    {custIsRegister ? 'Already have account? Sign in' : '+ Register new account'}
                  </button>
                </div>

                <form onSubmit={handleCustomerSubmit} className="space-y-3">
                  {custIsRegister && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={custName}
                        onChange={e => setCustName(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="customer@delivery.com or any Gmail"
                      value={custEmail}
                      onChange={e => setCustEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={custPassword}
                      onChange={e => setCustPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 text-sm shadow"
                  >
                    {loading
                      ? 'Please wait…'
                      : custIsRegister
                      ? 'Create Customer Account'
                      : 'Sign In to Customer Portal'}
                  </button>
                </form>

                {/* Instant 1-Click Demo Customer Button */}
                <div className="relative pt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-400">or instant demo</span>
                  </div>
                </div>

                <button
                  onClick={handleDemoCustomer}
                  disabled={loading}
                  className="w-full py-2.5 border-2 border-blue-100 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-semibold rounded-lg transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  🚀 1-Click Demo Customer Login
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Real-Time Traffic-Aware Last-Mile Delivery Optimization &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
