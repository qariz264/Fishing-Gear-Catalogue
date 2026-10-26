import React, { useState, useEffect } from 'react';
import { ProductReview } from '../types/admin';
import {
  subscribeToOverallReviews,
  addOverallReview,
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
  Sparkles,
} from 'lucide-react';

export const FooterReviewsSection: React.FC = () => {
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
    setLoading(true);
    const unsub = subscribeToOverallReviews((data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const stats = calculateReviewStats(reviews);

  const ratingDescriptions: Record<number, string> = {
    1: '1 Star - Needs improvement',
    2: '2 Stars - Fair experience',
    3: '3 Stars - Good tackle & advice',
    4: '4 Stars - Very good / reliable delivery & gear',
    5: '5 Stars - Outstanding gear, advice & customer service',
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = authorName.trim();
    const cleanComment = comment.trim();

    if (!cleanName) {
      setFormError('Please enter your name.');
      return;
    }
    if (!cleanComment) {
      setFormError('Please write your review about Fishing With Nelson.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setFormError('Please select a star rating from 1 to 5.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addOverallReview({
        authorName: cleanName,
        rating,
        comment: cleanComment,
        location: location.trim(),
        fishCaught: fishCaught.trim(),
      });

      setFormSuccess('Thank you! Your review for Fishing With Nelson has been submitted.');
      setAuthorName('');
      setLocation('');
      setFishCaught('');
      setComment('');
      setRating(5);
      setIsFormOpen(false);
      setTimeout(() => setFormSuccess(null), 5000);
    } catch (err: any) {
      console.error('Failed to submit overall review:', err);
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
    <section aria-labelledby="footer-reviews-heading" className="space-y-6 text-left">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400" />
            </span>
            <h2 id="footer-reviews-heading" className="text-base sm:text-lg font-bold text-white tracking-tight">
              Customer & Angler Reviews
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Overall feedback and testimonials from Kenyan anglers regarding gear quality, customer service, and countrywide delivery.
          </p>
        </div>

        {/* Action Button to Open Form */}
        <div>
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto py-2 px-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
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
        </div>
      </div>

      {/* Success Notification */}
      {formSuccess && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Aggregate Score & Distribution Card (Only shown if reviews exist) */}
      {stats.count > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-display block leading-none">
                {stats.average.toFixed(1)}
              </span>
              <div className="flex items-center justify-center gap-0.5 mt-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(stats.average)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-slate-400 block mt-1">
                {stats.count} customer {stats.count === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            <div className="h-12 w-px bg-slate-800 hidden sm:block" />

            {/* Rating Bars */}
            <div className="space-y-1 w-40 sm:w-48 text-[10px] font-mono text-slate-400">
              {[5, 4, 3, 2, 1].map((starNum) => {
                const count = stats.distribution[starNum as 1 | 2 | 3 | 4 | 5] || 0;
                const percent = Math.round((count / stats.count) * 100);
                return (
                  <div key={starNum} className="flex items-center gap-2">
                    <span className="w-4 text-right text-slate-300">{starNum}★</span>
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-5 text-slate-500 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center sm:text-right text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Genuine Angler Reviews</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Direct feedback from anglers across Kenya
            </p>
          </div>
        </div>
      )}

      {/* Review Submission Form (Expandable) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Share Your Experience with Fishing With Nelson</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                How was your experience with our gear, advice, or delivery?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Interactive Star Rating Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Rating *
            </label>
            <div className="flex flex-wrap items-center gap-2">
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
                      className="p-1 hover:scale-115 transition-transform text-amber-400 cursor-pointer"
                      title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-mono font-medium text-amber-300 ml-2">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Angler Info (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. John Mwangi"
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Your Location / Town (Optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nairobi / Lake Naivasha / Mombasa"
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Catch Report or Waters */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Fish className="w-3.5 h-3.5 text-slate-400" />
              <span>Fishing Waters / Fish Caught (Optional)</span>
            </label>
            <input
              type="text"
              value={fishCaught}
              onChange={(e) => setFishCaught(e.target.value)}
              placeholder="e.g. Tilapia & Bass on Lake Naivasha / Nile Perch on Lake Victoria"
              className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Review & Comments *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your overall experience with Fishing With Nelson: tackle quality, Nelson's personalized advice, delivery speed, and customer care..."
              className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      <div>
        {loading ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500 mx-auto" />
            <span className="text-xs">Loading customer reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">
              No customer reviews posted yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Have you ordered fishing rods, reels, or lures from Nelson, or received angling advice? Be the first to share your experience with the community.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Be the First to Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between transition-colors"
              >
                <div className="space-y-2.5">
                  {/* Top Bar: Author, Verified Badge, Rating & Date */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                        {rev.authorName ? rev.authorName.slice(0, 2).toUpperCase() : 'AN'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {rev.authorName}
                          </span>
                          {rev.verified !== false && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-medium border border-emerald-500/30">
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
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {/* Location & Catch details if provided */}
                  {(rev.location || rev.fishCaught) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {rev.location && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{rev.location}</span>
                        </span>
                      )}
                      {rev.fishCaught && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/40">
                          <Fish className="w-3 h-3 text-sky-400" />
                          <span>{rev.fishCaught}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                    {rev.comment}
                  </p>
                </div>

                {/* Helpful Button */}
                <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-[10px] text-slate-500">
                    Fishing With Nelson Review
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleHelpful(rev.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      helpfulVotes[rev.id]
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200'
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
    </section>
  );
};
