import React from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_PHONE_FORMATTED, WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';
import { MessageSquare, MapPin, Clock, Lock, Youtube, Facebook, Instagram } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onSelectCategory?: (cat: string) => void;
}

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.27 8.27 0 0 0 4.77 1.48V7.08a4.84 4.84 0 0 1-1-.39z" />
  </svg>
);

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Store Information, Address, Hours & Navigation Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand & Mission */}
            <div className="space-y-3">
              <div className="inline-block bg-white px-3 py-1.5 rounded-xl shadow-xs">
                <Logo className="h-8 w-auto" />
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Premium fishing gear catalogue in Nairobi, Kenya. Dedicated to supplying quality rods, reels, lures, and terminal tackle with personalized advice and countrywide delivery.
              </p>
              <div className="pt-1">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent('Hello Nelson, I would like to inquire about fishing equipment.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg transition-colors border border-emerald-500/30 font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp: {WHATSAPP_PHONE_FORMATTED}</span>
                </a>
              </div>

              {/* Social Media Links */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-mono text-slate-300 font-semibold uppercase tracking-wider block">
                  Connect With Nelson
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://youtube.com/@fishwithnelson?si=bBgWEao0xFrVsKy9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                    title="YouTube @fishwithnelson"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@fishinggwithnelson?_r=1&_t=ZS-9AYEHPIw1Ek"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-colors"
                    title="TikTok @fishinggwithnelson"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.facebook.com/share/1CmZqFeGGW/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors"
                    title="Facebook"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com/fishingwithnelson?mdxt=MXMwM3V5a3JkZGNxZQ%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-500/10 transition-colors"
                    title="Instagram @fishingwithnelson"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Physical Address & Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold uppercase tracking-wider text-[11px] font-mono">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Shop Address</span>
              </div>
              <div className="text-slate-300 space-y-1 leading-relaxed">
                <p className="font-semibold text-white">Fishing With Nelson</p>
                <p>Rumwe Building, 1st Floor, Room 3AB,</p>
                <p>Mfangano Street,</p>
                <p>Nairobi, Kenya.</p>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold uppercase tracking-wider text-[11px] font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Opening Hours</span>
              </div>
              <div className="text-slate-300 space-y-1.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Monday – Saturday:</span>
                  <span className="font-semibold text-white font-mono">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-400">Sunday:</span>
                  <span className="text-rose-400 font-medium">Closed</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-3">
              <div className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] font-mono">
                Explore & Portals
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Fishing Gear Catalogue
                  </Link>
                </li>
                <li>
                  <Link to="/fishing-spots" className="hover:text-white transition-colors">
                    Fishing Spots Guide
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="hover:text-white transition-colors">
                    Fishing Blog & Techniques
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-white transition-colors">
                    Events & Tournaments
                  </Link>
                </li>
                <li>
                  <Link to="/training" className="hover:text-white transition-colors">
                    Fishing Training & Clinics
                  </Link>
                </li>
                <li className="pt-2 border-t border-slate-900">
                  <Link
                    to="/admin/login"
                    className="text-slate-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1 text-[11px]"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Admin Dashboard Portal</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} Fishing With Nelson. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Rumwe Building, Mfangano St, Nairobi</span>
            <span>·</span>
            <span>Tel: {WHATSAPP_PHONE_FORMATTED}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
