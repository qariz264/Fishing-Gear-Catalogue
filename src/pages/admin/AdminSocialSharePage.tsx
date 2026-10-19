import React, { useState, useEffect } from 'react';
import {
  getSocialShareSettings,
  saveSocialShareSettings,
  subscribeToSocialShareSettings,
  DEFAULT_SHARE_IMAGE,
  DEFAULT_SHARE_TITLE,
  DEFAULT_SHARE_DESCRIPTION,
} from '../../services/settingsService';
import { SocialShareSettings } from '../../types/admin';
import { AdminImageUploader } from '../../components/admin/AdminImageUploader';
import { setPageSeo, CANONICAL_BASE_URL } from '../../utils/seo';
import {
  Share2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Smartphone,
  Globe,
  Download,
  Info,
  Check,
  Sparkles,
  Eye,
  RefreshCw,
  Send,
} from 'lucide-react';

export const AdminSocialSharePage: React.FC = () => {
  const [settings, setSettings] = useState<SocialShareSettings>({
    id: 'socialShare',
    shareImageUrl: DEFAULT_SHARE_IMAGE,
    shareTitle: DEFAULT_SHARE_TITLE,
    shareDescription: DEFAULT_SHARE_DESCRIPTION,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<'whatsapp' | 'twitter' | 'facebook'>('whatsapp');
  const [copiedLink, setCopiedLink] = useState(false);
  const [cacheBusterUrl, setCacheBusterUrl] = useState('');

  useEffect(() => {
    setPageSeo({
      title: 'Shared Link & Social Card - Admin Console',
      noindex: true,
    });

    const init = async () => {
      setLoading(true);
      try {
        const loaded = await getSocialShareSettings();
        setSettings(loaded);
      } catch (err: any) {
        console.error('Failed to load social share settings:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
    updateCacheBuster();

    const unsubscribe = subscribeToSocialShareSettings((updated) => {
      setSettings(updated);
    });

    return () => unsubscribe();
  }, []);

  const updateCacheBuster = () => {
    const timestamp = Date.now().toString(36);
    setCacheBusterUrl(`${CANONICAL_BASE_URL}/?v=${timestamp}`);
  };

  const handleImageUploaded = (url: string, storagePath: string) => {
    setSettings((prev) => ({
      ...prev,
      shareImageUrl: url,
      shareImageStoragePath: storagePath,
    }));
    setSaveSuccess(false);
  };

  const handleResetToBrandLogo = () => {
    setSettings((prev) => ({
      ...prev,
      shareImageUrl: `${CANONICAL_BASE_URL}/og-image.jpg`,
      shareImageStoragePath: 'default/brand-og-image',
    }));
    setSaveSuccess(false);
  };

  const handleResetAllToDefaults = () => {
    setSettings({
      id: 'socialShare',
      shareImageUrl: `${CANONICAL_BASE_URL}/og-image.jpg`,
      shareTitle: DEFAULT_SHARE_TITLE,
      shareDescription: DEFAULT_SHARE_DESCRIPTION,
      shareImageStoragePath: 'default/brand-og-image',
    });
    setSaveSuccess(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const saved = await saveSocialShareSettings(settings);
      setSettings(saved);
      setSaveSuccess(true);
      updateCacheBuster();
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCacheBustLink = async () => {
    try {
      await navigator.clipboard.writeText(cacheBusterUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Shared Link & Social Card Manager
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              OpenGraph & WhatsApp
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl">
            Upload and customize the image, title, and description that appear when you share{' '}
            <code className="text-amber-300 font-mono text-xs bg-slate-900 px-1.5 py-0.5 rounded">
              fishingwithnelson.co.ke
            </code>{' '}
            on WhatsApp, Facebook, X (Twitter), iMessage, and LinkedIn.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-900/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Live Site...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Update Shared Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-100">
                Shared link image & metadata saved successfully!
              </p>
              <p className="text-emerald-300/80 text-[11px] mt-0.5">
                The OpenGraph image and tags are updated in Firestore and on live pages. Use the cache-busting link below to test instantly on WhatsApp without waiting for cache expiration.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-400 hover:text-white text-xs font-semibold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Real-Time Previews Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Upload & Meta Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Image Upload */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Shared Link Photo (OpenGraph Image)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleResetToBrandLogo}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Use the official blue circular badge with the fish mascot"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Official Fish Badge</span>
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Upload the exact image you want WhatsApp, Facebook, and Twitter to display.
              Recommended format: <strong>1200 × 630 pixels</strong> (or square 800 × 800) in JPG or PNG format.
            </p>

            <AdminImageUploader
              currentImageUrl={settings.shareImageUrl}
              currentStoragePath={settings.shareImageStoragePath}
              folder="branding"
              onImageUploaded={handleImageUploaded}
              onImageRemoved={handleResetToBrandLogo}
              label="Select or Upload New Link Image"
              aspectHint="Displays at 1.91:1 ratio on web & square on mobile"
            />

            {/* Quick Presets */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-mono">Quick Brand Options:</span>
              <button
                type="button"
                onClick={() =>
                  handleImageUploaded(`${CANONICAL_BASE_URL}/og-image.jpg`, 'default/og-image')
                }
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3 h-3 text-amber-400" />
                <span>1200×630 Brand Banner</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleImageUploaded(`${CANONICAL_BASE_URL}/linkpic.jpeg`, 'default/linkpic')
                }
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3 h-3 text-blue-400" />
                <span>800×800 Circle Badge</span>
              </button>
              {settings.shareImageUrl && (
                <a
                  href={settings.shareImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors flex items-center gap-1 ml-auto"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>Open Full Image</span>
                </a>
              )}
            </div>
          </div>

          {/* Card 2: Link Share Text Fields */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Link Share Title & Description
                </h2>
              </div>
              <button
                type="button"
                onClick={handleResetAllToDefaults}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Text</span>
              </button>
            </div>

            {/* Share Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Shared Link Title (og:title)
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    settings.shareTitle.length > 70 ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {settings.shareTitle.length}/70 chars
                </span>
              </div>
              <input
                type="text"
                value={settings.shareTitle}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, shareTitle: e.target.value }))
                }
                placeholder="Fishing With Nelson - Premium Fishing Gear, Spots & Training Kenya"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                maxLength={100}
              />
              <p className="text-[11px] text-slate-400">
                The bold headline shown in WhatsApp and social media chat cards.
              </p>
            </div>

            {/* Share Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Shared Link Description (og:description)
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    settings.shareDescription.length > 160 ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {settings.shareDescription.length}/160 chars
                </span>
              </div>
              <textarea
                value={settings.shareDescription}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, shareDescription: e.target.value }))
                }
                placeholder="Browse quality rods, reels, lures, hooks, fishing spots, and training clinics..."
                rows={3}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                maxLength={240}
              />
              <p className="text-[11px] text-slate-400">
                Shown below the title in chat previews and search snippets. Keep under 160 characters.
              </p>
            </div>

            {/* Canonical Base URL Display */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Link Destination:</span>
                <span className="font-mono text-amber-300 font-semibold">{CANONICAL_BASE_URL}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                Strict Canonical
              </span>
            </div>
          </div>

          {/* Save Button Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full md:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Applying New Image to Shared Link...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Apply New Link Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time Social Preview & WhatsApp Testing */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Live Social Simulator */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Link Preview
                </h2>
              </div>

              {/* Platform Selector */}
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('whatsapp')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    previewPlatform === 'whatsapp'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('twitter')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    previewPlatform === 'twitter'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  X / Twitter
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('facebook')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    previewPlatform === 'facebook'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Facebook
                </button>
              </div>
            </div>

            {/* PREVIEW 1: WhatsApp Chat Bubble Simulation */}
            {previewPlatform === 'whatsapp' && (
              <div className="p-4 bg-[#0b141a] rounded-xl border border-slate-800 space-y-3 font-sans">
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Smartphone className="w-3 h-3" /> WhatsApp Mobile Chat
                  </span>
                  <span>Today 12:45 PM</span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="max-w-sm bg-[#005c4b] text-white rounded-2xl rounded-tr-xs p-1.5 shadow-md space-y-1.5 ml-auto">
                  {/* Link Preview Card inside WhatsApp */}
                  <div className="bg-[#025144] rounded-xl overflow-hidden border border-emerald-700/40">
                    {/* Media container */}
                    <div className="h-44 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      <img
                        src={settings.shareImageUrl || DEFAULT_SHARE_IMAGE}
                        alt="WhatsApp Preview"
                        className="w-full h-full object-contain bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `${CANONICAL_BASE_URL}/og-image.jpg`;
                        }}
                      />
                    </div>
                    {/* Card text */}
                    <div className="p-2.5 space-y-1">
                      <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {settings.shareTitle || DEFAULT_SHARE_TITLE}
                      </p>
                      <p className="text-[11px] text-emerald-100/75 line-clamp-2 leading-relaxed">
                        {settings.shareDescription || DEFAULT_SHARE_DESCRIPTION}
                      </p>
                      <p className="text-[10px] text-emerald-200/60 font-mono pt-0.5">
                        fishingwithnelson.co.ke
                      </p>
                    </div>
                  </div>

                  {/* Message body with link */}
                  <div className="px-1.5 pb-0.5 flex items-end justify-between gap-3 text-xs">
                    <span className="text-emerald-100 underline truncate max-w-[200px]">
                      https://fishingwithnelson.co.ke
                    </span>
                    <span className="text-[10px] text-emerald-200/60 shrink-0 font-mono">
                      12:45 ✓✓
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW 2: Twitter / X Summary Large Card */}
            {previewPlatform === 'twitter' && (
              <div className="p-4 bg-black rounded-xl border border-slate-800 space-y-3 font-sans">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 text-blue-400">
                  <span>X / Twitter Summary Large Image</span>
                </div>

                {/* Twitter Post Card */}
                <div className="rounded-2xl border border-slate-800 bg-[#080808] overflow-hidden hover:border-slate-700 transition-colors">
                  <div className="h-48 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={settings.shareImageUrl || DEFAULT_SHARE_IMAGE}
                      alt="Twitter Preview"
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[11px] text-slate-500 font-mono block">
                      fishingwithnelson.co.ke
                    </span>
                    <p className="text-xs font-bold text-white line-clamp-1">
                      {settings.shareTitle || DEFAULT_SHARE_TITLE}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {settings.shareDescription || DEFAULT_SHARE_DESCRIPTION}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW 3: Facebook / LinkedIn Card */}
            {previewPlatform === 'facebook' && (
              <div className="p-4 bg-[#18191a] rounded-xl border border-slate-800 space-y-3 font-sans">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 text-indigo-400">
                  <span>Facebook Feed Link Card</span>
                </div>

                <div className="rounded-lg border border-[#3a3b3c] bg-[#242526] overflow-hidden">
                  <div className="h-44 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={settings.shareImageUrl || DEFAULT_SHARE_IMAGE}
                      alt="Facebook Preview"
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                  <div className="p-3 space-y-1 bg-[#242526]">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      FISHINGWITHNELSON.CO.KE
                    </span>
                    <p className="text-xs font-bold text-slate-100 line-clamp-1">
                      {settings.shareTitle || DEFAULT_SHARE_TITLE}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {settings.shareDescription || DEFAULT_SHARE_DESCRIPTION}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card: Instant WhatsApp Cache Testing Guide */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3.5">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                How WhatsApp Link Previews Work
              </h3>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              When a link is shared in WhatsApp, WhatsApp crawls{' '}
              <code className="text-amber-300 font-mono text-[10px] bg-slate-950 px-1 py-0.5 rounded">
                https://fishingwithnelson.co.ke
              </code>{' '}
              and stores a cached copy of the preview photo for 7 to 14 days.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 font-semibold block">
                Instant WhatsApp Test (Cache-Busting Link):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={cacheBusterUrl}
                  className="flex-1 text-[11px] font-mono px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyCacheBustLink}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Paste this link directly into any WhatsApp chat. The unique query parameter forces WhatsApp to fetch your newly uploaded brand image instantly instead of using its old cache!
              </p>
            </div>

            {/* External Debuggers */}
            <div className="pt-1 flex flex-col gap-1.5 text-[11px]">
              <span className="text-slate-400 font-mono text-[10px]">Official Web Crawler Debuggers:</span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Ffishingwithnelson.co.ke%2F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                  <span>Meta / Facebook Sharing Debugger</span>
                </a>
                <a
                  href="https://cards-dev.twitter.com/validator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>X / Twitter Card Validator</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
