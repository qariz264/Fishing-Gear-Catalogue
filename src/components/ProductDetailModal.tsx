import React, { useState } from 'react';
import { Product } from '../data/products';
import { ProductItem } from '../types/admin';
import { ProductVisual } from './ProductVisual';
import { buildSingleProductWhatsAppUrl, WHATSAPP_PHONE_FORMATTED } from '../utils/whatsapp';
import {
  X,
  Check,
  Plus,
  Minus,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Package,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: Product | ProductItem, quantity: number, variant?: string) => void;
  inCartCount: number;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  inCartCount,
}) => {
  if (!product) return null;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const productImages =
    product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [];

  const directWhatsAppUrl = buildSingleProductWhatsAppUrl(product as Product);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-left flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {product.category} · {product.subcategory || 'Tackle'}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Multi-Image Photo Gallery */}
            <div className="space-y-3">
              <div className="relative group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                <ProductVisual
                  product={product}
                  size="lg"
                  activeImageUrl={productImages[activePhotoIdx]}
                />

                {/* Left / Right Arrow Buttons if > 1 images */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Previous photo"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Next photo"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Photo Index Counter */}
                    <span className="absolute bottom-2.5 right-2.5 bg-slate-950/80 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/10 shadow-xs">
                      {activePhotoIdx + 1} / {productImages.length}
                    </span>
                  </>
                )}

                {/* Zoom / Fullscreen Button */}
                {productImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md flex items-center gap-1 cursor-pointer"
                    title="Enlarge photo"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Zoom</span>
                  </button>
                )}
              </div>

              {/* Thumbnail Strip if multiple images */}
              {productImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto p-1 no-scrollbar">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 bg-white transition-all shrink-0 cursor-pointer ${
                        activePhotoIdx === idx
                          ? 'border-amber-500 ring-2 ring-amber-500/30 scale-102'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details, Price, Specs & Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">
                    {product.name}
                  </h2>

                  {/* Price */}
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="flex items-baseline gap-2 py-1 px-3 bg-amber-50/80 rounded-lg border border-amber-200/60 inline-flex">
                      <span className="text-[11px] font-mono text-amber-900 font-semibold uppercase tracking-wide">
                        Price:
                      </span>
                      <span className="text-base font-extrabold text-amber-950 font-mono">
                        {product.price && product.price > 0
                          ? `KSh ${product.price.toLocaleString()}`
                          : '0 KSh'}
                      </span>
                    </div>
                  </div>
                </div>

                {product.description && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {product.description}
                  </p>
                )}

                {/* Specifications */}
                {product.specs && product.specs.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>Specifications & Features</span>
                    </h4>
                    <div className="rounded-xl border border-slate-200 overflow-hidden text-xs divide-y divide-slate-100 bg-slate-50/60">
                      {product.specs.map((spec, idx) => (
                        <div key={idx} className="flex justify-between p-2 sm:px-3">
                          <span className="text-slate-500">{spec.label}</span>
                          <span className="text-slate-800 font-mono font-medium text-right">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Quantity, Cart, WhatsApp */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold font-mono text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Order List</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Order List {inCartCount > 0 ? `(${inCartCount} in list)` : ''}</span>
                      </>
                    )}
                  </button>
                </div>

                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquire on WhatsApp ({WHATSAPP_PHONE_FORMATTED})</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Photo Inspection */}
      {isLightboxOpen && productImages.length > 0 && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="flex items-center justify-between text-white max-w-5xl w-full mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {product.name}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Photo {activePhotoIdx + 1} of {productImages.length}
              </p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="flex-1 flex items-center justify-center my-4 relative max-w-5xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {productImages.length > 1 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 z-10 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-colors border border-white/20 shadow-lg cursor-pointer"
                title="Previous photo"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="max-h-[75vh] max-w-full flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-4">
              <img
                src={productImages[activePhotoIdx]}
                alt={`${product.name} - photo ${activePhotoIdx + 1}`}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {productImages.length > 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 z-10 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-colors border border-white/20 shadow-lg cursor-pointer"
                title="Next photo"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Thumbnails in Lightbox */}
          {productImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activePhotoIdx === idx
                      ? 'border-amber-400 scale-105 shadow-md'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-contain bg-white p-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
