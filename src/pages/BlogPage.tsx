import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  Search,
  Tag,
  Share2,
  Bookmark,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../services/api';
import { BlogPost } from '../types';
import { useNotification } from '../context/NotificationContext';

interface BlogPageProps {
  initialSlug?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ initialSlug, onNavigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useNotification();

  const loadPosts = () => {
    setIsLoading(true);
    api.blog
      .list({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        q: searchQuery.trim() || undefined,
      })
      .then((res) => setPosts(res.posts))
      .catch((err) => console.error('Failed to load blog posts:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (initialSlug) {
      setIsLoading(true);
      api.blog
        .getDetail(initialSlug)
        .then((res) => {
          setSelectedPost(res.post);
          setRelatedPosts(res.related || []);
        })
        .catch(() => {
          showToast('Article not found.', 'error');
          setSelectedPost(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setSelectedPost(null);
      loadPosts();
    }
  }, [initialSlug, selectedCategory, searchQuery]);

  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
    onNavigate('blog', post.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    onNavigate('blog');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Article link copied to clipboard!', 'success');
  };

  const categories = ['all', 'Audio & Tech', 'Productivity & Work', 'Lifestyle & Gourmet'];

  // Detail View
  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        {/* Cover Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              {selectedPost.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedPost.readTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(selectedPost.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight font-heading">
            {selectedPost.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {selectedPost.excerpt}
          </p>

          {/* Author Strip & Share */}
          <div className="flex items-center justify-between py-4 border-y border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={selectedPost.authorAvatar}
                alt={selectedPost.author}
                className="w-11 h-11 rounded-full object-cover shadow-sm"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedPost.author}</p>
                <p className="text-[11px] text-slate-500">Editorial Specialist & Tech Curator</p>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Article</span>
            </button>
          </div>
        </div>

        {/* Feature Image */}
        <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-xl bg-slate-900">
          <img
            src={selectedPost.coverImage}
            alt={selectedPost.title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Body Text */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
          {selectedPost.content}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Tag className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 mr-2">Topics:</span>
          {selectedPost.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Related Reads */}
        {relatedPosts.length > 0 && (
          <div className="pt-10 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              Recommended Reading
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => handleOpenPost(rel)}
                  className="group cursor-pointer bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Index List View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Shopkart Journal & Tech Insights</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
          Curated Stories & Buying Guides
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Deep dives into acoustic engineering, pro workspace ergonomics, specialty coffee extraction, and premium design.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Stories' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles or topics..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Loading editorial stories...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Articles Found</h3>
          <p className="text-xs text-slate-500">Try modifying your search query or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => handleOpenPost(post)}
              className="group cursor-pointer bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {post.author}
                  </span>
                </div>

                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Read</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
