import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth, OWNER_ADMIN_EMAIL } from '../../context/AdminAuthContext';
import { Logo } from '../../components/Logo';
import {
  Lock,
  User,
  Key,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { setPageSeo } from '../../utils/seo';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../utils/adminConstants';

export const AdminLoginPage: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    loading,
    error,
    loginWithCredentials,
    loginWithGoogle,
    clearError,
  } = useAdminAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setPageSeo({
      title: 'Admin Login - Fishing With Nelson',
      noindex: true,
    });
  }, []);

  const destination = (location.state as any)?.from || '/admin';

  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (!loading && currentUser && isAdmin) {
      navigate(destination, { replace: true });
    }
  }, [currentUser, isAdmin, loading, navigate, destination]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    clearError();
    setSubmitting(true);
    const success = await loginWithCredentials(username, password);
    setSubmitting(false);
    if (success) {
      navigate(destination, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setGoogleLoading(true);
    const success = await loginWithGoogle();
    setGoogleLoading(false);
    if (success) {
      navigate(destination, { replace: true });
    }
  };

  const handleQuickFill = () => {
    setUsername(ADMIN_USERNAME);
    setPassword(ADMIN_PASSWORD);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-amber-500/20">
      <div className="w-full max-w-md space-y-6">
        {/* Back to store */}
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Store</span>
          </a>

          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Console</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-block bg-white px-4 py-2 rounded-xl shadow-xs">
              <Logo className="h-10 w-auto" />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-amber-500 tracking-wider uppercase">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Dashboard Sign In</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Manage inventory catalogue, pricing, customer reviews, fishing spots, blogs, events, and training.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Authentication Notice</span>
                <span className="text-[11px] leading-relaxed block">{error}</span>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || submitting || googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.35 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.65 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign in with Google ({OWNER_ADMIN_EMAIL})</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              Direct access for authorized owner email: <code className="text-amber-400 font-mono">{OWNER_ADMIN_EMAIL}</code>
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Or with Credentials
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Primary Form: Username & Password */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-slate-300">
                  Administrator Username
                </label>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[10px] text-amber-500 hover:text-amber-400 inline-flex items-center gap-1 font-mono hover:underline"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Autofill credentials</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="FishingWithNelson"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Administrator Password
              </label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || submitting || googleLoading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In as Admin</span>
              )}
            </button>
          </form>

          {/* Quick Credential Reference Card */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] space-y-1.5 text-slate-400 font-mono">
            <div className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">
              Default Admin Credentials:
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Username:</span>
              <span className="text-slate-200 select-all font-semibold">FishingWithNelson</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Password:</span>
              <span className="text-slate-200 select-all font-semibold">0987654321NelsonFishing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
