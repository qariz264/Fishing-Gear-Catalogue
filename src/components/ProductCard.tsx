import React from 'react';
import { Product } from '../data/products';
import { ProductItem } from '../types/admin';
import { ProductVisual } from './ProductVisual';
import { buildSingleProductWhatsAppUrl } from '../utils/whatsapp';
import { Plus, Check, MessageSquare } from 'lucide-react';

interface ProductCardProps {
  product: Product | ProductItem;
  onSelect: (product: Product | ProductItem) => void;
  onAddToCart: (product: Product | ProductItem, quantity: number) => void;
  inCartCount: number;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  inCartCount,
  priority = false,
}) => {
  const directWhatsAppUrl = buildSingleProductWhatsAppUrl(product as Product);

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col overflow-hidden text-left relative">
      {/* Product Image Area */}
      <div
        onClick={() => onSelect(product)}
        className="cursor-pointer relative overflow-hidden bg-slate-50"
      >
        <ProductVisual
          product={product}
          size="md"
          priority={priority}
        />
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>{product.category} · {product.subcategory || 'Tackle'}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="text-[14px] font-semibold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug cursor-pointer mb-1.5"
          >
            {product.name}
          </h3>

          {/* Clean Description */}
          {product.description && (
            <p className="text-xs text-slate-600 line-clamp-2 mb-2.5 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Specifications */}
          {product.specs && product.specs.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-2 mb-3 border border-slate-100 space-y-1">
              {product.specs.slice(0, 2).map((spec, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="text-slate-500">{spec.label}</span>
                  <span className="text-slate-700 font-mono text-right truncate max-w-[55%]">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Price Below Product */}
          <div className="mt-2.5 mb-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wide">
              Price
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-950 font-mono">
              {product.price && product.price > 0
                ? `KSh ${product.price.toLocaleString()}`
                : '0 KSh'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onAddToCart(product, 1)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
              inCartCount > 0
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
            }`}
          >
            {inCartCount > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>In Cart ({inCartCount})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ask on WhatsApp about ${product.name}`}
            className="p-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center"
            title="Inquire on WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>

          <button
            onClick={() => onSelect(product)}
            className="py-2 px-2.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
