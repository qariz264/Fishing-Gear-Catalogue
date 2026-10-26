import React, { useState, useEffect } from 'react';
import { SiteReview } from '../types/admin';
import {
  subscribeToSiteReviews,
  addSiteReview,
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
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface SiteReviewsSectionProps {
  id?: string;
  showTitle?: boolean;
}

export const SiteReviewsSection: React.FC<SiteReviewsSectionProps> = ({
  id = 'reviews',
  showTitle = true,
}) => {
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter & Search states
  const [selectedRating, setSelectedRating] = useState<'all' | '5' | '4' | '3'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [topic, setTopic] = useState('Tackle Quality & Advice');
  const [fishCaught, setFishCaught] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToSiteReviews((data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const stats = calculateReviewStats(reviews);

  const ratingDescriptions: Record<number, string> = {
    1: '1 Star - Poor experience',
    2: '2 Stars - Fair / Needs improvement',
    3: '3 Stars - Good store experience',
    4: '4 Stars - Very good / High quality service',
    5: '5 Stars - Outstanding / Highly recommended!',
  };

  const handleOpenModal = () => {
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = authorName.trim();
    const cleanComment = comment.trim();

    if (!cleanName) {
      setFormError('Please enter your name.');
      return;
    }
    if (!cleanComment) {
      setFormError('Please write your review or comments about your experience.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addSiteReview({
        authorName: cleanName,
        rating,
        comment: cleanComment,
        location: location.trim(),
        topic: topic.trim(),
        fishCaught: fishCaught.trim(),
      });

      setFormSuccess('Thank you! Your review has been submitted successfully.');
      setTimeout(() => {
        setIsModalOpen(false);
        setAuthorName('');
        setLocation('');
        setFishCaught('');
        setComment('');
        setRating(5);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to submit site review:', err);
      setFormError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedRating !== 'all' && Math.round(r.rating) !== Number(selectedRating)) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchAuthor = (r.authorName || '').toLowerCase().includes(q);
      const matchComment = (r.comment || '').toLowerCase().includes(q);
      const matchLocation = (r.location || '').toLowerCase().includes(q);
      const matchTopic = (r.topic || '').toLowerCase().includes(q);
      return matchAuthor || matchComment || matchLocation || matchTopic;
    }
    return true;
  });

  return (
    <section id={id} className="scroll-mt-24 py-12 bg-slate-900/40 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Section Header */}
        {showTitle && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Customer Feedback &amp; Angler Stories</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Overall Customer Reviews
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Read real experiences from anglers across Kenya who trust Fishing With Nelson for tackle, advice, and delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-900/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Leave a Review</span>
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          /* Blank / Empty State when no real reviews have been submitted yet (NO generic reviews) */
          <div className="bg-white rounded-2xl p-10 sm:p-14 text-center border border-slate-200/90 max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 font-display">No reviews yet</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Be the first to share your experience with Fishing With Nelson! Leave feedback on your tackle, advice, or delivery experience.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-900/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Write the First Review</span>
              </button>
            </div>
          </div>
        ) : (
          /* Real Customer Reviews Section (appears only when real reviews exist) */
          <>
            {/* Aggregate Score & Real Trust Banner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Big Real Score */}
              <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
                <div className="text-center p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0 min-w-[110px]">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-950 font-mono block leading-none">
                    {stats.average.toFixed(1)}
                  </span>
                  <div className="flex items-center justify-center gap-1 text-amber-500 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(stats.average)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mt-1">
                    Out of 5 Stars
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Angler Satisfaction</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Based on{' '}
                    <strong className="text-slate-900">
                      {stats.count} verified customer {stats.count === 1 ? 'review' : 'reviews'}
                    </strong>{' '}
                    across Kenya.
                  </p>
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      100% Genuine Kenyan Anglers
                    </span>
                  </div>
                </div>
              </div>

              {/* Star Distribution Progress Bars */}
              <div className="lg:col-span-4 space-y-1.5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = stats.distribution[s as 1 | 2 | 3 | 4 | 5] || 0;
                  const pct = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center gap-2 text-xs">
                      <span className="w-7 text-[11px] font-mono text-slate-500 flex items-center gap-0.5">
                        {s} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 inline" />
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-[11px] font-mono text-slate-600">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Service Trust Highlights */}
              <div className="lg:col-span-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Personalized Advice:</strong>
                    <span>Nelson advises on the exact rig and hook size for your target waters.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Fast Countrywide Delivery:</strong>
                    <span>Nairobi CBD shop pick-up or fast courier parcel dispatch across Kenya.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              {/* Rating Tabs */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedRating('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedRating === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Reviews ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRating('5')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    selectedRating === '5'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>5 Stars</span>
                  <span className="text-[10px] opacity-80 font-mono">({stats.distribution[5] || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRating('4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    selectedRating === '4'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>4 Stars</span>
                  <span className="text-[10px] opacity-80 font-mono">({stats.distribution[4] || 0})</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by angler, location..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Filtered Reviews Grid or Filter Empty State */}
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 max-w-md mx-auto space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No matching reviews</h3>
                <p className="text-xs text-slate-600">
                  No reviews matched your filter criteria. Try selecting another rating or clearing search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRating('all');
                    setSearchFilter('');
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline cursor-pointer pt-1"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Review Top: Author Avatar & Name & Rating */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {r.authorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-900">{r.authorName}</span>
                              {r.verified !== false && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-200"
                                  title="Verified Customer / Angler"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= r.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200 fill-slate-100'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      {/* Topic / Location Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {r.topic && (
                          <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                            {r.topic}
                          </span>
                        )}
                        {r.location && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{r.location}</span>
                          </span>
                        )}
                        {r.fishCaught && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                            <Fish className="w-3 h-3 text-blue-500" />
                            <span>Catch: {r.fishCaught}</span>
                          </span>
                        )}
                      </div>

                      {/* Review Text */}
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                        "{r.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Interactive Modal Form: Leave a Real Site Review */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Review Fishing With Nelson
                </h3>
                <p className="text-xs text-slate-500">
                  Share your experience with our equipment, advice, or delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Your Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isActive = (hoverRating || rating) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starValue)}
                          className="p-1 text-slate-300 hover:scale-115 transition-transform cursor-pointer"
                          aria-label={`Rate ${starValue} stars`}
                        >
                          <Star
                            className={`w-7 h-7 ${
                              isActive
                                ? 'fill-amber-400 text-amber-500'
                                : 'fill-slate-100 text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-amber-800 font-mono">
                    {ratingDescriptions[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Angler Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Location / Water Body
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lake Naivasha / Nairobi"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>

                {/* Experience Topic */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Experience Topic
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  >
                    <option value="Tackle Quality & Advice">Tackle Quality &amp; Advice</option>
                    <option value="Fast WhatsApp Delivery">Fast WhatsApp Delivery</option>
                    <option value="Fishing Clinic & Training">Fishing Clinic &amp; Training</option>
                    <option value="Saltwater Offshore Tackle">Saltwater Offshore Tackle</option>
                    <option value="Freshwater Bass & Tilapia">Freshwater Bass &amp; Tilapia</option>
                    <option value="General Store Experience">General Store Experience</option>
                  </select>
                </div>
              </div>

              {/* Fish Caught / Catch story (optional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Fish Caught or Target Species <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={fishCaught}
                  onChange={(e) => setFishCaught(e.target.value)}
                  placeholder="e.g. Tilapia, Bass, Mudfish, Kingfish"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Your Review / Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked about the fishing gear, advice received from Nelson, delivery speed, or performance on the water..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-900/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
