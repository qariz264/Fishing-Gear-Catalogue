import React, { useState, useEffect } from 'react';
import { Product } from '../data/products';
import { ProductItem, ProductReview } from '../types/admin';
import {
  subscribeToProductReviews,
  addProductReview,
  calculateReviewStats,
} from '../utils/reviewService';
import {
  Star,
  CheckCircle2,
  MessageSquare,
  Plus,
  Send,
  MapPin,
  Fish,
  AlertCircle,
  X,
} from 'lucide-react';

interface ProductReviewsSectionProps {
  product: Product | ProductItem;
  onReviewAdded?: () => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  onReviewAdded,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [fishCaught, setFishCaught] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!product?.id) return;
    setLoading(true);

    const unsub = subscribeToProductReviews(product.id, (data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => unsub();
  }, [product?.id]);

  const stats = calculateReviewStats(reviews);

  const ratingDescriptions: Record<number, string> = {
    1: '1 Star - Poor performance',
    2: '2 Stars - Fair / needs improvement',
    3: '3 Stars - Good angling gear',
    4: '4 Stars - Very good / reliable on water',
    5: '5 Stars - Outstanding / highly recommended',
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = authorName.trim();
    const cleanComment = comment.trim();

    if (!cleanName) {
      setFormError('Please enter your name as an angler.');
      return;
    }
    if (!cleanComment) {
      setFormError('Please write your review or comments about this gear.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setFormError('Please select a star rating from 1 to 5.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addProductReview({
        productId: product.id,
        productName: product.name,
        authorName: cleanName,
        rating,
        comment: cleanComment,
        location: location.trim(),
        fishCaught: fishCaught.trim(),
        verified: true,
      });

      setFormSuccess('Thank you! Your review has been saved.');
      setTimeout(() => {
        setIsFormOpen(false);
        setAuthorName('');
        setLocation('');
        setFishCaught('');
        setComment('');
        setRating(5);
        setFormSuccess(null);
        if (onReviewAdded) onReviewAdded();
      }, 1800);
    } catch (err: any) {
      console.error('Failed to submit product review:', err);
      setFormError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
            <span className="text-xl font-extrabold text-slate-900 font-mono block leading-none">
              {stats.count > 0 ? stats.average.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center justify-center gap-0.5 text-amber-500 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Angler Ratings &amp; Catch Reports
            </h4>
            <p className="text-[11px] text-slate-500">
              {stats.count > 0
                ? `${stats.count} verified reviews from Kenyan anglers`
                : 'Be the first angler to review this equipment'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setFormSuccess(null);
            setIsFormOpen(!isFormOpen);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          {isFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isFormOpen ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Review Submission Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-md space-y-3 animate-in fade-in duration-150"
        >
          <div className="border-b border-slate-100 pb-2">
            <h5 className="text-xs font-bold text-slate-900">
              Reviewing: {product.name}
            </h5>
            <p className="text-[11px] text-slate-500">
              Share details about your setup, waters fished, or fish caught with this tackle.
            </p>
          </div>

          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Star selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isActive = (hoverRating || rating) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starValue)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`Rate ${starValue} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          isActive
                            ? 'fill-amber-400 text-amber-500'
                            : 'fill-slate-100 text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-semibold text-amber-800 font-mono">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Peter Maina"
                className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block">
                Location / Water Body
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lake Naivasha / Sagana"
                className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block">
              Fish Caught (Optional)
            </label>
            <input
              type="text"
              value={fishCaught}
              onChange={(e) => setFishCaught(e.target.value)}
              placeholder="e.g. Tilapia (1.5kg), Largemouth Bass, Mudfish"
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block">
              Your Review / Performance Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did this gear handle on the water? Tip sensitivity, drag performance, casting distance..."
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Loading angler reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200 space-y-2">
          <MessageSquare className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600">
            No reviews yet for this product. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {r.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{r.authorName}</span>
                      {r.verified !== false && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${
                            s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              {(r.location || r.fishCaught) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {r.location && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      <span>{r.location}</span>
                    </span>
                  )}
                  {r.fishCaught && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                      <Fish className="w-2.5 h-2.5 text-blue-500" />
                      <span>Catch: {r.fishCaught}</span>
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
