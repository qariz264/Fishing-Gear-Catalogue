import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Package,
  BookOpen,
  Calendar,
  GraduationCap,
  MapPin,
  Plus,
  ExternalLink,
  ShieldCheck,
  HardDrive,
  Database,
  ArrowRight,
  Star,
  Share2,
  Upload,
} from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';
import {
  getSocialShareSettings,
  subscribeToSocialShareSettings,
  DEFAULT_SHARE_IMAGE,
  DEFAULT_SHARE_TITLE,
  DEFAULT_SHARE_DESCRIPTION,
} from '../../services/settingsService';
import { SocialShareSettings } from '../../types/admin';

export const AdminDashboardOverview: React.FC = () => {
  const [socialSettings, setSocialSettings] = useState<SocialShareSettings>({
    id: 'socialShare',
    shareImageUrl: DEFAULT_SHARE_IMAGE,
    shareTitle: DEFAULT_SHARE_TITLE,
    shareDescription: DEFAULT_SHARE_DESCRIPTION,
  });
  const [counts, setCounts] = useState({
    products: 0,
    publishedProducts: 0,
    blogs: 0,
    publishedBlogs: 0,
    events: 0,
    training: 0,
    spots: 0,
    reviews: 0,
  });

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      let published = 0;
      snap.forEach((d) => {
        if (d.data().published !== false) published++;
      });
      setCounts((prev) => ({ ...prev, products: snap.size, publishedProducts: published }));
    });

    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snap) => {
      let published = 0;
      snap.forEach((d) => {
        if (d.data().published === true) published++;
      });
      setCounts((prev) => ({ ...prev, blogs: snap.size, publishedBlogs: published }));
    });

    const unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
      setCounts((prev) => ({ ...prev, events: snap.size }));
    });

    const unsubTraining = onSnapshot(collection(db, 'training'), (snap) => {
      setCounts((prev) => ({ ...prev, training: snap.size }));
    });

    const unsubSpots = onSnapshot(collection(db, 'fishingSpots'), (snap) => {
      setCounts((prev) => ({ ...prev, spots: snap.size }));
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snap) => {
      setCounts((prev) => ({ ...prev, reviews: snap.size }));
    });

    const unsubSocial = subscribeToSocialShareSettings((loaded) => {
      setSocialSettings(loaded);
    });

    getSocialShareSettings().then(setSocialSettings).catch(() => {});

    return () => {
      unsubProducts();
      unsubBlogs();
      unsubEvents();
      unsubTraining();
      unsubSpots();
      unsubReviews();
      unsubSocial();
    };
  }, []);

  const sections = [
    {
      title: 'Products Catalogue',
      count: counts.products,
      subtitle: `${counts.publishedProducts} active on store`,
      path: '/admin/products',
      addPath: '/admin/products?action=new',
      icon: Package,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Manage rods, reels, lures, hooks, nets, specifications & photos.',
    },
    {
      title: 'Blog Articles',
      count: counts.blogs,
      subtitle: `${counts.publishedBlogs} published articles`,
      path: '/admin/blogs',
      addPath: '/admin/blogs?action=new',
      icon: BookOpen,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Fishing tips, bait guides, technique breakdowns & catch stories.',
    },
    {
      title: 'Events & Tournaments',
      count: counts.events,
      subtitle: 'Tournaments & meetups',
      path: '/admin/events',
      addPath: '/admin/events?action=new',
      icon: Calendar,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Lake Naivasha, Victoria, and deep sea fishing competitions.',
    },
    {
      title: 'Fishing Training',
      count: counts.training,
      subtitle: 'Workshops & classes',
      path: '/admin/training',
      addPath: '/admin/training?action=new',
      icon: GraduationCap,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'Casting clinics, bait rigging, reel tuning and beginner classes.',
    },
    {
      title: 'Customer Reviews',
      count: counts.reviews,
      subtitle: `${counts.reviews} angler ratings`,
      path: '/admin/reviews',
      icon: Star,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Customer ratings, testimonials, verified catch reports and feedback.',
    },
    {
      title: 'Fishing Spots Guide',
      count: counts.spots,
      subtitle: 'Kenya angling destinations',
      path: '/admin/fishing-spots',
      addPath: '/admin/fishing-spots?action=new',
      icon: MapPin,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      description: 'Locations, species, access instructions, and facilities guide.',
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Administrator Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            FishWithNelson live management portal. Changes sync in real-time to the public website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Website</span>
          </a>
        </div>
      </div>

      {/* Cloud & Project Architecture Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 block font-mono">Firestore Database</span>
            <span className="text-xs font-semibold text-white truncate block">
              {firebaseConfig.firestoreDatabaseId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 block font-mono">Firebase Storage Bucket</span>
            <span className="text-xs font-semibold text-white truncate block">
              {firebaseConfig.storageBucket}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 block font-mono">Security Status</span>
            <span className="text-xs font-semibold text-emerald-400 truncate block">
              Role-Based Access Protected
            </span>
          </div>
        </div>
      </div>

      {/* Management Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider">
          Catalogue & Content Sections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((section) => (
            <div
              key={section.path}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${section.color}`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold font-mono text-white">
                    {section.count}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {section.title}
                  </h3>
                  <span className="text-xs text-amber-500/90 font-medium block mt-0.5">
                    {section.subtitle}
                  </span>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  to={section.path}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {section.addPath && (
                  <Link
                    to={section.addPath}
                    className="py-2 px-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-500/30 transition-colors"
                    title="Create new entry"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Link Share & OpenGraph Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Social Link Share Preview (WhatsApp, Facebook, Twitter)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              This photo and title appear whenever someone shares your store link on WhatsApp, Facebook, iMessage, or Twitter.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/social-share"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Change Link Image</span>
            </Link>
            <a
              href={socialSettings.shareImageUrl || '/og-image.jpg'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors w-fit"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Full Image</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
          {/* Card Image Preview */}
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[1200/630] shadow-inner group flex items-center justify-center">
            <img
              src={socialSettings.shareImageUrl || '/og-image.jpg'}
              alt="Fishing With Nelson Link Preview"
              className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.01]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/og-image.jpg';
              }}
            />
            <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              ✓ Active Share Card (1200×630)
            </div>
            <Link
              to="/admin/social-share"
              className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-white text-[11px] font-medium rounded-lg border border-slate-700 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-amber-400" />
              <span>Configure Card</span>
            </Link>
          </div>

          {/* Share metadata info */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Brand Title:</span>
              <span className="font-semibold text-white line-clamp-2">
                {socialSettings.shareTitle || DEFAULT_SHARE_TITLE}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Description:</span>
              <span className="text-slate-300 line-clamp-3">
                {socialSettings.shareDescription || DEFAULT_SHARE_DESCRIPTION}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Image Source:</span>
              <span className="font-mono text-amber-400 text-[10px] break-all">
                {socialSettings.shareImageUrl || 'https://fishingwithnelson.co.ke/og-image.jpg'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Ready for WhatsApp
              </span>
              <Link
                to="/admin/social-share"
                className="text-amber-400 hover:text-amber-300 text-[11px] font-medium underline"
              >
                Open Full Manager →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
