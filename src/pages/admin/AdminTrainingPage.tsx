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
import { TrainingItem } from '../../types/admin';
import { AdminImageUploader } from '../../components/admin/AdminImageUploader';
import { AdminAlert, AdminAlertMessage } from '../../components/admin/AdminAlert';
import { ADMIN_KEY } from '../../utils/adminConstants';
import { sanitizeFirestorePayload } from '../../utils/sanitizeFirestore';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  X,
  Loader2,
  Target,
} from 'lucide-react';

export const AdminTrainingPage: React.FC = () => {
  const [trainingList, setTrainingList] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    learningObjectives: string;
    imageUrl: string;
    storagePath: string;
    venue: string;
    schedule: string;
    duration: string;
    requirements: string;
    contactInstructions: string;
    status: 'upcoming' | 'ongoing' | 'completed';
    published: boolean;
  }>({
    title: '',
    description: '',
    category: 'Casting & Gear Clinics',
    learningObjectives: '',
    imageUrl: '',
    storagePath: '',
    venue: 'Nairobi & Lake Naivasha',
    schedule: 'Saturdays 9:00 AM – 1:00 PM',
    duration: '4 Hours Hands-on',
    requirements: 'Bring your current rod/reel setup or use loaner training gear',
    contactInstructions: 'Contact Nelson on +254 702 782946 to book your session',
    status: 'upcoming',
    published: true,
  });

  const [statusAlert, setStatusAlert] = useState<AdminAlertMessage | null>(null);
  const [modalError, setModalError] = useState<AdminAlertMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'training'),
      (snapshot) => {
        const list: TrainingItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as TrainingItem);
        });
        setTrainingList(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load training:', err);
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
    setEditingItem(null);
    setModalError(null);
    setFormData({
      title: '',
      description: '',
      category: 'Casting & Gear Clinics',
      learningObjectives: '',
      imageUrl: '',
      storagePath: '',
      venue: 'Nairobi & Lake Naivasha',
      schedule: 'Saturdays 9:00 AM – 1:00 PM',
      duration: '4 Hours Hands-on',
      requirements: 'Bring your current rod/reel setup or use loaner training gear',
      contactInstructions: 'Contact Nelson on +254 702 782946 to book your session',
      status: 'upcoming',
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: TrainingItem) => {
    setEditingItem(item);
    setModalError(null);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Casting & Gear Clinics',
      learningObjectives: item.learningObjectives || '',
      imageUrl: item.imageUrl || '',
      storagePath: item.storagePath || '',
      venue: item.venue || '',
      schedule: item.schedule || '',
      duration: item.duration || '',
      requirements: item.requirements || '',
      contactInstructions: item.contactInstructions || '',
      status: item.status || 'upcoming',
      published: item.published !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setModalError({ type: 'error', text: 'Please enter a training program title.' });
      return;
    }

    setIsSaving(true);
    const id = editingItem ? editingItem.id : `train-${Date.now()}`;
    const payload = sanitizeFirestorePayload({
      id,
      title: trimmedTitle,
      description: formData.description.trim(),
      category: formData.category.trim() || 'Angling Workshop',
      learningObjectives: formData.learningObjectives.trim(),
      imageUrl: formData.imageUrl || '',
      storagePath: formData.storagePath || '',
      venue: formData.venue.trim() || 'Kenya',
      schedule: formData.schedule.trim() || 'Flexible by arrangement',
      duration: formData.duration.trim() || '3-4 Hours',
      requirements: formData.requirements.trim(),
      contactInstructions: formData.contactInstructions.trim() || 'WhatsApp Nelson on +254 702 782946 to register',
      status: formData.status,
      published: formData.published,
      updatedAt: new Date().toISOString(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      adminKey: ADMIN_KEY,
    }) as TrainingItem;

    try {
      await setDoc(doc(db, 'training', id), payload, { merge: true });
      setIsModalOpen(false);
      setEditingItem(null);
      setStatusAlert({ type: 'success', text: `Training program "${payload.title}" saved successfully.` });
    } catch (err: any) {
      console.error('Error saving training:', err);
      setModalError({ type: 'error', text: `Failed to save training: ${err?.message || err}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'training', id));
      setDeleteConfirmId(null);
      setStatusAlert({ type: 'success', text: 'Training program deleted.' });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error deleting training: ${err?.message || err}` });
    }
  };

  const togglePublish = async (item: TrainingItem) => {
    try {
      const nextPublished = !item.published;
      await setDoc(doc(db, 'training', item.id), { published: nextPublished, adminKey: ADMIN_KEY }, { merge: true });
      setStatusAlert({
        type: 'info',
        text: `Training program "${item.title}" is now ${nextPublished ? 'published' : 'hidden (draft)'}.`,
      });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error toggling publish state: ${err?.message || err}` });
    }
  };

  const filtered = trainingList.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (t.title || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
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
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <span>Fishing Training & Masterclasses</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage casting clinics, knot tying & lure rigging masterclasses, and guided practical sessions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Training Session</span>
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
            placeholder="Search classes by title, skill..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="text-xs">Loading training programs...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No training classes listed</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? `No classes matched "${searchQuery}".` : 'Create a baitcasting, spinning, or fly fishing clinic.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg"
          >
            + Add Training
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
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <GraduationCap className="w-10 h-10 text-slate-700" />
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-semibold bg-black/70 backdrop-blur-md text-purple-300 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <button
                    onClick={() => togglePublish(item)}
                    className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs ${
                      item.published ? 'bg-black/70 text-purple-400' : 'bg-black/70 text-slate-400'
                    }`}
                  >
                    {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.published ? 'Published' : 'Hidden'}</span>
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>{item.schedule || item.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">{item.venue}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Class</span>
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
                    title="Delete training"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Training Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>{editingItem ? 'Edit Training Program' : 'Create New Training Program'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* In-modal error feedback */}
              <AdminAlert message={modalError} onDismiss={() => setModalError(null)} />

              <AdminImageUploader
                currentImageUrl={formData.imageUrl}
                currentStoragePath={formData.storagePath}
                folder="training"
                onImageUploaded={(url, path) =>
                  setFormData((prev) => ({ ...prev, imageUrl: url, storagePath: path }))
                }
                onImageRemoved={() =>
                  setFormData((prev) => ({ ...prev, imageUrl: '', storagePath: '' }))
                }
                label="Training Photograph / Class Banner (Firebase Storage)"
                aspectHint="Practical clinic or technique photo"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Class Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Baitcasting Reel Tuning & Thumb Control"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Baitcasting, Fly Fishing"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of the workshop and techniques covered..."
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Learning Objectives
                </label>
                <textarea
                  rows={2}
                  value={formData.learningObjectives}
                  onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                  placeholder="What participants will learn: spool tensioning, backlash prevention, sidearm casting..."
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Venue / Meeting Point
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Lake Naivasha / Nairobi"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="e.g. Saturdays 9am - 1pm"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 4 Hours"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Requirements
                  </label>
                  <input
                    type="text"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="e.g. Own rod or request loaner"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Booking Instructions
                  </label>
                  <input
                    type="text"
                    value={formData.contactInstructions}
                    onChange={(e) => setFormData({ ...formData, contactInstructions: e.target.value })}
                    placeholder="e.g. WhatsApp Nelson on +254 702 782946"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-purple-500"
                  />
                  <span>Publish session to public website</span>
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
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/80 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving Program...' : editingItem ? 'Save Changes' : 'Publish Program'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
