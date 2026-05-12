'use client';
import { useState, useEffect } from 'react';
import { useSiteData } from '../../hooks/useSiteData';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Newspaper, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewsPage() {
  const { siteSettings } = useSiteData();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Blogs fetch error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#0f172a]">
      <Navbar 
        siteSettings={siteSettings} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <main className="py-20 px-[5%]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="text-left">
              <Link href="/" className="inline-flex items-center gap-2 text-[#C5A059] font-bold mb-4 hover:underline">
                <ArrowLeft size={18} /> Back to Home
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-4">
                {siteSettings.news_title || 'Latest News & Articles'}
              </h1>
              <p className="text-[#64748b] text-xl max-w-2xl">
                {siteSettings.news_description || 'Stay updated with our latest Warehouse insights and company news.'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100">
              <Newspaper size={64} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-2xl font-bold text-slate-400">No articles published yet.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map(blog => (
                <Link 
                  key={blog.id} 
                  href={`/news/${blog.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full no-underline"
                >
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    {blog.image_url ? (
                      <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Newspaper size={48} />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1 text-left">
                    <div className="text-[0.7rem] font-bold text-[#996515] uppercase mb-3 tracking-wider">
                      {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 line-clamp-2 group-hover:text-[#C5A059] transition-colors leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                      {blog.content.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()}
                    </p>
                    <div className="text-[#C5A059] font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      Read Full Story <ExternalLink size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
