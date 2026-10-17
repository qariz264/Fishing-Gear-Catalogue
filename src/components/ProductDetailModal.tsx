import React, { useState } from 'react';
import { Product } from '../data/products';
import { ProductItem } from '../types/admin';
import { ProductVisual } from './ProductVisual';
import { buildSingleProductWhatsAppUrl, WHATSAPP_PHONE_FORMATTED } from '../utils/whatsapp';
import { X, Check, Plus, Minus, MessageSquare } from 'lucide-react';

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

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const directWhatsAppUrl = buildSingleProductWhatsAppUrl(product as Product);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="text-xs text-slate-500 font-medium">
            {product.category} · {product.subcategory || 'Tackle'}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left: Product Image */}
          <div className="space-y-3">
            <ProductVisual
              product={product}
              size="lg"
            />
          </div>

          {/* Right: Details & Order Controls */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-amber-800 font-semibold">{product.brand}</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h2>
                <div className="mt-2 flex items-baseline gap-2 py-1 px-2.5 bg-amber-50/80 rounded-lg border border-amber-200/60 inline-flex">
                  <span className="text-[11px] font-mono text-amber-900 font-semibold uppercase tracking-wide">Price:</span>
                  <span className="text-base font-extrabold text-amber-950 font-mono">
                    {product.price && product.price > 0
                      ? `KSh ${product.price.toLocaleString()}`
                      : '0 KSh'}
                  </span>
                </div>
              </div>

              {product.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Specifications */}
              {product.specs && product.specs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-1.5">
                    Specifications
                  </h4>
                  <div className="rounded-lg border border-slate-200 overflow-hidden text-xs divide-y divide-slate-100">
                    {product.specs.map((spec, idx) => (
                      <div key={idx} className="flex justify-between p-2">
                        <span className="text-slate-500">{spec.label}</span>
                        <span className="text-slate-800 font-mono text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {/* Quantity Stepper & Add */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-semibold font-mono text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
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
                      <span>Add to Order List</span>
                    </>
                  )}
                </button>
              </div>

              {/* Order Directly via WhatsApp */}
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inquire on WhatsApp ({WHATSAPP_PHONE_FORMATTED})</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
