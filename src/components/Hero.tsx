import React from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <section className="bg-slate-900 text-white py-8 sm:py-10 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Fishing gear catalogue. Select your rods, reels, lures, and tackle, then send your order list directly to WhatsApp.
        </p>

        {/* Search input */}
        <div className="pt-2 max-w-md mx-auto">
          <div className="relative flex items-center bg-white rounded-xl shadow-xs border border-slate-700/50 p-1.5 focus-within:ring-2 focus-within:ring-amber-500">
            <Search className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search gear, rods, reels, lures, hooks..."
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
