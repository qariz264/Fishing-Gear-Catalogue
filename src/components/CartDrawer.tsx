import React, { useState } from 'react';
import { CartItem, buildCartWhatsAppUrl, WHATSAPP_PHONE_FORMATTED } from '../utils/whatsapp';
import { ProductVisual } from './ProductVisual';
import { X, Trash2, Plus, Minus, MessageSquare, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  if (!isOpen) return null;

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const whatsappUrl = buildCartWhatsAppUrl(items, {
    name: customerName,
    location: deliveryLocation,
    additionalNotes,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-xl flex flex-col justify-between overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-slate-900">
              Order List ({totalItemsCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">Your order list is empty</h3>
              <p className="text-xs text-slate-500">
                Add products from the catalogue to prepare your WhatsApp order.
              </p>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Selected Items</span>
                  <button
                    onClick={onClearCart}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {items.map((item) => (
                    <div key={item.product.id} className="p-3 flex gap-3 items-center">
                      <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-50">
                        <ProductVisual
                          product={item.product}
                          size="sm"
                          allowUpload={false}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.product.brand} · {item.product.subcategory}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center border border-slate-200 rounded bg-white">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              aria-label="Decrease"
                              className="p-1 text-slate-500 hover:bg-slate-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono text-slate-800 font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              aria-label="Increase"
                              className="p-1 text-slate-500 hover:bg-slate-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            aria-label="Remove"
                            className="p-1 text-slate-400 hover:text-rose-600 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">
                  Delivery Details (Optional)
                </span>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Name"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Destination / Town</label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="e.g. Nairobi, Naivasha, Kisumu"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any specific sizes, line, or questions"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white space-y-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Order to WhatsApp ({WHATSAPP_PHONE_FORMATTED})</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
