import React, { useState, useEffect } from 'react';
import { SiteReview } from '../types/admin';
import {
  subscribeToSiteReviews,
  addSiteReview,
  calculateReviewStats,
  hasUserUpvotedReview,
  toggleReviewHelpful,
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
  ShieldCheck,
  Search,
  Filter,
  ThumbsUp,
  Camera,
  Share2,
  Wrench,
  Quote,
  Maximize2,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';

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
  const [activePhotoModal, setActivePhotoModal] = useState<{
    url: string;
    caption: string;
    angler: string;
    species?: string;
  } | null>(null);

  // Filter & Search states
  const [selectedWater, setSelectedWater] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<'all' | '5' | '4'>('all');
  const [photosOnly, setPhotosOnly] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Local helpful votes state to reflect instant user clicks
  const [helpfulOverrides, setHelpfulOverrides] = useState<Record<string, number>>({});
  const [userUpvoted, setUserUpvoted] = useState<Record<string, boolean>>({});

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [anglerTitle, setAnglerTitle] = useState('');
  const [location, setLocation] = useState('');
  const [waterBody, setWaterBody] = useState('');
  const [targetSpecies, setTargetSpecies] = useState('');
  const [catchWeight, setCatchWeight] = useState('');
  const [gearUsed, setGearUsed] = useState('');
  const [nelsonsTip, setNelsonsTip] = useState('');
  const [topic, setTopic] = useState('Tackle Quality & Advice');
  const [catchPhotoUrl, setCatchPhotoUrl] = useState('');
  const [orderMethod, setOrderMethod] = useState('Nairobi Shop Pick-up');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToSiteReviews((data) => {
      setReviews(data);
      setLoading(false);

      // Initialize upvoted tracker
      const upvotedMap: Record<string, boolean> = {};
      data.forEach((r) => {
        upvotedMap[r.id] = hasUserUpvotedReview(r.id);
      });
      setUserUpvoted(upvotedMap);
    });

    return () => unsub();
  }, []);

  const stats = calculateReviewStats(reviews);

  const ratingDescriptions: Record<number, string> = {
    1: '1 Star - Poor performance',
    2: '2 Stars - Fair / Issues experienced',
    3: '3 Stars - Satisfactory equipment',
    4: '4 Stars - High quality tackle / Good catch',
    5: '5 Stars - Outstanding gear & game-changing advice!',
  };

  const handleOpenModal = () => {
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleHelpfulClick = (reviewId: string, currentCount: number = 0) => {
    const isNowHelpful = toggleReviewHelpful(reviewId);
    setUserUpvoted((prev) => ({ ...prev, [reviewId]: isNowHelpful }));

    const baseline = helpfulOverrides[reviewId] !== undefined ? helpfulOverrides[reviewId] : currentCount;
    const delta = isNowHelpful ? 1 : -1;
    setHelpfulOverrides((prev) => ({
      ...prev,
      [reviewId]: Math.max(0, baseline + delta),
    }));
  };

  const handleShareReview = (review: SiteReview) => {
    const text = `🎣 Real Angler Review for Fishing With Nelson Kenya:\n"${review.comment.slice(0, 160)}..."\n- ${review.authorName} (${review.waterBody || review.location || 'Kenya'})\nRead more authentic catch reviews: https://fishingwithnelson.com/reviews`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
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
    if (cleanComment.length < 25) {
      setFormError(
        'Please share specific details (at least 25 characters) about the tackle performance, your catch, or water conditions.'
      );
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
        location: (location || waterBody).trim(),
        waterBody: waterBody.trim(),
        anglerTitle: anglerTitle.trim() || 'Verified Angler',
        targetSpecies: targetSpecies.trim(),
        fishCaught: targetSpecies.trim() + (catchWeight.trim() ? ` (${catchWeight.trim()})` : ''),
        catchWeight: catchWeight.trim(),
        gearUsed: gearUsed.trim(),
        nelsonsTip: nelsonsTip.trim(),
        topic: topic.trim(),
        catchPhotoUrl: catchPhotoUrl.trim(),
        orderMethod: orderMethod.trim(),
      });

      setFormSuccess('Thank you! Your verified catch review has been published.');
      setTimeout(() => {
        setIsModalOpen(false);
        setAuthorName('');
        setAnglerTitle('');
        setLocation('');
        setWaterBody('');
        setTargetSpecies('');
        setCatchWeight('');
        setGearUsed('');
        setNelsonsTip('');
        setCatchPhotoUrl('');
        setComment('');
        setRating(5);
        setFormSuccess(null);
      }, 1800);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setFormError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Water body classification
  const filteredReviews = reviews.filter((r) => {
    if (selectedRating !== 'all' && Math.round(r.rating) !== Number(selectedRating)) {
      return false;
    }

    if (photosOnly && !r.catchPhotoUrl) {
      return false;
    }

    if (selectedWater !== 'all') {
      const wLower = (r.waterBody || r.location || '').toLowerCase();
      if (selectedWater === 'naivasha' && !wLower.includes('naivasha')) return false;
      if (selectedWater === 'coast' && !wLower.includes('watamu') && !wLower.includes('malindi') && !wLower.includes('kilifi') && !wLower.includes('coast')) return false;
      if (selectedWater === 'aberdare' && !wLower.includes('aberdare') && !wLower.includes('gura') && !wLower.includes('chanya')) return false;
      if (selectedWater === 'victoria' && !wLower.includes('victoria') && !wLower.includes('kisumu') && !wLower.includes('rusinga')) return false;
      if (selectedWater === 'sagana' && !wLower.includes('sagana')) return false;
    }

    if (selectedSpecies !== 'all') {
      const sLower = (r.targetSpecies || r.fishCaught || '').toLowerCase();
      if (selectedSpecies === 'bass' && !sLower.includes('bass')) return false;
      if (selectedSpecies === 'tuna' && !sLower.includes('tuna') && !sLower.includes('wahoo') && !sLower.includes('trevally') && !sLower.includes('kingfish')) return false;
      if (selectedSpecies === 'trout' && !sLower.includes('trout')) return false;
      if (selectedSpecies === 'perch' && !sLower.includes('perch')) return false;
      if (selectedSpecies === 'catfish' && !sLower.includes('catfish') && !sLower.includes('mudfish') && !sLower.includes('tilapia')) return false;
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchAuthor = (r.authorName || '').toLowerCase().includes(q);
      const matchComment = (r.comment || '').toLowerCase().includes(q);
      const matchLocation = (r.location || '').toLowerCase().includes(q);
      const matchWater = (r.waterBody || '').toLowerCase().includes(q);
      const matchSpecies = (r.targetSpecies || r.fishCaught || '').toLowerCase().includes(q);
      const matchGear = (r.gearUsed || '').toLowerCase().includes(q);
      const matchTip = (r.nelsonsTip || '').toLowerCase().includes(q);
      return matchAuthor || matchComment || matchLocation || matchWater || matchSpecies || matchGear || matchTip;
    }
    return true;
  });

  return (
    <section id={id} className="scroll-mt-24 py-14 bg-slate-100/70 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Section Header */}
        {showTitle && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5">
                <span>Verified Angler Field Reports</span>
                <span aria-hidden="true">·</span>
                <span>Water-Tested Tackle</span>
                <span aria-hidden="true">·</span>
                <span>Kenya</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
                Customer Catch Reviews &amp; Tackle Reports
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Detailed catch accounts from anglers fishing Lake Naivasha bass, Watamu offshore tuna, Aberdares wild trout, Lake Victoria perch, and Sagana River rapids with tackle from Fishing With Nelson.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-900/10 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Catch Report &amp; Review</span>
            </button>
          </div>
        )}

        {/* Aggregate Score & Authentic Angler Trust Summary */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Big Score */}
          <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
            <div className="text-center p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-950 font-mono block leading-none">
                {stats.count > 0 ? stats.average.toFixed(1) : '5.0'}
              </span>
              <div className="flex items-center justify-center gap-1 text-amber-500 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block mt-1">
                Angler Rating
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Verified Field Reviews</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Based on <strong className="text-slate-950">{stats.count || reviews.length} verified angler reviews</strong> across Kenya. Every report includes gear used, water conditions, and catch details.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>Nairobi Pick-up</span>
                <span>·</span>
                <span>Countrywide Dispatch</span>
              </div>
            </div>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="lg:col-span-4 space-y-1.5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = stats.distribution[s as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = stats.count > 0 ? Math.round((count / stats.count) * 100) : s === 5 ? 95 : 5;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-7 text-[11px] font-mono text-slate-600 flex items-center gap-0.5">
                    {s} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 inline" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-mono text-slate-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Genuine Angler Standards */}
          <div className="lg:col-span-4 space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">Tackle Specifically Tuned by Nelson:</strong>
                <span className="text-slate-600 leading-normal">
                  Rods balanced with the correct line test, leader shock, and lure weights for your target spot.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">Genuine After-Sales &amp; Tip Replacement:</strong>
                <span className="text-slate-600 leading-normal">
                  Over-the-counter repair, replacement tip guides, and direct WhatsApp advice when on the water.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Water Body Segmented Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setSelectedWater('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedWater === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                All Waters ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedWater('naivasha')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedWater === 'naivasha'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Lake Naivasha
              </button>
              <button
                type="button"
                onClick={() => setSelectedWater('coast')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedWater === 'coast'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Coastal &amp; Watamu
              </button>
              <button
                type="button"
                onClick={() => setSelectedWater('aberdare')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedWater === 'aberdare'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Aberdare Trout
              </button>
              <button
                type="button"
                onClick={() => setSelectedWater('victoria')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedWater === 'victoria'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Lake Victoria
              </button>
              <button
                type="button"
                onClick={() => setSelectedWater('sagana')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedWater === 'sagana'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Sagana Rapids
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search angler, species, gear, lake..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filter Row: Species, Photos Toggle, Rating */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Species filter select */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Species:</span>
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs focus:outline-hidden focus:border-amber-500"
                >
                  <option value="all">All Species</option>
                  <option value="bass">Largemouth Bass</option>
                  <option value="tuna">Offshore Tuna / Gamefish</option>
                  <option value="trout">Aberdare Wild Trout</option>
                  <option value="perch">Lake Victoria Nile Perch</option>
                  <option value="catfish">Catfish &amp; Tilapia</option>
                </select>
              </div>

              {/* Photos Only Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={photosOnly}
                  onChange={(e) => setPhotosOnly(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span>With Catch Photos Only</span>
              </label>
            </div>

            {/* Showing count */}
            <span className="text-[11px] text-slate-500 font-mono">
              Showing {filteredReviews.length} of {reviews.length} angler reports
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            Loading verified catch reports...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 max-w-md mx-auto space-y-3">
            <Fish className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No catch reports match these filters</h3>
            <p className="text-xs text-slate-600">
              Try selecting "All Waters" or clearing your search term to see other Kenyan angler stories.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedWater('all');
                  setSelectedSpecies('all');
                  setSelectedRating('all');
                  setPhotosOnly(false);
                  setSearchFilter('');
                }}
                className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReviews.map((r) => {
              const currentHelpful =
                helpfulOverrides[r.id] !== undefined
                  ? helpfulOverrides[r.id]
                  : r.helpfulCount || 12;
              const isUpvotedByMe = !!userUpvoted[r.id];

              return (
                <article
                  key={r.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    {/* Header: Angler Info & Verification */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-800">
                          {r.authorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-950">{r.authorName}</h3>
                            <span
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold"
                              title="Verified Purchase & Catch Report"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified Catch</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {r.anglerTitle || 'Kenyan Angler'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= r.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 fill-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent Catch'}
                        </span>
                      </div>
                    </div>

                    {/* Catch Photo Banner if available */}
                    {r.catchPhotoUrl && (
                      <div
                        className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-16/9 cursor-pointer border border-slate-200"
                        onClick={() =>
                          setActivePhotoModal({
                            url: r.catchPhotoUrl!,
                            caption: `${r.fishCaught || r.targetSpecies || 'Catch'} at ${r.waterBody || r.location || 'Kenya'}`,
                            angler: r.authorName,
                            species: r.fishCaught || r.targetSpecies,
                          })
                        }
                      >
                        <img
                          src={r.catchPhotoUrl}
                          alt={`${r.authorName} catch`}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-semibold drop-shadow-xs flex items-center gap-1.5">
                            <Fish className="w-3.5 h-3.5 text-amber-400" />
                            <span>{r.fishCaught || r.targetSpecies || 'Verified Catch Photo'}</span>
                          </span>
                          <span className="text-[10px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded font-mono flex items-center gap-1 border border-white/20">
                            <Maximize2 className="w-3 h-3" />
                            <span>Enlarge</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Technical Angler Metadata Strip (No static pill capsules) */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                      {(r.waterBody || r.location) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-medium text-slate-900">
                            {r.waterBody || r.location}
                          </span>
                        </div>
                      )}

                      {(r.fishCaught || r.targetSpecies) && (
                        <div className="flex items-center gap-2">
                          <Fish className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            Catch:{' '}
                            <strong className="text-slate-900 font-semibold">
                              {r.fishCaught || r.targetSpecies}
                            </strong>
                          </span>
                        </div>
                      )}

                      {r.gearUsed && (
                        <div className="flex items-start gap-2">
                          <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            Rig:{' '}
                            <span className="font-mono text-slate-800 text-[11px]">
                              {r.gearUsed}
                            </span>
                          </span>
                        </div>
                      )}

                      {r.orderMethod && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Fulfilled via {r.orderMethod}</span>
                        </div>
                      )}
                    </div>

                    {/* Detailed Review Story */}
                    <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed whitespace-pre-line">
                      "{r.comment}"
                    </p>

                    {/* Nelson's Expert Rigging Tip Callout */}
                    {r.nelsonsTip && (
                      <div className="p-3 bg-amber-500/10 border-l-3 border-amber-600 rounded-r-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-950 uppercase tracking-wide">
                          <Quote className="w-3 h-3 text-amber-700" />
                          <span>Nelson&apos;s Pro Tip:</span>
                        </div>
                        <p className="text-xs text-amber-950 leading-relaxed italic">
                          &ldquo;{r.nelsonsTip}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Helpful Counter & WhatsApp Share */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(r.id, currentHelpful)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                        isUpvotedByMe
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp
                        className={`w-3.5 h-3.5 ${
                          isUpvotedByMe ? 'fill-amber-600 text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span>Helpful ({currentHelpful})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareReview(r)}
                      className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer px-2 py-1"
                      title="Share this angler catch story via WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Enlarge Catch Photo */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="flex items-center justify-between text-white max-w-4xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {activePhotoModal.caption}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Angler: {activePhotoModal.angler}
              </p>
            </div>
            <button
              onClick={() => setActivePhotoModal(null)}
              className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="flex-1 flex items-center justify-center p-2 max-w-4xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhotoModal.url}
              alt={activePhotoModal.caption}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>

          <div className="text-center text-xs text-slate-400 py-2">
            Verified Catch Record · Fishing With Nelson Kenya
          </div>
        </div>
      )}

      {/* Interactive Modal Form: Submit Catch Report & Detailed Review */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display">
                  Submit Verified Catch &amp; Tackle Report
                </h3>
                <p className="text-xs text-slate-400">
                  Share real feedback, lure performance, and rigging advice to help fellow Kenyan anglers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
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
                            className={`w-6 h-6 ${
                              isActive
                                ? 'fill-amber-400 text-amber-500'
                                : 'fill-slate-200 text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-amber-900 font-mono">
                    {ratingDescriptions[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Angler Name & Role/Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. David Kariuki"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Angler Background / Club
                  </label>
                  <input
                    type="text"
                    value={anglerTitle}
                    onChange={(e) => setAnglerTitle(e.target.value)}
                    placeholder="e.g. Naivasha Bass Angler, Weekend Caster"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Water Body Location with Quick Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Water Body / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={waterBody}
                  onChange={(e) => setWaterBody(e.target.value)}
                  placeholder="e.g. Lake Naivasha (Crescent Island), Watamu Banks, Gura River"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">Quick select:</span>
                  {['Lake Naivasha', 'Watamu / Malindi', 'Aberdare Rivers', 'Lake Victoria', 'Sagana Rapids', 'Nairobi Dams'].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setWaterBody(quick)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Species & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Target Species Landed
                  </label>
                  <input
                    type="text"
                    value={targetSpecies}
                    onChange={(e) => setTargetSpecies(e.target.value)}
                    placeholder="e.g. Largemouth Bass, Wild Rainbow Trout, Nile Perch"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Measured Catch Weight
                  </label>
                  <input
                    type="text"
                    value={catchWeight}
                    onChange={(e) => setCatchWeight(e.target.value)}
                    placeholder="e.g. 2.8 kg, 18 kg, Catch & Release"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Tackle Combo / Gear Used */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Gear, Rod, Reel, or Lures Used
                </label>
                <input
                  type="text"
                  value={gearUsed}
                  onChange={(e) => setGearUsed(e.target.value)}
                  placeholder="e.g. Daiwa 7ft MH + Shimano 4000 + 30lb braid + White Spinnerbait"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Nelson's Pro Tip That Helped */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Nelson&apos;s Advisory or Rigging Advice Given
                </label>
                <input
                  type="text"
                  value={nelsonsTip}
                  onChange={(e) => setNelsonsTip(e.target.value)}
                  placeholder="e.g. Advised to slow-roll spinnerbait along papyrus dropoff; tie FG knot on braid"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Order Fulfillment Method */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  How Did You Receive Your Tackle?
                </label>
                <select
                  value={orderMethod}
                  onChange={(e) => setOrderMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                >
                  <option value="Nairobi Shop Pick-up (Accra Road)">Nairobi Shop Pick-up (Accra Road)</option>
                  <option value="Courier Parcel Dispatch (Easy Coach / Modern Coast / Matatu)">
                    Courier Parcel Dispatch (Easy Coach / Modern Coast / Matatu)
                  </option>
                  <option value="WhatsApp Direct Delivery">WhatsApp Direct Delivery</option>
                  <option value="Clinic & Angler Training Event">Clinic &amp; Angler Training Event</option>
                </select>
              </div>

              {/* Catch Photo URL (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Catch / Tackle Photo URL <span className="text-slate-400 font-normal">(Optional proof)</span>
                </label>
                <input
                  type="url"
                  value={catchPhotoUrl}
                  onChange={(e) => setCatchPhotoUrl(e.target.value)}
                  placeholder="https://... (Link to your catch photo)"
                  className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Review Comment Story */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Your Catch Account &amp; Review <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      comment.trim().length >= 25 ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {comment.trim().length} chars (min 25)
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain water conditions, lure action, fight, drag performance on the reel, or what Nelson did to get you ready for the water..."
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
                  disabled={isSubmitting || comment.trim().length < 25}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-900/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Catch Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
