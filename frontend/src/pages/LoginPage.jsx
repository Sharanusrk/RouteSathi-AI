import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  UserCheck,
  Award,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(demoEmail, demoPass);
      navigate(loggedUser.role === 'ADMIN' ? '/ml-dashboard' : '/planner');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800/20">
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-600 via-blue-700 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-400/20 blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-6">
              <ShieldCheck className="w-4 h-4 text-sky-300" />
              <span>SafeTrip AI • India Tourism Platform</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              Welcome Back to Smarter, Safer Travel.
            </h1>
            <p className="text-sm text-sky-100/90 mt-3 leading-relaxed">
              Sign in to access personalized AI trip itineraries, real-time weather & crowd risk intelligence, safe route comparisons, and downloadable PDF travel guides.
            </p>
          </div>

          <div className="relative z-10 space-y-3 mt-8 pt-6 border-t border-white/15 text-xs text-sky-100">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Hybrid AI Destination & Day-Wise Itinerary Engine</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>6-Factor Safety Score (Weather, Crowd, Time, Route, Scam, Location)</span>
            </div>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Sign In to Your Account</h2>
            <p className="text-sm text-slate-500 mt-1">
              Don’t have an account yet?{' '}
              <Link to="/register" className="text-sky-600 font-bold hover:underline">
                Create a free account (Sign Up)
              </Link>
            </p>
          </div>

          {/* Instant Demo Credentials Box */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Quick Evaluation One-Click Login:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('user@safetrip.ai', 'user123')}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition"
              >
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>Demo Traveler (user@safetrip.ai)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@safetrip.ai', 'admin123')}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Demo Admin / ML (admin@safetrip.ai)</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{submitting ? 'Signing In...' : 'Sign In to SafeTrip AI'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
