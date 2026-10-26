import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../data/products';
import { ProductItem } from '../types/admin';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { CategoryFilterBar } from '../components/CategoryFilterBar';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Footer } from '../components/Footer';
import { Search, ShoppingBag, MessageSquare } from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';
import {
  getStoredProducts,
  subscribeToProducts,
} from '../utils/productStorage';
import { useCart } from '../context/CartContext';

import { setPageSeo } from '../utils/seo';

export const PublicCataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Equipment');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | ProductItem | null>(null);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  const {
    addToCart,
    totalCartCount,
    getInCartCount,
    setIsCartOpen,
  } = useCart();

  // Load from local storage for instant render, and subscribe to Firebase Firestore in real-time
  useEffect(() => {
    setProducts(getStoredProducts());

    const unsubscribe = subscribeToProducts((liveProducts) => {
      // Filter out products explicitly unpublished by admin
      const published = liveProducts.filter((p: any) => p.published !== false);
      setProducts(published);
      setIsSynced(true);
    });

    return () => unsubscribe();
  }, []);

  // Manage dynamic canonical metadata for homepage and individual product views
  useEffect(() => {
    if (selectedProduct) {
      setPageSeo({
        title: `${selectedProduct.name} | Fishing With Nelson Kenya`,
        description: selectedProduct.description
          ? `${selectedProduct.description.slice(0, 150)} - Order via WhatsApp from Fishing With Nelson Kenya.`
          : `Order ${selectedProduct.name} from Fishing With Nelson in Nairobi, Kenya via WhatsApp.`,
        canonicalPath: `/?product=${encodeURIComponent(selectedProduct.id)}`,
        ogImage: selectedProduct.imageUrl,
      });
    } else {
      setPageSeo({
        title: 'Fishing With Nelson - Premium Fishing Gear, Spots & Training Kenya',
        description:
          "Fishing With Nelson is Kenya's premier fishing gear catalogue, angling spot guide, and training clinic. Browse quality rods, reels, lures, and terminal tackle with personalized advice and countrywide delivery.",
        canonicalPath: '/',
      });
    }
  }, [selectedProduct]);

  // Automatically select and open product modal when deep-linked via URL (e.g. ?product=rod-1)
  useEffect(() => {
    const productId = searchParams.get('product') || searchParams.get('p');
    if (productId && products.length > 0) {
      const match = products.find((p) => p.id === productId);
      if (match) {
        setSelectedProduct(match);
      }
    }
  }, [searchParams, products]);

  const handleCloseDetailModal = () => {
    setSelectedProduct(null);
    if (searchParams.has('product') || searchParams.has('p')) {
      const next = new URLSearchParams(searchParams);
      next.delete('product');
      next.delete('p');
      setSearchParams(next, { replace: true });
    }
  };

  // Compute dynamic categories based on available inventory
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    set.add('All Equipment');
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [products]);

  // Synchronized Filter & Search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'All Equipment' && product.category !== selectedCategory) {
        return false;
      }

      // Search query filter (matches name, brand, subcategory, description, specifications)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesSubcategory = (product.subcategory || '').toLowerCase().includes(query);
        const matchesDescription = (product.description || '').toLowerCase().includes(query);
        const matchesSpecs = (product.specs || []).some(
          (sp) => sp.label.toLowerCase().includes(query) || sp.value.toLowerCase().includes(query)
        );

        return (
          matchesName ||
          matchesBrand ||
          matchesCategory ||
          matchesSubcategory ||
          matchesDescription ||
          matchesSpecs
        );
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-500/20 selection:text-amber-900">
      {/* Top Header */}
      <Header
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          document.getElementById('catalogue-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Hero Banner with Logo & Search */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Synchronized Category Bar */}
      <CategoryFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categoriesList}
        resultCount={filteredProducts.length}
      />

      {/* Main Catalogue Grid Area */}
      <main id="catalogue-grid" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-950 font-display">
              {searchQuery ? `Search: "${searchQuery}"` : selectedCategory}
            </h2>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium self-start sm:self-auto"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No equipment found</h3>
            <p className="text-xs text-slate-500">
              No products matched &ldquo;{searchQuery}&rdquo;. Try another search term or browse all gear.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Equipment');
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Show All Gear
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 4}
                onSelect={(p) => setSelectedProduct(p)}
                onAddToCart={(p, qty) => addToCart(p, qty)}
                inCartCount={getInCartCount(product.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer with shop address, hours & overall reviews */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          document.getElementById('catalogue-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={handleCloseDetailModal}
        onAddToCart={(p, qty, v) => addToCart(p, qty, v)}
        inCartCount={selectedProduct ? getInCartCount(selectedProduct.id) : 0}
      />

      {/* Floating Order / WhatsApp Action */}
      <aside aria-label="Quick contact" className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        {totalCartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="View current order list"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all text-xs font-semibold border border-slate-700 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Order List ({totalCartCount})</span>
          </button>
        )}

        <a
          href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent('Hello Nelson, I would like to inquire about fishing tackle.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-all text-xs font-semibold"
          title="Direct WhatsApp chat with Nelson"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </aside>
    </div>
  );
};
