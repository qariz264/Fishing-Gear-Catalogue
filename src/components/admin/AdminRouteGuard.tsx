import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldAlert, Loader2, ArrowLeft, LogOut } from 'lucide-react';

export const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, loading, error, logout } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <span className="text-sm font-medium text-slate-300">Verifying administrator authorization...</span>
      </div>
    );
  }

  // Not logged in -> redirect to /admin/login
  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in but not an authorized admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
          
          <p className="text-xs text-slate-400 leading-relaxed">
            Signed in as <strong className="text-white">{currentUser.email || currentUser.uid}</strong>.
            This account is not registered in the authorized administrators list.
          </p>

          {error && (
            <div className="text-[11px] text-red-300 bg-red-950/50 p-2.5 rounded-lg border border-red-800/40">
              {error}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => logout()}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-red-600/80 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <a
              href="/"
              className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
