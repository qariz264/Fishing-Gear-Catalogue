import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Logo } from '../../components/Logo';
import { Lock, User, Key, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { setPageSeo } from '../../utils/seo';

export const AdminLoginPage: React.FC = () => {
  const { currentUser, isAdmin, loading, error, loginWithCredentials, clearError } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-amber-500/20">
      <div className="w-full max-w-md space-y-6">
        {/* Back to store */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Store</span>
        </a>

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
              Authorized administrator access for inventory catalogue, fishing spots, blogs, events, and training.
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

          {/* Primary Form: Username & Password */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Administrator Username
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || submitting}
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
        </div>
      </div>
    </div>
  );
};
