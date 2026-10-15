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
import { FishingSpotItem } from '../../types/admin';
import { AdminImageUploader } from '../../components/admin/AdminImageUploader';
import { AdminAlert, AdminAlertMessage } from '../../components/admin/AdminAlert';
import { ADMIN_KEY } from '../../utils/adminConstants';
import { sanitizeFirestorePayload } from '../../utils/sanitizeFirestore';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Navigation,
  Shield,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export const AdminFishingSpotsPage: React.FC = () => {
  const [spots, setSpots] = useState<FishingSpotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<FishingSpotItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    region: string;
    description: string;
    imageUrl: string;
    storagePath: string;
    fishingType: string;
    accessInstructions: string;
    facilities: string;
    mapLink: string;
    safetyGuidance: string;
    published: boolean;
  }>({
    name: '',
    region: 'Nakuru County / Naivasha',
    description: '',
    imageUrl: '',
    storagePath: '',
    fishingType: 'Bank Casting, Boat Trolling, Drop Shotting',
    accessInstructions: 'Public jetty or private marina access with local boatmen',
    facilities: 'Boat launch, secure parking, local guide available',
    mapLink: '',
    safetyGuidance: 'Life jacket mandatory when on boat. Watch out for submerged tree stumps.',
    published: true,
  });

  const [statusAlert, setStatusAlert] = useState<AdminAlertMessage | null>(null);
  const [modalError, setModalError] = useState<AdminAlertMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'fishingSpots'),
      (snapshot) => {
        const list: FishingSpotItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as FishingSpotItem);
        });
        setSpots(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load fishing spots:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openCreateModal();
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const openCreateModal = () => {
    setEditingSpot(null);
    setModalError(null);
    setFormData({
      name: '',
      region: 'Nakuru County / Naivasha',
      description: '',
      imageUrl: '',
      storagePath: '',
      fishingType: 'Bank Casting, Boat Trolling, Drop Shotting',
      accessInstructions: 'Public jetty or private marina access with local boatmen',
      facilities: 'Boat launch, secure parking, local guide available',
      mapLink: '',
      safetyGuidance: 'Life jacket mandatory when on boat. Watch out for submerged tree stumps.',
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: FishingSpotItem) => {
    setEditingSpot(item);
    setModalError(null);
    setFormData({
      name: item.name || '',
      region: item.region || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      storagePath: item.storagePath || '',
      fishingType: item.fishingType || '',
      accessInstructions: item.accessInstructions || '',
      facilities: item.facilities || '',
      mapLink: item.mapLink || '',
      safetyGuidance: item.safetyGuidance || '',
      published: item.published !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setModalError({ type: 'error', text: 'Please enter a fishing destination name.' });
      return;
    }

    const trimmedRegion = formData.region.trim();
    if (!trimmedRegion) {
      setModalError({ type: 'error', text: 'Please specify the region or county.' });
      return;
    }

    setIsSaving(true);
    const id = editingSpot ? editingSpot.id : `spot-${Date.now()}`;
    const payload = sanitizeFirestorePayload({
      id,
      name: trimmedName,
      region: trimmedRegion,
      description: formData.description.trim(),
      imageUrl: formData.imageUrl || '',
      storagePath: formData.storagePath || '',
      fishingType: formData.fishingType.trim() || 'General Angling',
      accessInstructions: formData.accessInstructions.trim(),
      facilities: formData.facilities.trim(),
      mapLink: formData.mapLink.trim(),
      safetyGuidance: formData.safetyGuidance.trim(),
      published: formData.published,
      updatedAt: new Date().toISOString(),
      createdAt: editingSpot?.createdAt || new Date().toISOString(),
      adminKey: ADMIN_KEY,
    }) as FishingSpotItem;

    try {
      await setDoc(doc(db, 'fishingSpots', id), payload, { merge: true });
      setIsModalOpen(false);
      setEditingSpot(null);
      setStatusAlert({ type: 'success', text: `Fishing destination "${payload.name}" saved successfully.` });
    } catch (err: any) {
      console.error('Error saving fishing spot:', err);
      setModalError({ type: 'error', text: `Failed to save fishing spot: ${err?.message || err}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'fishingSpots', id));
      setDeleteConfirmId(null);
      setStatusAlert({ type: 'success', text: 'Fishing destination deleted.' });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error deleting spot: ${err?.message || err}` });
    }
  };

  const togglePublish = async (item: FishingSpotItem) => {
    try {
      const nextPublished = !item.published;
      await setDoc(doc(db, 'fishingSpots', item.id), { published: nextPublished, adminKey: ADMIN_KEY }, { merge: true });
      setStatusAlert({
        type: 'info',
        text: `Destination "${item.name}" is now ${nextPublished ? 'published' : 'hidden (draft)'}.`,
      });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error toggling publish state: ${err?.message || err}` });
    }
  };

  const filtered = spots.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.region || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Non-blocking feedback banner */}
      <AdminAlert message={statusAlert} onDismiss={() => setStatusAlert(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span>Fishing Spots & Destinations Guide</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curate fishing destinations across Kenya with accurate access, target species, and safety notes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fishing Spot</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spots by name, county, region..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <span className="text-xs">Loading fishing spots from Firestore...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No fishing spots listed</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? `No spots matched "${searchQuery}".` : 'Add your first Kenya angling destination.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg"
          >
            + Add Destination
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
            >
              <div>
                <div className="h-40 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800 relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <MapPin className="w-10 h-10 text-slate-700" />
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-semibold bg-black/70 backdrop-blur-md text-cyan-300 px-2 py-0.5 rounded">
                      {item.region}
                    </span>
                  </div>

                  <button
                    onClick={() => togglePublish(item)}
                    className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs ${
                      item.published ? 'bg-black/70 text-cyan-400' : 'bg-black/70 text-slate-400'
                    }`}
                  >
                    {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.published ? 'Published' : 'Hidden'}</span>
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{item.fishingType || 'All fishing styles'}</span>
                    </div>
                    {item.safetyGuidance && (
                      <div className="flex items-center gap-1.5 text-amber-400/90 truncate">
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.safetyGuidance}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Spot</span>
                </button>

                {deleteConfirmId === item.id ? (
                  <span className="inline-flex items-center gap-1 bg-red-950/80 border border-red-800 p-1 rounded-lg">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-1.5 py-0.5 text-[10px] text-slate-400"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                    title="Delete spot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spot Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{editingSpot ? 'Edit Fishing Spot' : 'Add New Fishing Spot Guide'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* In-modal feedback */}
              <AdminAlert message={modalError} onDismiss={() => setModalError(null)} />

              <AdminImageUploader
                currentImageUrl={formData.imageUrl}
                currentStoragePath={formData.storagePath}
                folder="fishing-spots"
                onImageUploaded={(url, path) =>
                  setFormData((prev) => ({ ...prev, imageUrl: url, storagePath: path }))
                }
                onImageRemoved={() =>
                  setFormData((prev) => ({ ...prev, imageUrl: '', storagePath: '' }))
                }
                label="Fishing Spot Photograph (Firebase Storage)"
                aspectHint="Lake, river, or coastal location photo"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Spot Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Crescent Island Bay, Lake Naivasha"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Region / County *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g. Nakuru County / Naivasha"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Target Species
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Water depth, shoreline conditions, largemouth bass, tilapia, carp..."
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Suitable Fishing Methods
                  </label>
                  <input
                    type="text"
                    value={formData.fishingType}
                    onChange={(e) => setFormData({ ...formData, fishingType: e.target.value })}
                    placeholder="e.g. Lipless Crankbaits, Soft Plastics, Bank"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Facilities / Amenities
                  </label>
                  <input
                    type="text"
                    value={formData.facilities}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                    placeholder="e.g. Boat rental, slipway, secure parking"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Access Instructions
                </label>
                <input
                  type="text"
                  value={formData.accessInstructions}
                  onChange={(e) => setFormData({ ...formData, accessInstructions: e.target.value })}
                  placeholder="e.g. Accessible via Moi South Lake Road, turn at Sanctuary gate"
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Safety Guidance & Regulations
                  </label>
                  <input
                    type="text"
                    value={formData.safetyGuidance}
                    onChange={(e) => setFormData({ ...formData, safetyGuidance: e.target.value })}
                    placeholder="e.g. Wear life jackets; hippos active near papyrus reedbeds"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Map Link / Coordinates (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.mapLink}
                    onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500"
                  />
                  <span>Publish spot to public guide</span>
                </label>
              </div>

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
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800/80 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving Spot...' : editingSpot ? 'Save Changes' : 'Publish Spot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
