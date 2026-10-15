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
import { BlogItem } from '../../types/admin';
import { AdminImageUploader } from '../../components/admin/AdminImageUploader';
import { AdminAlert, AdminAlertMessage } from '../../components/admin/AdminAlert';
import { ADMIN_KEY } from '../../utils/adminConstants';
import { sanitizeFirestorePayload } from '../../utils/sanitizeFirestore';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Calendar,
  User,
  Tag,
} from 'lucide-react';

export const AdminBlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchParams, setSearchParams] = useSearchParams();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    coverImageUrl: string;
    storagePath: string;
    tags: string;
    published: boolean;
  }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Nelson Kariuki',
    category: 'Fishing Techniques',
    coverImageUrl: '',
    storagePath: '',
    tags: 'Bass, Kenya, Lures',
    published: true,
  });

  const [statusAlert, setStatusAlert] = useState<AdminAlertMessage | null>(null);
  const [modalError, setModalError] = useState<AdminAlertMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'blogs'),
      (snapshot) => {
        const list: BlogItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as BlogItem);
        });
        setBlogs(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load blogs:', err);
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

  // Helper to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === generateSlug(prev.title) || !prev.slug ? generateSlug(val) : prev.slug,
    }));
  };

  const openCreateModal = () => {
    setEditingBlog(null);
    setModalError(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'Nelson Kariuki',
      category: 'Fishing Techniques',
      coverImageUrl: '',
      storagePath: '',
      tags: 'Bass, Kenya, Lures',
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: BlogItem) => {
    setEditingBlog(item);
    setModalError(null);
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      author: item.author || 'Nelson Kariuki',
      category: item.category || 'Fishing Techniques',
      coverImageUrl: item.coverImageUrl || '',
      storagePath: item.storagePath || '',
      tags: item.tags ? item.tags.join(', ') : '',
      published: item.published === true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setModalError({ type: 'error', text: 'Please enter an article title.' });
      return;
    }

    setIsSaving(true);
    const id = editingBlog ? editingBlog.id : `blog-${Date.now()}`;
    const slug = formData.slug.trim() || generateSlug(formData.title);
    const tagList = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const rawPayload: Record<string, any> = {
      id,
      title: trimmedTitle,
      slug,
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      author: formData.author.trim() || 'Nelson Kariuki',
      category: formData.category.trim() || 'General',
      coverImageUrl: formData.coverImageUrl || '',
      storagePath: formData.storagePath || '',
      tags: tagList,
      published: formData.published,
      updatedAt: new Date().toISOString(),
      createdAt: editingBlog?.createdAt || new Date().toISOString(),
      adminKey: ADMIN_KEY,
    };

    if (formData.published) {
      rawPayload.publishedAt = editingBlog?.publishedAt || new Date().toISOString();
    }

    const payload = sanitizeFirestorePayload(rawPayload) as BlogItem;

    try {
      await setDoc(doc(db, 'blogs', id), payload, { merge: true });
      setIsModalOpen(false);
      setEditingBlog(null);
      setStatusAlert({ type: 'success', text: `Article "${payload.title}" saved successfully.` });
    } catch (err: any) {
      console.error('Error saving blog:', err);
      setModalError({ type: 'error', text: `Failed to save article: ${err?.message || err}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setDeleteConfirmId(null);
      setStatusAlert({ type: 'success', text: 'Article deleted from blog.' });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error deleting blog: ${err?.message || err}` });
    }
  };

  const togglePublish = async (item: BlogItem) => {
    try {
      const next = !item.published;
      await setDoc(
        doc(db, 'blogs', item.id),
        {
          published: next,
          publishedAt: next ? (item.publishedAt || new Date().toISOString()) : item.publishedAt,
          adminKey: ADMIN_KEY,
        },
        { merge: true }
      );
      setStatusAlert({
        type: 'info',
        text: `Article "${item.title}" is now ${next ? 'published' : 'saved as draft'}.`,
      });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: `Error updating article status: ${err?.message || err}` });
    }
  };

  const filtered = blogs.filter((b) => {
    if (selectedStatus === 'published' && !b.published) return false;
    if (selectedStatus === 'draft' && b.published) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (b.title || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.excerpt || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Non-blocking feedback banner */}
      <AdminAlert message={statusAlert} onDismiss={() => setStatusAlert(null)} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Blog Articles & Fishing Guides</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish fishing articles, rigging tutorials, local angling insights, and stories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Blog Article</span>
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
            placeholder="Search articles by title, category, keywords..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'published', 'draft'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedStatus === st ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards / Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs">Loading articles from Firestore...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No articles found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? `No articles matched "${searchQuery}".` : 'Start your first fishing guide or story.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
          >
            + Create Article
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
                {/* Cover Image */}
                <div className="h-40 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800 relative">
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                      <BookOpen className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">No cover image</span>
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-semibold bg-black/70 backdrop-blur-md text-slate-200 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <button
                    onClick={() => togglePublish(item)}
                    className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs ${
                      item.published
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.published ? 'Published' : 'Draft'}</span>
                  </button>
                </div>

                {/* Body info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.excerpt || item.content?.substring(0, 120)}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Article</span>
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
                    title="Delete article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blog Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>{editingBlog ? 'Edit Blog Article' : 'Write New Blog Article'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* In-modal feedback */}
              <AdminAlert message={modalError} onDismiss={() => setModalError(null)} />

              <AdminImageUploader
                currentImageUrl={formData.coverImageUrl}
                currentStoragePath={formData.storagePath}
                folder="blogs"
                onImageUploaded={(url, path) =>
                  setFormData((prev) => ({ ...prev, coverImageUrl: url, storagePath: path }))
                }
                onImageRemoved={() =>
                  setFormData((prev) => ({ ...prev, coverImageUrl: '', storagePath: '' }))
                }
                label="Article Cover Image (Stored in Firebase Storage)"
                aspectHint="Recommended: 16:9 banner"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Mastering Lipless Crankbaits at Lake Naivasha"
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="mastering-lipless-crankbaits"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
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
                    placeholder="e.g. Techniques, Lure Guides"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Nelson Kariuki"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Excerpt (Summary)
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary appearing in previews and social cards..."
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Article Body (Full Content)
                </label>
                <textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your article content here. You can include paragraphs, rigging advice, gear tips..."
                  className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono leading-relaxed resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Naivasha, Largemouth Bass, Rat-L-Trap"
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-blue-500"
                  />
                  <span>Publish immediately to public website</span>
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/80 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving Article...' : editingBlog ? 'Save Article' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
