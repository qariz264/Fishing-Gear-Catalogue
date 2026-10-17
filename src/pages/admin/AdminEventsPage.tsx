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
import { EventItem } from '../../types/admin';
import { AdminImageUploader } from '../../components/admin/AdminImageUploader';
import { AdminMultiImageUploader } from '../../components/admin/AdminMultiImageUploader';
import { AdminAlert, AdminAlertMessage } from '../../components/admin/AdminAlert';
import { ADMIN_KEY } from '../../utils/adminConstants';
import { sanitizeFirestorePayload } from '../../utils/sanitizeFirestore';
import {
  Calendar,
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
  ImageIcon,
} from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    imageUrl: string;
    images: string[];
    storagePath: string;
    startDate: string;
    endDate: string;
    location: string;
    contactInstructions: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    published: boolean;
  }>({
    title: '',
    description: '',
    imageUrl: '',
    images: [],
    storagePath: '',
    startDate: '',
    endDate: '',
    location: '',
    contactInstructions: 'WhatsApp +254 702 782946 for registration & details',
    status: 'upcoming',
    published: true,
  });

  const [statusAlert, setStatusAlert] = useState<AdminAlertMessage | null>(null);
  const [modalError, setModalError] = useState<AdminAlertMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        const list: EventItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as EventItem);
        });
        setEvents(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load events:', err);
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
    setEditingEvent(null);
    setModalError(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      images: [],
      storagePath: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      location: 'Lake Naivasha, Kenya',
      contactInstructions: 'WhatsApp +254 702 782946 for registration & details',
      status: 'upcoming',
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: EventItem) => {
    setEditingEvent(item);
    setModalError(null);
    const existingImages = item.images && Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.imageUrl ? [item.imageUrl] : []);

    setFormData({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || existingImages[0] || '',
      images: existingImages,
      storagePath: item.storagePath || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      location: item.location || 'Kenya',
      contactInstructions: item.contactInstructions || 'WhatsApp +254 702 782946 for registration & details',
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
      setModalError({ type: 'error', text: 'Please enter an event title.' });
      return;
    }

    const trimmedDate = formData.startDate.trim();
    if (!trimmedDate) {
      setModalError({ type: 'error', text: 'Please specify the start date for this event.' });
      return;
    }

    const trimmedLocation = formData.location.trim() || 'Kenya';

    setIsSaving(true);
    const id = editingEvent ? editingEvent.id : `event-${Date.now()}`;
    const primaryImg = formData.images.length > 0 ? formData.images[0] : (formData.imageUrl || '');

    const rawPayload: Record<string, any> = {
      id,
      title: trimmedTitle,
      description: formData.description.trim(),
      imageUrl: primaryImg,
      images: formData.images,
      storagePath: formData.storagePath || '',
      startDate: trimmedDate,
      location: trimmedLocation,
      contactInstructions: formData.contactInstructions.trim() || 'WhatsApp +254 702 782946 for registration & details',
      status: formData.status,
      published: formData.published,
      updatedAt: new Date().toISOString(),
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
      adminKey: ADMIN_KEY,
    };

    if (formData.endDate && formData.endDate.trim()) {
      rawPayload.endDate = formData.endDate.trim();
    }

    const payload = sanitizeFirestorePayload(rawPayload) as EventItem;

    try {
      await setDoc(doc(db, 'events', id), payload, { merge: true });
      setIsModalOpen(false);
      setEditingEvent(null);
      setStatusAlert({ type: 'success', text: `Event "${payload.title}" scheduled successfully!` });
    } catch (err: any) {
      console.error('Error saving event:', err);
      setModalError({ type: 'error', text: `Failed to schedule event: ${err?.message || err}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      setDeleteConfirmId(null);
      setStatusAlert({ type: 'success', text: 'Event deleted successfully.' });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error deleting event: ${err?.message || err}` });
    }
  };

  const togglePublish = async (item: EventItem) => {
    try {
      const nextPublished = !item.published;
      await setDoc(doc(db, 'events', item.id), { published: nextPublished, adminKey: ADMIN_KEY }, { merge: true });
      setStatusAlert({
        type: 'info',
        text: `Event "${item.title}" is now ${nextPublished ? 'published' : 'hidden (draft)'}.`,
      });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error toggling publish state: ${err?.message || err}` });
    }
  };

  const filtered = events.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (e.title || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
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
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Events & Tournaments Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize fishing tournaments, weekend group trips, boat meetups, and community gatherings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
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
            placeholder="Search events by title, location..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="text-xs">Loading events from Firestore...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No events scheduled</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? `No events matched "${searchQuery}".` : 'Add an upcoming fishing meetup or tournament.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
          >
            + Create Event
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
                    <Calendar className="w-10 h-10 text-slate-700" />
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.status === 'upcoming'
                          ? 'bg-emerald-600 text-white'
                          : item.status === 'completed'
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {item.images && item.images.length > 1 && (
                    <span className="absolute bottom-2.5 right-2.5 bg-slate-950/85 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-500/30">
                      <ImageIcon className="w-3 h-3 text-amber-400" />
                      <span>{item.images.length} Photos</span>
                    </span>
                  )}

                  <button
                    onClick={() => togglePublish(item)}
                    className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs ${
                      item.published ? 'bg-black/70 text-emerald-400' : 'bg-black/70 text-slate-400'
                    }`}
                  >
                    {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.published ? 'Published' : 'Hidden'}</span>
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.startDate} {item.endDate ? `to ${item.endDate}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">{item.location}</span>
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
                  <span>Edit Event</span>
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
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{editingEvent ? 'Edit Fishing Event' : 'Schedule New Fishing Event'}</span>
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

              <AdminMultiImageUploader
                images={formData.images}
                onChange={(imgs) =>
                  setFormData((prev) => ({
                    ...prev,
                    images: imgs,
                    imageUrl: imgs[0] || '',
                  }))
                }
                folder="events"
                label="Event Posters & Photo Gallery"
                aspectHint="Upload event flyers, tournament posters, and venue photos. The first image will be the primary poster."
                maxImages={12}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (modalError) setModalError(null);
                  }}
                  placeholder="e.g. Lake Naivasha Bass Tournament 2026"
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Date / Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      if (modalError) setModalError(null);
                    }}
                    placeholder="e.g. 2026-11-15 or Nov 15, 2026 7:00 AM"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Date / Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    placeholder="e.g. 2026-11-15 05:00 PM"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location / Meeting Point *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Crescent Island Marina, Lake Naivasha"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Details & Itinerary
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline entry guidelines, target species, weigh-in schedule, boat rentals..."
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registration & Contact Instructions
                </label>
                <input
                  type="text"
                  value={formData.contactInstructions}
                  onChange={(e) => setFormData({ ...formData, contactInstructions: e.target.value })}
                  placeholder="e.g. WhatsApp Nelson on +254 702 782946 to reserve a boat spot"
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500"
                  />
                  <span>Publish event on public website</span>
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/80 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Scheduling Event...' : editingEvent ? 'Save Changes' : 'Schedule Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
