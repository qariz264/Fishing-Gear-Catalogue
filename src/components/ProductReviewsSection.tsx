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
  Loader2,
  Send,
  MapPin,
  Fish,
  ThumbsUp,
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

  // Helpful votes client tracking
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

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

      setFormSuccess('Thank you! Your review has been published.');
      setAuthorName('');
      setLocation('');
      setFishCaught('');
      setComment('');
      setRating(5);
      setIsFormOpen(false);
      if (onReviewAdded) onReviewAdded();
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setFormError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {formSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Ratings & Overview Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-6 justify-between">
        {/* Big Score */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display block leading-none">
              {stats.count > 0 ? stats.average.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center justify-center gap-0.5 mt-1.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= (stats.count > 0 ? Math.round(stats.average) : 5)
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-slate-500 block mt-1">
              {stats.count} {stats.count === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <div className="h-12 w-px bg-slate-200 hidden sm:block" />

          {/* Rating Bars */}
          <div className="space-y-1 w-40 sm:w-48 text-[10px] font-mono text-slate-600">
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = stats.distribution[starNum as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
              return (
                <div key={starNum} className="flex items-center gap-2">
                  <span className="w-4 text-right">{starNum}★</span>
                  <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 text-slate-400 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA to Write Review */}
        <div className="w-full sm:w-auto text-center sm:text-right">
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            {isFormOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Close Review Form</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Write a Review</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-500 block mt-1">
            Share your catch report with fellow anglers
          </span>
        </div>
      </div>

      {/* Customer Review Submission Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in duration-200 text-left"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Review {product.name}</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                How did this gear perform on Kenyan waters?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Interactive Star Rating Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Rating *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = (hoverRating || rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      className="p-1 hover:scale-115 transition-transform text-amber-500 cursor-pointer"
                      title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          isFilled ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-mono font-medium text-amber-800 ml-2">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Angler Info (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. John Omondi"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Fishing Waters / Location (Optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lake Naivasha / Masinga Dam"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Fish Caught with this gear */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Fish className="w-3.5 h-3.5 text-slate-400" />
              <span>Catch Report with this Equipment (Optional)</span>
            </label>
            <input
              type="text"
              value={fishCaught}
              onChange={(e) => setFishCaught(e.target.value)}
              placeholder="e.g. 4.2kg Largemouth Bass / 8kg Nile Perch"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Review & Performance Notes *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other anglers how this rod/reel/lure felt on the water: drag smoothness, casting distance, backbone, line management, durability..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Angler Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Angler Testimonials ({reviews.length})
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            Real feedback from Kenyan anglers
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <span className="text-xs">Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2.5">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <h5 className="text-sm font-semibold text-slate-800">
              No reviews yet for this equipment
            </h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Have you tried this rod, reel, or tackle on Kenyan waters? Be the first to share your experience with the community.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write the First Review</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs text-left"
              >
                {/* Header: Author, Rating, Date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Initials Avatar */}
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                      {rev.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {rev.authorName}
                        </span>
                        {rev.verified !== false && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-200/60">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Verified Angler</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                {/* Badges for location and catch */}
                {(rev.location || rev.fishCaught) && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {rev.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{rev.location}</span>
                      </span>
                    )}
                    {rev.fishCaught && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50">
                        <Fish className="w-3 h-3 text-blue-500" />
                        <span>Caught: {rev.fishCaught}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Comment Body */}
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>

                {/* Helpful Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono text-[10px] text-slate-400">
                    Product: {rev.productName || product.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleHelpful(rev.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      helpfulVotes[rev.id]
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{helpfulVotes[rev.id] ? 'Helpful (1)' : 'Helpful'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
