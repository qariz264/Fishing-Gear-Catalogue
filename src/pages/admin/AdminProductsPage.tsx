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
import { AdminImageUploader } from '../../components/admin/AdminImageUploader';
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
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();

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
    imageUrl: string;
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
    imageUrl: '',
    storagePath: '',
    specs: [{ label: 'Specification', value: '' }],
    published: true,
    featured: false,
  });

  const [statusAlert, setStatusAlert] = useState<AdminAlertMessage | null>(null);
  const [modalError, setModalError] = useState<AdminAlertMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Listen to Firestore products collection
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const list: ProductItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as ProductItem);
        });
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load products from Firestore:', err);
        setLoading(false);
      }
    );

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
      imageUrl: '',
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
    setFormData({
      name: item.name || '',
      brand: item.brand || 'FishWithNelson',
      category: item.category || 'Fishing Rods',
      subcategory: item.subcategory || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
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
    const payload = sanitizeFirestorePayload({
      id,
      name: trimmedName,
      brand: formData.brand.trim() || 'FishWithNelson',
      category: formData.category.trim() || 'Fishing Gear',
      subcategory: formData.subcategory.trim() || 'Tackle',
      description: formData.description.trim(),
      imageUrl: formData.imageUrl || '',
      storagePath: formData.storagePath || '',
      specs: cleanSpecs,
      published: formData.published,
      featured: formData.featured,
      updatedAt: new Date().toISOString(),
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      adminKey: ADMIN_KEY,
    }) as ProductItem;

    try {
      await setDoc(doc(db, 'products', id), payload, { merge: true });
      setIsModalOpen(false);
      setEditingProduct(null);
      setStatusAlert({ type: 'success', text: `Product "${payload.name}" saved successfully.` });
    } catch (err: any) {
      console.error('Error saving product:', err);
      setModalError({ type: 'error', text: `Failed to save product: ${err?.message || err}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
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
      await setDoc(doc(db, 'products', item.id), { featured: nextFeatured, adminKey: ADMIN_KEY }, { merge: true });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error updating featured status: ${err?.message || err}` });
    }
  };

  // Filter products
  const filtered = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
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
                        <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="max-h-full max-w-full w-auto h-auto object-contain"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-600" />
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

              {/* Image Uploader */}
              <AdminImageUploader
                currentImageUrl={formData.imageUrl}
                currentStoragePath={formData.storagePath}
                folder="products"
                onImageUploaded={(url, path) =>
                  setFormData((prev) => ({ ...prev, imageUrl: url, storagePath: path }))
                }
                onImageRemoved={() =>
                  setFormData((prev) => ({ ...prev, imageUrl: '', storagePath: '' }))
                }
                label="Product Photograph (Stored in Firebase Storage)"
                aspectHint="100% full uncropped display"
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
