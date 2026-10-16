import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogItem } from '../types/admin';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BookOpen, Calendar, User, Search, Tag, ArrowRight } from 'lucide-react';
import { setPageSeo } from '../utils/seo';

export const PublicBlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setPageSeo({
      title: 'Fishing Blog & Angling Guides - Fishing With Nelson Kenya',
      description:
        'In-depth fishing guides, tackle recommendations, bait selection, seasonal angling tips, and stories from Kenyan waters.',
      canonicalPath: '/blogs',
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'blogs'),
      (snapshot) => {
        const list: BlogItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as BlogItem;
          if (data.published === true || (data.published as any) === 'true') {
            list.push({ ...data, id: d.id });
          }
        });
        setBlogs(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Error reading blogs:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)))];

  const filteredBlogs = blogs.filter((blog) => {
    if (selectedCategory !== 'All' && blog.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        blog.title.toLowerCase().includes(q) ||
        (blog.excerpt || '').toLowerCase().includes(q) ||
        (blog.content || '').toLowerCase().includes(q) ||
        (blog.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-500/20 selection:text-amber-900">
      <Header />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Angling Articles & Technique Guides</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Fishing With Nelson Blog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Proven tips, watercraft, lure selections, and gear tuning notes for freshwater bass, trout, tilapia, and saltwater sport fishing in Kenya.
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-md">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, techniques, lures..."
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      {categories.length > 2 && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Loading articles...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No published articles yet</h3>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? `No articles matched "${searchQuery}".`
                : 'Articles and technique guides will appear here once published by Nelson.'}
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors inline-block"
              >
                Browse Fishing Gear Catalogue
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {blog.coverImageUrl && (
                    <div className="h-48 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={blog.coverImageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 font-semibold">
                        {blog.category}
                      </span>
                      {blog.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-slate-950 font-display leading-snug line-clamp-2">
                      <Link
                        to={`/blogs/${blog.slug || blog.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {blog.title}
                      </Link>
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {blog.excerpt || blog.content.substring(0, 160)}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{blog.author || 'Nelson Kariuki'}</span>
                    </span>

                    <Link
                      to={`/blogs/${blog.slug || blog.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>Read article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
