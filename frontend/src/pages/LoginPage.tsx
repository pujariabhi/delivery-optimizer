import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, User, ShieldCheck, AlertCircle, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, demoLogin, demoCustomerLogin } = useAuth();
  
  // Selected login role mode: 'customer' or 'admin'
  const [roleMode, setRoleMode] = useState<'customer' | 'admin'>('customer');
  
  // For customer: toggle between login and register
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  
  // Form fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('customer@delivery.com');
  const [password, setPassword] = useState<string>('customer123');
  
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRoleModeSwitch = (mode: 'customer' | 'admin') => {
    setRoleMode(mode);
    setIsRegistering(false);
    setError('');
    setSuccessMsg('');
    if (mode === 'customer') {
      setEmail('customer@delivery.com');
      setPassword('customer123');
    } else {
      setEmail('admin@delivery.com');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (roleMode === 'customer' && isRegistering) {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        await register(name, email, password);
        navigate('/customer');
      } else {
        await login(email, password);
        if (roleMode === 'customer') {
          navigate('/customer');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (roleMode === 'customer') {
        await demoCustomerLogin();
        navigate('/customer');
      } else {
        await demoLogin();
        navigate('/');
      }
    } catch (err: any) {
      setError('Demo login failed. Please ensure the backend is running or try direct login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Zap className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">OPTIDELIVER LOGISTICS</h1>
          <p className="text-xs text-slate-400">
            Real-Time Traffic-Aware Last-Mile Delivery Platform
          </p>
        </div>

        {/* Portal Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleModeSwitch('customer')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              roleMode === 'customer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleModeSwitch('admin')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              roleMode === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Admin & Dispatcher</span>
          </button>
        </div>

        {/* Portal Description Badge */}
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
          {roleMode === 'customer' ? (
            <p>
              📦 <span className="font-semibold text-white">Customer Sign In:</span> Track your packages live, check estimated delivery times (ETA), and book new orders.
            </p>
          ) : (
            <p>
              🛡️ <span className="font-semibold text-white">Admin & Fleet Manager:</span> Access route optimization engine, vehicle dispatch, traffic simulators, and telemetry.
            </p>
          )}
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {roleMode === 'customer' && isRegistering && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Ananya Deshmukh"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={roleMode === 'customer' ? 'customer@delivery.com' : 'admin@delivery.com'}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading
              ? 'Authenticating...'
              : roleMode === 'customer' && isRegistering
              ? 'Create Customer Account & Sign In'
              : `Sign In as ${roleMode === 'customer' ? 'Customer' : 'Admin / Dispatcher'}`}
          </button>
        </form>

        {/* Customer Register Toggle */}
        {roleMode === 'customer' && (
          <div className="text-center text-xs">
            {isRegistering ? (
              <p className="text-slate-400">
                Already have a customer account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-slate-400">
                New customer?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline ml-1"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        )}

        {/* 1-Click Demo Access */}
        <div className="relative border-t border-slate-800 pt-4">
          <span className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Instant Demo Access
          </span>
          <button
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {roleMode === 'customer'
              ? '1-Click Demo Login (Customer: Ananya)'
              : '1-Click Demo Login (Admin Dispatcher)'}
          </button>
        </div>

        {/* Demo Credentials Footer */}
        <div className="text-center text-[11px] text-slate-500">
          Demo: <span className="font-mono text-slate-400">{roleMode === 'customer' ? 'customer@delivery.com' : 'admin@delivery.com'}</span> /{' '}
          <span className="font-mono text-slate-400">{roleMode === 'customer' ? 'customer123' : 'admin123'}</span>
        </div>
      </div>
    </div>
  );
};
