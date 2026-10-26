import React, { useState, useEffect } from 'react';
import { ProductReview } from '../../types/admin';
import { subscribeToAllReviews, deleteProductReview, calculateReviewStats } from '../../utils/reviewService';
import { AdminAlert, AdminAlertMessage } from '../../components/admin/AdminAlert';
import {
  Star,
  Search,
  Trash2,
  CheckCircle2,
  MapPin,
  Fish,
  Loader2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusAlert, setStatusAlert] = useState<AdminAlertMessage | null>(null);

  useEffect(() => {
    const unsub = subscribeToAllReviews((data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const stats = calculateReviewStats(reviews);

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteProductReview(reviewId);
      setDeleteConfirmId(null);
      setStatusAlert({
        type: 'success',
        text: 'Review deleted successfully from Firestore.',
      });
    } catch (err: any) {
      console.error('Failed to delete review:', err);
      setStatusAlert({
        type: 'error',
        text: `Error deleting review: ${err?.message || err}`,
      });
    }
  };

  const filtered = reviews.filter((r) => {
    if (selectedRating !== 'all' && Math.round(r.rating) !== Number(selectedRating)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAuthor = (r.authorName || '').toLowerCase().includes(q);
      const matchComment = (r.comment || '').toLowerCase().includes(q);
      const matchProduct = (r.productName || '').toLowerCase().includes(q);
      const matchLoc = (r.location || '').toLowerCase().includes(q);
      return matchAuthor || matchComment || matchProduct || matchLoc;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto text-left">
      <AdminAlert message={statusAlert} onDismiss={() => setStatusAlert(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Customer Ratings & Reviews</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Moderate and monitor feedback, verified catch reports, and angler testimonials submitted by customers.
          </p>
        </div>

        {/* Aggregate Stats Card */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl shrink-0">
          <div>
            <span className="text-xl font-extrabold text-white font-mono block leading-none">
              {stats.count > 0 ? `${stats.average.toFixed(1)} ★` : '—'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Store Average</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-xl font-extrabold text-amber-400 font-mono block leading-none">
              {stats.count}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Total Reviews</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by angler name, product, comment..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Rating Filter Chips */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedRating('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedRating === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Ratings ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = stats.distribution[starNum as 1 | 2 | 3 | 4 | 5] || 0;
            return (
              <button
                key={starNum}
                type="button"
                onClick={() => setSelectedRating(String(starNum) as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedRating === String(starNum)
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{starNum}★</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Cards List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs">Loading customer reviews from Firestore...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No reviews found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `No reviews matched "${searchQuery}".`
              : 'Customer reviews submitted on the storefront will appear here for moderation.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                      {item.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{item.authorName}</span>
                        {item.verified !== false && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-medium border border-emerald-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                {/* Associated Scope: Overall Store or Product */}
                <div className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    {item.productId && item.productId !== 'site' ? 'Product:' : 'Review Scope:'}
                  </span>
                  {item.productId && item.productId !== 'site' ? (
                    <a
                      href={`/?product=${encodeURIComponent(item.productId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 truncate max-w-[70%]"
                    >
                      <span className="truncate">{item.productName || item.productId}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                      <span>Overall Store &amp; Service</span>
                    </span>
                  )}
                </div>

                {/* Topic Badge */}
                {item.topic && (
                  <div className="pt-0.5">
                    <span className="inline-block text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      Topic: {item.topic}
                    </span>
                  </div>
                )}

                {/* Location / Catch Badges */}
                {(item.location || item.fishCaught) && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {item.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{item.location}</span>
                      </span>
                    )}
                    {item.fishCaught && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        <Fish className="w-3 h-3 text-blue-400" />
                        <span>Caught: {item.fishCaught}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Comment Text */}
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  {item.comment}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                {deleteConfirmId === item.id ? (
                  <div className="inline-flex items-center gap-1.5 bg-red-950/80 border border-red-800 p-1 rounded-lg">
                    <span className="text-[11px] text-red-200 px-1">Delete review?</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-500 cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
