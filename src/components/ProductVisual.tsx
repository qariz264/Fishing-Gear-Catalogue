import React, { useState } from 'react';
import { Product } from '../data/products';
import { ProductItem } from '../types/admin';
import { Package } from 'lucide-react';

interface ProductVisualProps {
  product: Product | ProductItem;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  allowUpload?: boolean;
  priority?: boolean;
  activeImageUrl?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  product,
  className = '',
  size = 'md',
  priority = false,
  activeImageUrl,
}) => {
  const [imageError, setImageError] = useState(false);

  // Proportioned heights to display 100% of the equipment image without cropping
  const sizeClasses = {
    sm: 'h-28 sm:h-32',
    md: 'h-44 sm:h-48',
    lg: 'h-64 sm:h-72',
  }[size];

  const targetImage = activeImageUrl || product.imageUrl;
  const hasImage = Boolean(targetImage && targetImage.trim()) && !imageError;

  return (
    <div
      className={`relative w-full ${sizeClasses} bg-white rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 group ${className}`}
    >
      {hasImage ? (
        <>
          {/* 100% Full Visibility Image: object-contain guarantees zero cropping */}
          <div className="w-full h-full p-2 flex items-center justify-center bg-white">
            <img
              src={targetImage}
              alt={product.name || 'Fishing gear item'}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setImageError(true)}
              className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-200"
            />
          </div>

          {/* Brand badge top left */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="text-[10px] font-medium text-slate-800 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs border border-slate-200/60">
              {product.brand || 'Gear'}
            </span>
          </div>
        </>
      ) : (
        /* Clean non-intrusive fallback placeholder */
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-50 text-slate-400">
          <Package className="w-8 h-8 mb-1 text-slate-300" />
          <span className="text-[11px] font-semibold text-slate-500">{product.brand || 'FishWithNelson'}</span>
          <span className="text-[10px] text-slate-400">Catalogue Item</span>
        </div>
      )}
    </div>
  );
};
