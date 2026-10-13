import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

type Tab = 'otp' | 'customer' | 'admin';
type OtpStep = 'email' | 'code';

const LoginPage: React.FC = () => {
  const { login, register, otpLogin, demoLogin, demoCustomerLogin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('otp');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Customer state
  const [custMode, setCustMode] = useState<'login' | 'register'>('login');
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPass, setCustPass] = useState('');

  // Admin state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const clearMessages = () => { setError(''); setInfo(''); };

  // ── OTP handlers ──────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!otpEmail.trim()) { setError('Please enter your email address.'); return; }
    clearMessages();
    setLoading(true);
    try {
      const res = await authApi.sendOtp(otpEmail.trim().toLowerCase());
      setDemoOtp(res.demoOtp ?? '');
      setOtpSent(true);
      setOtpStep('code');
      setInfo(`OTP sent! (Demo code: ${res.demoOtp})`);
    } catch {
      setError('Failed to send OTP. Check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) { setError('Please enter the 6-digit OTP.'); return; }
    clearMessages();
    setLoading(true);
    try {
      await otpLogin(otpEmail.trim().toLowerCase(), otpCode.trim());
      navigate('/');
    } catch {
      setError('Invalid or expired OTP. Please request a new code.');
    } finally {
      setLoading(false);
    }
  };

  const resetOtp = () => {
    setOtpStep('email');
    setOtpCode('');
    setDemoOtp('');
    setOtpSent(false);
    clearMessages();
  };

  // ── Customer password handlers ────────────────────────────────────────────
  const handleCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      if (custMode === 'login') {
        await login(custEmail, custPass);
      } else {
        await register(custName, custEmail, custPass);
      }
      navigate('/customer');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Admin password handler ────────────────────────────────────────────────
  const handleAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await login(adminEmail, adminPass);
      navigate('/');
    } catch {
      setError('Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleDemoAdmin = async () => {
    clearMessages();
    setLoading(true);
    try { await demoLogin(); navigate('/'); }
    catch { setError('Demo login failed.'); }
    finally { setLoading(false); }
  };

  const handleDemoCustomer = async () => {
    clearMessages();
    setLoading(true);
    try { await demoCustomerLogin(); navigate('/customer'); }
    catch { setError('Demo login failed.'); }
    finally { setLoading(false); }
  };

  const tabCls = (t: Tab) =>
    `flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
      tab === t
        ? 'bg-blue-600 text-white shadow'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Delivery Optimizer</h1>
          <p className="text-gray-500 text-sm mt-1">AI-Powered Last-Mile Logistics</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Tabs */}
          <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100">
            <button className={tabCls('otp')} onClick={() => { setTab('otp'); clearMessages(); }}>
              📧 Gmail OTP
            </button>
            <button className={tabCls('customer')} onClick={() => { setTab('customer'); clearMessages(); }}>
              🛒 Customer
            </button>
            <button className={tabCls('admin')} onClick={() => { setTab('admin'); clearMessages(); }}>
              🔒 Admin
            </button>
          </div>

          <div className="p-6">

            {/* Error / Info banner */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <span>❌</span> {error}
              </div>
            )}
            {info && !error && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                <span>✅</span> {info}
              </div>
            )}

            {/* ── OTP Tab ── */}
            {tab === 'otp' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Sign in with Gmail OTP</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Works for <strong>any Gmail</strong>. Admin access is granted only to
                    verified addresses.
                  </p>
                </div>

                {otpStep === 'email' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                      <input
                        type="email"
                        placeholder="you@gmail.com"
                        value={otpEmail}
                        onChange={e => setOtpEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Sending…' : 'Send OTP →'}
                    </button>
                  </>
                ) : (
                  <>
                    {demoOtp && (
                      <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm">
                        <strong>Demo OTP:</strong>{' '}
                        <span
                          className="font-mono text-lg tracking-widest text-yellow-800 cursor-pointer select-all"
                          onClick={() => setOtpCode(demoOtp)}
                          title="Click to auto-fill"
                        >
                          {demoOtp}
                        </span>
                        <span className="text-yellow-600 ml-2 text-xs">(click to fill)</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        6-digit OTP sent to <span className="text-blue-600">{otpEmail}</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="_ _ _ _ _ _"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-mono tracking-widest text-center text-xl"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Verifying…' : 'Verify & Sign In'}
                    </button>
                    <button
                      onClick={resetOtp}
                      className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Use a different email
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── Customer Tab ── */}
            {tab === 'customer' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition ${
                      custMode === 'login' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => { setCustMode('login'); clearMessages(); }}
                  >
                    Sign In
                  </button>
                  <button
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition ${
                      custMode === 'register' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => { setCustMode('register'); clearMessages(); }}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleCustomer} className="space-y-3">
                  {custMode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                      <input
                        type="text"
                        placeholder="Your name"
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
                      placeholder="customer@example.com"
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
                      value={custPass}
                      onChange={e => setCustPass(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Please wait…' : custMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">or</div>
                </div>

                <button
                  onClick={handleDemoCustomer}
                  disabled={loading}
                  className="w-full py-2.5 border-2 border-blue-200 hover:border-blue-400 text-blue-700 font-semibold rounded-lg transition disabled:opacity-50 text-sm"
                >
                  🚀 Demo Customer Login
                </button>
              </div>
            )}

            {/* ── Admin Tab ── */}
            {tab === 'admin' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  🔒 Admin access is restricted to verified personnel only.
                </div>

                <form onSubmit={handleAdmin} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin email</label>
                    <input
                      type="email"
                      placeholder="admin@delivery.com"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={adminPass}
                      onChange={e => setAdminPass(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Signing in…' : 'Admin Sign In'}
                  </button>
                </form>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">or</div>
                </div>

                <button
                  onClick={handleDemoAdmin}
                  disabled={loading}
                  className="w-full py-2.5 border-2 border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50 text-sm"
                >
                  🚀 Demo Admin Login
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          B.Tech Capstone — AI/ML Delivery Optimization System &copy; 2024
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
