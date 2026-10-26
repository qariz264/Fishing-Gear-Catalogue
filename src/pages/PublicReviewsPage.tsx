import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SiteReviewsSection } from '../components/SiteReviewsSection';
import { setPageSeo } from '../utils/seo';
import { Star, ShieldCheck, MessageSquare, ThumbsUp } from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';

export const PublicReviewsPage: React.FC = () => {
  useEffect(() => {
    setPageSeo({
      title: 'Customer Reviews & Angler Feedback - Fishing With Nelson Kenya',
      description:
        'Read genuine customer reviews, catch testimonials, and ratings from Kenyan anglers who buy rods, reels, lures, and tackle from Fishing With Nelson in Nairobi.',
      canonicalPath: '/reviews',
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-900">
      <Header />

      <main className="flex-1">
        {/* Page Hero Banner */}
        <section className="bg-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-50" />
          <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0 Rated by Anglers Across Kenya</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display max-w-3xl mx-auto">
              Customer Reviews &amp; Angler Testimonials
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Real stories from anglers fishing Lake Naivasha, the Indian Ocean at Watamu &amp; Malindi, Sagana River, Lake Victoria, and public waters countrywide.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Purchases
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-amber-400" />
                Prompt WhatsApp Support
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Expert Angler Advice
              </span>
            </div>
          </div>
        </section>

        {/* Site Reviews Section */}
        <SiteReviewsSection showTitle={false} />
      </main>

      <Footer showReviews={false} />
    </div>
  );
};
