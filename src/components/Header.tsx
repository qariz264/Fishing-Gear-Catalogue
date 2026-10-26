import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Menu, X } from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL, WHATSAPP_PHONE_FORMATTED } from '../utils/whatsapp';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';
import { TopEventsBanner } from './TopEventsBanner';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onSelectCategory?: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount: propCartCount,
  onOpenCart: propOnOpenCart,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cartContext = useCart();

  const cartCount = propCartCount !== undefined ? propCartCount : cartContext.totalCartCount;
  const onOpenCart = propOnOpenCart || (() => cartContext.setIsCartOpen(true));

  const navLinks = [
    { name: 'Gear Catalogue', path: '/' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Fishing Spots', path: '/fishing-spots' },
    { name: 'Blog & Guides', path: '/blogs' },
    { name: 'Events', path: '/events' },
    { name: 'Training', path: '/training' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Screen Advert Banner for Upcoming Events */}
      <TopEventsBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 py-1"
          aria-label="FishingWithNelson Home"
        >
          <Logo className="h-8 sm:h-10 w-auto" />
        </Link>

        {/* Primary Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors py-1 ${
                  isActive
                    ? 'text-amber-700 border-b-2 border-amber-600 font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent('Hello Nelson, I would like to inquire about fishing gear.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap border border-emerald-200/60"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>{WHATSAPP_PHONE_FORMATTED}</span>
          </a>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="Order list"
            className="relative px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden xs:inline">Order List</span>
            {cartCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent('Hello Nelson, I would like to inquire about fishing gear.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 border border-emerald-200/60"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp: {WHATSAPP_PHONE_FORMATTED}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
