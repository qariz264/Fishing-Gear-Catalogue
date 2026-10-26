import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SiteReviewsSection } from '../components/SiteReviewsSection';
import { setPageSeo } from '../utils/seo';
import { Star, ShieldCheck, MessageSquare, ThumbsUp, Fish, MapPin } from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';

export const PublicReviewsPage: React.FC = () => {
  useEffect(() => {
    setPageSeo({
      title: 'Verified Angler Reviews & Catch Field Reports - Fishing With Nelson Kenya',
      description:
        'Read authentic catch field reports, tackle performance reviews, and rigging feedback from Kenyan anglers fishing Lake Naivasha, Watamu, Aberdares, Sagana, and Lake Victoria.',
      canonicalPath: '/reviews',
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-900">
      <Header />

      <main className="flex-1">
        {/* Page Hero Banner */}
        <section className="bg-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-40 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-medium text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>5.0 / 5.0 Rating · Verified Kenyan Anglers</span>
              <span aria-hidden="true">·</span>
              <span>Water-Tested Tackle</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display max-w-3xl mx-auto">
              Customer Catch Reviews &amp; Field Reports
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              No generic testimonials. Read detailed water reports, tackle combos used, species landed, and rigging advice from anglers across Kenya.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Tackle &amp; Catch Records
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                Naivasha, Watamu, Aberdares &amp; Victoria
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Nelson&apos;s Rigging Tips
              </span>
            </div>
          </div>
        </section>

        {/* Site Reviews Section */}
        <SiteReviewsSection showTitle={false} />
      </main>

      <Footer />
    </div>
  );
};
