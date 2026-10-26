import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { ProductItem } from '../../types/admin';
import { ProductSpec, CATEGORIES } from '../../data/products';
import {
  getStoredProducts,
  subscribeToProducts,
  saveStoredProducts,
} from '../../utils/productStorage';
import { saveCustomImage } from '../../utils/imageStorage';
import { AdminMultiImageUploader } from '../../components/admin/AdminMultiImageUploader';
import { AdminAlert, AdminAlertMessage } from '../../components/admin/AdminAlert';
import { ADMIN_KEY } from '../../utils/adminConstants';
import { sanitizeFirestorePayload } from '../../utils/sanitizeFirestore';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Check,
  X,
  ExternalLink,
  Loader2,
  Filter,
  ImageIcon,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();

  // Price Management State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [quickPriceInput, setQuickPriceInput] = useState<string>('0');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'priced' | 'unpriced'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    brand: string;
    category: string;
    subcategory: string;
    description: string;
    price: number;
    imageUrl: string;
    images: string[];
    storagePath: string;
    specs: ProductSpec[];
    published: boolean;
    featured: boolean;
  }>({
    name: '',
    brand: 'FishWithNelson',
    category: 'Fishing Rods',
    subcategory: '',
    description: '',
    price: 0,
    imageUrl: '',
    images: [],
    storagePath: '',
    specs: [{ label: 'Specification', value: '' }],
    published: true,
    featured: false,
  });

  const [statusAlert, setStatusAlert] = useState<AdminAlertMessage | null>(null);
  const [modalError, setModalError] = useState<AdminAlertMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Listen to products via resilient productStorage
  useEffect(() => {
    // Instant initial load with cached prices and images
    const stored = getStoredProducts() as ProductItem[];
    setProducts(stored);
    setLoading(false);

    const unsub = subscribeToProducts((live) => {
      setProducts(live as ProductItem[]);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Check URL params for ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openCreateModal();
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalError(null);
    setFormData({
      name: '',
      brand: 'FishWithNelson',
      category: 'Fishing Rods',
      subcategory: '',
      description: '',
      price: 0,
      imageUrl: '',
      images: [],
      storagePath: '',
      specs: [
        { label: 'Type', value: '' },
        { label: 'Key Feature', value: '' },
      ],
      published: true,
      featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ProductItem) => {
    setEditingProduct(item);
    setModalError(null);
    const existingImages =
      item.images && Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : item.imageUrl
        ? [item.imageUrl]
        : [];

    setFormData({
      name: item.name || '',
      brand: item.brand || 'FishWithNelson',
      category: item.category || 'Fishing Rods',
      subcategory: item.subcategory || '',
      description: item.description || '',
      price: item.price !== undefined ? Math.max(0, Number(item.price)) : 0,
      imageUrl: item.imageUrl || existingImages[0] || '',
      images: existingImages,
      storagePath: item.storagePath || '',
      specs: item.specs && item.specs.length > 0 ? item.specs : [{ label: 'Specification', value: '' }],
      published: item.published !== false,
      featured: Boolean(item.featured),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setModalError({ type: 'error', text: 'Please enter a product name.' });
      return;
    }

    setIsSaving(true);
    const id = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    const cleanSpecs = formData.specs.filter((s) => s.label.trim() && s.value.trim());
    const primaryImg = formData.images.length > 0 ? formData.images[0] : (formData.imageUrl || '');

    const payload = sanitizeFirestorePayload({
      id,
      name: trimmedName,
      brand: formData.brand.trim() || 'FishWithNelson',
      category: formData.category.trim() || 'Fishing Gear',
      subcategory: formData.subcategory.trim() || 'Tackle',
      description: formData.description.trim(),
      price: Math.max(0, Math.round(Number(formData.price) || 0)),
      imageUrl: primaryImg,
      images: formData.images,
      storagePath: formData.storagePath || '',
      specs: cleanSpecs,
      published: formData.published,
      featured: formData.featured,
      updatedAt: new Date().toISOString(),
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      adminKey: ADMIN_KEY,
    }) as ProductItem;

    // Save to local cache immediately
    try {
      const current = getStoredProducts();
      const existingIdx = current.findIndex((p) => p.id === id);
      if (existingIdx >= 0) {
        current[existingIdx] = { ...current[existingIdx], ...payload };
      } else {
        current.push(payload as any);
      }
      saveStoredProducts(current);
      if (primaryImg) {
        saveCustomImage(id, primaryImg);
      }
      setProducts(current as ProductItem[]);
    } catch (e) {
      console.warn('Local update failed:', e);
    }

    try {
      await setDoc(doc(db, 'products', id), payload, { merge: true });
      setIsModalOpen(false);
      setEditingProduct(null);
      setStatusAlert({ type: 'success', text: `Product "${payload.name}" saved successfully.` });
    } catch (err: any) {
      console.error('Error saving product to Firestore:', err);
      // Close modal since it's already safely preserved locally
      setIsModalOpen(false);
      setEditingProduct(null);
      setStatusAlert({ type: 'info', text: `Product "${payload.name}" saved locally.` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const current = getStoredProducts().filter((p) => p.id !== id);
      saveStoredProducts(current);
      setProducts(current as ProductItem[]);
      await deleteDoc(doc(db, 'products', id));
      setDeleteConfirmId(null);
      setStatusAlert({ type: 'success', text: 'Product deleted from catalogue.' });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error deleting product: ${err?.message || err}` });
    }
  };

  const togglePublish = async (item: ProductItem) => {
    try {
      const nextPublished = item.published === false;
      const current = getStoredProducts().map((p) => (p.id === item.id ? { ...p, published: nextPublished } : p));
      saveStoredProducts(current);
      setProducts(current as ProductItem[]);
      await setDoc(doc(db, 'products', item.id), { published: nextPublished, adminKey: ADMIN_KEY }, { merge: true });
      setStatusAlert({
        type: 'info',
        text: `Product "${item.name}" is now ${nextPublished ? 'published (visible to customers)' : 'hidden (draft)'}.`,
      });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error updating product visibility: ${err?.message || err}` });
    }
  };

  const toggleFeatured = async (item: ProductItem) => {
    try {
      const nextFeatured = !item.featured;
      const current = getStoredProducts().map((p) => (p.id === item.id ? { ...p, featured: nextFeatured } : p));
      saveStoredProducts(current);
      setProducts(current as ProductItem[]);
      await setDoc(doc(db, 'products', item.id), { featured: nextFeatured, adminKey: ADMIN_KEY }, { merge: true });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error updating featured status: ${err?.message || err}` });
    }
  };

  // Quick Inline Price Save
  const handleSaveQuickPrice = async (item: ProductItem, newPrice: number) => {
    try {
      setIsUpdatingPrice(true);
      const sanitizedPrice = Math.max(0, Math.round(newPrice));

      // Update local state and storage immediately
      setProducts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, price: sanitizedPrice } : p))
      );
      try {
        const current = getStoredProducts();
        const updated = current.map((p) => (p.id === item.id ? { ...p, price: sanitizedPrice } : p));
        saveStoredProducts(updated);
      } catch (e) {}

      await setDoc(
        doc(db, 'products', item.id),
        {
          price: sanitizedPrice,
          updatedAt: new Date().toISOString(),
          adminKey: ADMIN_KEY,
        },
        { merge: true }
      );
      setEditingPriceId(null);
      setStatusAlert({
        type: 'success',
        text: `Price for "${item.name}" updated to ${
          sanitizedPrice > 0 ? `KSh ${sanitizedPrice.toLocaleString()}` : '0 KSh'
        }.`,
      });
    } catch (err: any) {
      console.warn('Firestore price update notice:', err);
      setEditingPriceId(null);
      setStatusAlert({
        type: 'success',
        text: `Price for "${item.name}" saved locally.`,
      });
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const unpricedCount = products.filter((p) => !p.price || Number(p.price) === 0).length;
  const pricedCount = products.filter((p) => p.price && Number(p.price) > 0).length;

  // Filter products
  const filtered = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

    // Price filter
    const productPrice = p.price !== undefined && p.price !== null ? Number(p.price) : 0;
    if (priceFilter === 'priced' && productPrice <= 0) return false;
    if (priceFilter === 'unpriced' && productPrice > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchBrand = (p.brand || '').toLowerCase().includes(q);
      const matchSub = (p.subcategory || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      return matchName || matchBrand || matchSub || matchDesc;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Non-blocking feedback banner */}
      <AdminAlert message={statusAlert} onDismiss={() => setStatusAlert(null)} />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span>Product Catalogue Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add gear, upload high-res images to Firebase Storage, configure specs, and publish to the storefront.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, brand, subcategory..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({products.length})
          </button>
          {CATEGORIES.filter((c) => c !== 'All Equipment').map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Status Quick Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wide">
            Filter by Price:
          </span>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setPriceFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                priceFilter === 'all'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setPriceFilter('priced')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                priceFilter === 'priced'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Priced ({pricedCount})
            </button>
            <button
              type="button"
              onClick={() => setPriceFilter('unpriced')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                priceFilter === 'unpriced'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <span>Needs Price / 0 KSh</span>
              <span className="px-1.5 py-0.2 bg-slate-950/60 rounded-full font-mono text-[10px]">
                {unpricedCount}
              </span>
            </button>
          </div>
        </div>

        {unpricedCount > 0 && priceFilter !== 'unpriced' && (
          <button
            type="button"
            onClick={() => setPriceFilter('unpriced')}
            className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Notice: {unpricedCount} item{unpricedCount > 1 ? 's have' : ' has'} default 0 KSh price. Click to adjust.</span>
          </button>
        )}
      </div>

      {/* Product List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs">Loading catalogue from Firestore...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No products found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? `No items matched "${searchQuery}".` : 'Get started by adding your first fishing gear item.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            + Add Equipment
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item & Photo</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Item & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="max-h-full max-w-full w-auto h-auto object-contain"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-600" />
                          )}
                          {item.images && item.images.length > 1 && (
                            <span
                              className="absolute bottom-0 right-0 bg-slate-900/90 text-amber-400 text-[9px] font-mono font-bold px-1 rounded-tl-sm border-t border-l border-slate-700 flex items-center gap-0.5"
                              title={`${item.images.length} photos uploaded`}
                            >
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>{item.images.length}</span>
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <span className="font-semibold text-white block truncate">{item.name}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {item.description || 'No description provided'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-300 font-medium block">{item.category}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{item.subcategory || 'General'}</span>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-medium">
                      {item.brand}
                    </td>

                    {/* Price with Inline Quick Editor */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-xs font-semibold">
                      {editingPriceId === item.id ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <span className="text-[11px] text-slate-400 font-mono">KSh</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            autoFocus
                            value={quickPriceInput}
                            onChange={(e) => setQuickPriceInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveQuickPrice(item, Number(quickPriceInput) || 0);
                              } else if (e.key === 'Escape') {
                                setEditingPriceId(null);
                              }
                            }}
                            className="w-24 px-2 py-1 bg-slate-950 border border-amber-500 rounded text-right text-white font-mono text-xs focus:outline-hidden"
                          />
                          <button
                            type="button"
                            disabled={isUpdatingPrice}
                            onClick={() => handleSaveQuickPrice(item, Number(quickPriceInput) || 0)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800 rounded transition-colors"
                            title="Save price (Enter)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded transition-colors"
                            title="Cancel (Esc)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 group/price">
                          <span
                            onClick={() => {
                              setEditingPriceId(item.id);
                              setQuickPriceInput(String(item.price !== undefined ? Number(item.price) : 0));
                            }}
                            className={`cursor-pointer hover:underline ${
                              item.price && item.price > 0 ? 'text-amber-400' : 'text-slate-500'
                            }`}
                            title="Click to adjust price"
                          >
                            {item.price && item.price > 0 ? `KSh ${item.price.toLocaleString()}` : '0 KSh'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPriceId(item.id);
                              setQuickPriceInput(String(item.price !== undefined ? Number(item.price) : 0));
                            }}
                            className="p-1 rounded text-slate-500 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                            title="Quick adjust price"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Published status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => togglePublish(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                          item.published !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {item.published !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.published !== false ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.featured
                            ? 'text-amber-400 hover:text-amber-300 bg-amber-500/10'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title={item.featured ? 'Featured on homepage' : 'Mark as featured'}
                      >
                        <Star className={`w-4 h-4 ${item.featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === item.id ? (
                        <span className="inline-flex items-center gap-1 bg-red-950/80 border border-red-800 p-1 rounded-lg">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-500"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span>{editingProduct ? 'Edit Product Item' : 'Add New Equipment to Catalogue'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* In-modal feedback */}
              <AdminAlert message={modalError} onDismiss={() => setModalError(null)} />

              {/* Multi-Image Uploader for Equipment */}
              <AdminMultiImageUploader
                images={formData.images}
                onChange={(imgs) =>
                  setFormData((prev) => ({
                    ...prev,
                    images: imgs,
                    imageUrl: imgs[0] || '',
                  }))
                }
                folder="products"
                label="Product Photographs & Visual Gallery"
                aspectHint="Upload multiple equipment photos (macro shots, rod blank, reel spool, lures in water). The first image will be the primary catalogue cover."
                maxImages={12}
              />

              {/* Title & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Muriyu ZHB-540 Telescopic Hand Pole"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Bill Lewis, Shimano"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Equipment').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Accessories">Accessories</option>
                    <option value="Fishing Lines">Fishing Lines</option>
                    <option value="Other Gear">Other Gear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. Lipless Crankbaits, Front Drag Spinners"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Selling Price Section - Clearly configurable during upload or editing */}
              <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Item Selling Price (KSh) *</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {formData.price > 0 ? `KSh ${formData.price.toLocaleString()}` : '0 KSh (Default)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Set the item price here during photo upload. For already uploaded items, the default is 0 KSh, and you can adjust to any amount at any time.
                </p>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-amber-400 font-mono text-xs font-bold">KSh</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    placeholder="0"
                    className="w-full text-sm pl-12 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">Quick Presets:</span>
                  {[0, 500, 1000, 1500, 2500, 3500, 5000, 7500, 10000, 15000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, price: preset }))}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        formData.price === preset
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {preset === 0 ? '0 KSh' : preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe blank materials, guides, gear ratio, drag power, targeted species..."
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Specifications</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        specs: [...formData.specs, { label: '', value: '' }],
                      })
                    }
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Spec
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.specs.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => {
                          const updated = [...formData.specs];
                          updated[i].label = e.target.value;
                          setFormData({ ...formData, specs: updated });
                        }}
                        placeholder="Feature (e.g. Length)"
                        className="w-1/3 text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...formData.specs];
                          updated[i].value = e.target.value;
                          setFormData({ ...formData, specs: updated });
                        }}
                        placeholder="Value (e.g. 5.4m)"
                        className="flex-1 text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            specs: formData.specs.filter((_, idx) => idx !== i),
                          })
                        }
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visibility and Featured toggles */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                  <span>Published on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                  <span>Featured Product</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-700 text-xs font-semibold rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800/80 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
