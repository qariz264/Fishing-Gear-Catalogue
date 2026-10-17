import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogItem } from '../types/admin';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ArrowLeft, ArrowRight, Calendar, User, Tag, Share2, MessageSquare, ImageIcon, X } from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';
import { setPageSeo } from '../utils/seo';

export const PublicBlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number | null>(null);
  const navigate = useNavigate();

  const galleryImages = blog
    ? blog.images && Array.isArray(blog.images) && blog.images.length > 0
      ? blog.images
      : blog.coverImageUrl
      ? [blog.coverImageUrl]
      : []
    : [];

  useEffect(() => {
    if (blog) {
      setPageSeo({
        title: `${blog.title} | Fishing With Nelson Kenya`,
        description: blog.excerpt || blog.content.slice(0, 150),
        canonicalPath: `/blogs/${blog.slug || blog.id}`,
        ogImage: blog.coverImageUrl,
      });
    }
  }, [blog]);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      setLoading(true);

      try {
        // First try finding by slug
        const q = query(
          collection(db, 'blogs'),
          where('slug', '==', slug)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const docData = snap.docs[0].data() as BlogItem;
          if (docData.published === true || (docData.published as any) === 'true') {
            setBlog({ ...docData, id: snap.docs[0].id });
            setLoading(false);
            return;
          }
        }

        // Try direct ID lookup fallback
        const docRef = doc(db, 'blogs', slug);
        const directDoc = await getDoc(docRef);
        if (directDoc.exists()) {
          const directData = directDoc.data() as BlogItem;
          if (directData.published === true) {
            setBlog({ ...directData, id: directDoc.id });
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Error fetching blog post:', e);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-500/20 selection:text-amber-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Loading article...
          </div>
        ) : !blog ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Article Not Found</h2>
            <p className="text-xs text-slate-500">
              The article you are looking for may have been unpublished or removed.
            </p>
            <div className="pt-2">
              <Link
                to="/blogs"
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors inline-block"
              >
                Return to Blog Index
              </Link>
            </div>
          </div>
        ) : (
          <article className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {blog.coverImageUrl && (
              <div className="w-full max-h-[460px] bg-slate-950 overflow-hidden flex items-center justify-center">
                <img
                  src={blog.coverImageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-10 space-y-6">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 font-semibold">
                  {blog.category}
                </span>
                {blog.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{blog.author || 'Nelson Kariuki'}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-slate-950 leading-tight">
                {blog.title}
              </h1>

              {/* Excerpt */}
              {blog.excerpt && (
                <div className="p-4 bg-slate-50 border-l-4 border-amber-500 rounded-r-xl text-xs sm:text-sm text-slate-700 font-medium italic leading-relaxed">
                  {blog.excerpt}
                </div>
              )}

              {/* Body Content */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-6">
                {blog.content}
              </div>

              {/* Photo Gallery Grid (if multiple photos) */}
              {galleryImages.length > 1 && (
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Article Photo Gallery ({galleryImages.length} photos)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Click any photo to enlarge
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPhotoIdx(idx)}
                        className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                      >
                        <img
                          src={img}
                          alt={`${blog.title} - photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[11px] font-semibold text-white bg-slate-950/80 px-2.5 py-1 rounded-lg">
                            Enlarge
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {blog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* WhatsApp consultation callout */}
              <div className="mt-8 p-5 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Need gear tailored to this technique?</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Nelson supplies all the tackle, lines, and lures discussed in this article.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(`Hello Nelson, I read your article "${blog.title}" and would like to order the recommended gear.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Nelson on WhatsApp</span>
                </a>
              </div>
            </div>
          </article>
        )}

        {/* Fullscreen Photo Lightbox Modal */}
        {selectedPhotoIdx !== null && galleryImages[selectedPhotoIdx] && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoIdx(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhotoIdx(null)}
                className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center max-h-[80vh]">
                <img
                  src={galleryImages[selectedPhotoIdx]}
                  alt={`Photo ${selectedPhotoIdx + 1}`}
                  className="max-h-[80vh] w-auto max-w-full object-contain"
                />

                {/* Prev / Next controls */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedPhotoIdx(
                          (selectedPhotoIdx - 1 + galleryImages.length) % galleryImages.length
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
                      title="Previous photo"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedPhotoIdx((selectedPhotoIdx + 1) % galleryImages.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
                      title="Next photo"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Photo Counter */}
              <div className="mt-3 text-xs text-slate-400 font-mono">
                Photo {selectedPhotoIdx + 1} of {galleryImages.length}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
