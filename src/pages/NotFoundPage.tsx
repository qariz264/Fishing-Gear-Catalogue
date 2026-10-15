import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Compass, ArrowLeft, ShoppingBag, MapPin, BookOpen } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-500/20 selection:text-amber-900">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center border border-amber-500/20">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">
              Error 404 · Uncharted Waters
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              The page you are looking for may have been moved, renamed, or is currently unavailable.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Gear Catalogue</span>
            </Link>
            <Link
              to="/fishing-spots"
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>Explore Fishing Spots</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
