import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, enableDemoMode, isConfigured } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Account created successfully! Signing in...');
        setTimeout(() => navigate('/'), 1200);
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        navigate('/');
      }
    }
  };

  const handleDemoLogin = () => {
    enableDemoMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-900 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-rose-900/10">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
            Make My Marriage
          </h1>
          <p className="text-xs text-stone-500">
            {isSignUp ? 'Create your wedding workspace account' : 'Sign in to manage your wedding workspace, expenses, and digital invitation.'}
          </p>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${isSignUp ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Supabase Status Alert */}
        {!isConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Preview Demo Mode Available</span>
            </p>
            <p className="text-[11px] text-amber-700">
              Supabase credentials not configured in `.env`. You can explore the complete application using the 1-click Demo Workspace below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-800 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-800 bg-stone-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Workspace Account' : 'Sign In to Workspace')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider absolute">
            Or
          </span>
        </div>

        {/* 1-Click Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200/80 rounded-xl border border-amber-300 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>Enter Wedding Workspace (Instant Demo)</span>
        </button>

        <div className="text-center text-[11px] text-stone-400">
          Make My Marriage • Personal Wedding Management Suite
        </div>
      </div>
    </div>
  );
};
