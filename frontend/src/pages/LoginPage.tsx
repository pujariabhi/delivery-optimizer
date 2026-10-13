import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

type Tab = 'admin' | 'customer';
type CustomerMode = 'otp' | 'password';
type OtpStep = 'email' | 'code';

const ADMIN_EMAIL = 'pujariabhiram06@gmail.com';
const SAVED_ACCOUNTS_KEY = 'delivery_saved_gmails';
const MAX_SAVED = 5;

// ── Saved accounts helpers ──────────────────────────────────────────────────
const getSavedAccounts = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ACCOUNTS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const saveAccount = (email: string) => {
  const list = getSavedAccounts().filter(e => e !== email);
  list.unshift(email); // most recent first
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
};

const removeAccount = (email: string) => {
  const list = getSavedAccounts().filter(e => e !== email);
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(list));
};

// ── Avatar helper ───────────────────────────────────────────────────────────
const getInitials = (email: string) =>
  email.charAt(0).toUpperCase();

const colorFor = (email: string) => {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
  ];
  let h = 0;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
};

// ───────────────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const { login, register, otpLogin, demoCustomerLogin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('customer');
  const [savedAccounts, setSavedAccounts] = useState<string[]>(getSavedAccounts);

  // ── Admin OTP ─────────────────────────────────────────────────────────────
  const [adminOtpStep, setAdminOtpStep] = useState<OtpStep>('email');
  const [adminOtpCode, setAdminOtpCode] = useState('');
  const [adminDemoOtp, setAdminDemoOtp] = useState('');

  // ── Customer OTP ──────────────────────────────────────────────────────────
  const [custMode, setCustMode] = useState<CustomerMode>('otp');
  const [custOtpEmail, setCustOtpEmail] = useState('');
  const [custOtpStep, setCustOtpStep] = useState<OtpStep>('email');
  const [custOtpCode, setCustOtpCode] = useState('');
  const [custDemoOtp, setCustDemoOtp] = useState('');

  // ── Customer password ─────────────────────────────────────────────────────
  const [pwMode, setPwMode] = useState<'login' | 'register'>('login');
  const [pwName, setPwName] = useState('');
  const [pwEmail, setPwEmail] = useState('');
  const [pwPass, setPwPass] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const clearMsg = () => { setError(''); setInfo(''); };

  // refresh saved list from storage whenever tab becomes customer
  useEffect(() => {
    setSavedAccounts(getSavedAccounts());
  }, [tab]);

  // ── Admin OTP ─────────────────────────────────────────────────────────────
  const handleAdminSendOtp = async () => {
    clearMsg(); setLoading(true);
    try {
      const res = await authApi.sendOtp(ADMIN_EMAIL);
      setAdminDemoOtp(res.demoOtp ?? '');
      setAdminOtpStep('code');
      setInfo(`OTP sent! Demo code: ${res.demoOtp}`);
    } catch { setError('Failed to send OTP. Try again.'); }
    finally { setLoading(false); }
  };

  const handleAdminVerifyOtp = async () => {
    if (!adminOtpCode.trim()) { setError('Enter the 6-digit OTP.'); return; }
    clearMsg(); setLoading(true);
    try {
      await otpLogin(ADMIN_EMAIL, adminOtpCode.trim());
      navigate('/');
    } catch { setError('Invalid or expired OTP.'); }
    finally { setLoading(false); }
  };

  const resetAdminOtp = () => {
    setAdminOtpStep('email'); setAdminOtpCode(''); setAdminDemoOtp(''); clearMsg();
  };

  // ── Customer OTP ──────────────────────────────────────────────────────────
  const handleCustSendOtp = async (emailOverride?: string) => {
    const email = (emailOverride ?? custOtpEmail).trim().toLowerCase();
    if (!email) { setError('Enter your Gmail address.'); return; }
    if (emailOverride) setCustOtpEmail(emailOverride);
    clearMsg(); setLoading(true);
    try {
      const res = await authApi.sendOtp(email);
      setCustDemoOtp(res.demoOtp ?? '');
      setCustOtpStep('code');
      setInfo(`OTP sent to ${email}! Demo code: ${res.demoOtp}`);
    } catch { setError('Failed to send OTP. Check the email and try again.'); }
    finally { setLoading(false); }
  };

  const handleCustVerifyOtp = async () => {
    if (!custOtpCode.trim()) { setError('Enter the 6-digit OTP.'); return; }
    clearMsg(); setLoading(true);
    try {
      await otpLogin(custOtpEmail.trim().toLowerCase(), custOtpCode.trim());
      saveAccount(custOtpEmail.trim().toLowerCase());
      setSavedAccounts(getSavedAccounts());
      navigate('/customer');
    } catch { setError('Invalid or expired OTP. Request a new one.'); }
    finally { setLoading(false); }
  };

  const resetCustOtp = () => {
    setCustOtpStep('email'); setCustOtpCode(''); setCustDemoOtp(''); clearMsg();
  };

  const handleRemoveSaved = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    removeAccount(email);
    setSavedAccounts(getSavedAccounts());
  };

  // ── Customer password ─────────────────────────────────────────────────────
  const handleCustPassword = async (e: React.FormEvent) => {
    e.preventDefault(); clearMsg(); setLoading(true);
    try {
      if (pwMode === 'login') {
        await login(pwEmail, pwPass);
      } else {
        await register(pwName, pwEmail, pwPass);
      }
      saveAccount(pwEmail.trim().toLowerCase());
      setSavedAccounts(getSavedAccounts());
      navigate('/customer');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Check your email and password.';
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleDemoCustomer = async () => {
    clearMsg(); setLoading(true);
    try { await demoCustomerLogin(); navigate('/customer'); }
    catch { setError('Demo login failed.'); }
    finally { setLoading(false); }
  };

  // ── CSS helpers ───────────────────────────────────────────────────────────
  const tabCls = (t: Tab) =>
    `flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
      tab === t ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`;

  const modePillCls = (active: boolean) =>
    `flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
      active ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
    }`;

  const OtpDemoBox = ({ code, onFill }: { code: string; onFill: () => void }) => (
    <div
      onClick={onFill}
      className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm cursor-pointer select-none"
      title="Click to auto-fill OTP"
    >
      <span className="text-yellow-700 font-medium">Demo OTP (click to fill): </span>
      <span className="font-mono text-lg tracking-widest text-yellow-900 font-bold">{code}</span>
    </div>
  );

  // ── Saved account chips ───────────────────────────────────────────────────
  const SavedAccountChips = () => {
    if (savedAccounts.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Your accounts</p>
        <div className="space-y-2">
          {savedAccounts.map(email => (
            <div
              key={email}
              onClick={() => handleCustSendOtp(email)}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition group"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${colorFor(email)}`}>
                {getInitials(email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{email}</p>
                <p className="text-xs text-gray-400">Click to send OTP</p>
              </div>
              <button
                onClick={e => handleRemoveSaved(e, email)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 text-gray-300 hover:text-red-500 transition text-xs"
                title="Remove account"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-gray-400">or add another account</span>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
            <button className={tabCls('customer')} onClick={() => { setTab('customer'); clearMsg(); }}>
              🛒 Customer Portal
            </button>
            <button className={tabCls('admin')} onClick={() => { setTab('admin'); clearMsg(); }}>
              🔒 Admin Portal
            </button>
          </div>

          <div className="p-6">

            {/* Banners */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2">
                <span>❌</span><span>{error}</span>
              </div>
            )}
            {info && !error && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex gap-2">
                <span>✅</span><span>{info}</span>
              </div>
            )}

            {/* ══ ADMIN TAB ══ */}
            {tab === 'admin' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs leading-relaxed">
                  🔒 Admin access is restricted to <strong>{ADMIN_EMAIL}</strong> only.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin email (locked)</label>
                  <div className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono select-all">
                    {ADMIN_EMAIL}
                  </div>
                </div>

                {adminOtpStep === 'email' ? (
                  <button
                    onClick={handleAdminSendOtp}
                    disabled={loading}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP…' : '📧 Send OTP to Admin Gmail'}
                  </button>
                ) : (
                  <>
                    {adminDemoOtp && (
                      <OtpDemoBox code={adminDemoOtp} onFill={() => setAdminOtpCode(adminDemoOtp)} />
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter 6-digit OTP
                      </label>
                      <input
                        type="text" inputMode="numeric" maxLength={6}
                        placeholder="_ _ _ _ _ _"
                        value={adminOtpCode}
                        onChange={e => setAdminOtpCode(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={e => e.key === 'Enter' && handleAdminVerifyOtp()}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none font-mono tracking-widest text-center text-2xl"
                      />
                    </div>
                    <button
                      onClick={handleAdminVerifyOtp}
                      disabled={loading}
                      className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Verifying…' : 'Verify OTP & Enter Admin Panel'}
                    </button>
                    <button onClick={resetAdminOtp}
                      className="w-full py-1.5 text-sm text-gray-400 hover:text-gray-600 underline">
                      ← Resend OTP
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ══ CUSTOMER TAB ══ */}
            {tab === 'customer' && (
              <div className="space-y-4">

                {/* Sub-mode toggle */}
                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                  <button className={modePillCls(custMode === 'otp')}
                    onClick={() => { setCustMode('otp'); clearMsg(); resetCustOtp(); }}>
                    📧 Gmail OTP
                  </button>
                  <button className={modePillCls(custMode === 'password')}
                    onClick={() => { setCustMode('password'); clearMsg(); }}>
                    🔑 Email + Password
                  </button>
                </div>

                {/* ── OTP mode ── */}
                {custMode === 'otp' && (
                  <div className="space-y-3">
                    {custOtpStep === 'email' ? (
                      <>
                        {/* Saved accounts chips */}
                        <SavedAccountChips />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gmail address
                          </label>
                          <input
                            type="email"
                            placeholder="you@gmail.com"
                            value={custOtpEmail}
                            onChange={e => setCustOtpEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCustSendOtp()}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            First time? We'll create your account automatically.
                          </p>
                        </div>
                        <button
                          onClick={() => handleCustSendOtp()}
                          disabled={loading}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          {loading ? 'Sending…' : 'Send OTP →'}
                        </button>
                      </>
                    ) : (
                      <>
                        {custDemoOtp && (
                          <OtpDemoBox code={custDemoOtp} onFill={() => setCustOtpCode(custDemoOtp)} />
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            OTP sent to{' '}
                            <span className="text-blue-600 font-mono">{custOtpEmail}</span>
                          </label>
                          <input
                            type="text" inputMode="numeric" maxLength={6}
                            placeholder="_ _ _ _ _ _"
                            value={custOtpCode}
                            onChange={e => setCustOtpCode(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={e => e.key === 'Enter' && handleCustVerifyOtp()}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono tracking-widest text-center text-2xl"
                          />
                        </div>
                        <button
                          onClick={handleCustVerifyOtp}
                          disabled={loading}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          {loading ? 'Verifying…' : 'Verify & Sign In'}
                        </button>
                        <button onClick={resetCustOtp}
                          className="w-full py-1.5 text-sm text-gray-400 hover:text-gray-600 underline">
                          ← Use different email / Resend OTP
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* ── Password mode ── */}
                {custMode === 'password' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Returning customer? Sign in with your email and password.
                      New here? Create an account.
                    </p>
                    <div className="flex gap-2 text-xs">
                      {(['login', 'register'] as const).map(m => (
                        <button key={m}
                          className={`px-3 py-1 rounded-full border transition ${
                            pwMode === m
                              ? 'border-blue-500 text-blue-600 bg-blue-50'
                              : 'border-gray-200 text-gray-400 hover:border-gray-300'
                          }`}
                          onClick={() => { setPwMode(m); clearMsg(); }}>
                          {m === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={handleCustPassword} className="space-y-3">
                      {pwMode === 'register' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                          <input type="text" placeholder="Your name" value={pwName}
                            onChange={e => setPwName(e.target.value)} required
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" placeholder="you@gmail.com" value={pwEmail}
                          onChange={e => setPwEmail(e.target.value)} required
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" placeholder="••••••••" value={pwPass}
                          onChange={e => setPwPass(e.target.value)} required
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                      </div>
                      <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
                        {loading ? 'Please wait…' : pwMode === 'login' ? 'Sign In' : 'Create Account'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Demo divider */}
                <div className="relative pt-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-400">or</span>
                  </div>
                </div>
                <button onClick={handleDemoCustomer} disabled={loading}
                  className="w-full py-2.5 border-2 border-blue-100 hover:border-blue-300 text-blue-600 font-semibold rounded-lg transition disabled:opacity-50 text-sm">
                  🚀 Demo Customer Login (1-click)
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          B.Tech Capstone — AI/ML Delivery Optimization &copy; 2024
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
