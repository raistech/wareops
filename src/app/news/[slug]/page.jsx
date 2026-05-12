'use client';
import { useState, useEffect, use } from 'react';
import { useSiteData } from '../../../hooks/useSiteData';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { Newspaper, Calendar, ArrowLeft, Share2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NewsDetailPage({ params }) {
  const { slug } = use(params);
  const { siteSettings } = useSiteData();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/admin/blogs/slug/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setBlog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Blog fetch error:', err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans text-[#0f172a]">
        <Navbar siteSettings={siteSettings} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <div className="py-40 text-center">
          <Newspaper size={80} className="mx-auto text-slate-200 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <Link href="/news" className="text-[#C5A059] font-bold hover:underline">Back to All News</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#0f172a]">
      <Navbar 
        siteSettings={siteSettings} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <article className="pt-12 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/news" className="inline-flex items-center gap-2 text-[#C5A059] font-bold mb-10 hover:underline">
            <ArrowLeft size={18} /> Back to News
          </Link>

          <header className="mb-12 text-left">
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-[#996515]" />
                {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-[#996515]" />
                {Math.ceil(blog.content.length / 1000)} min read
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#0f172a] leading-[1.1] mb-8">
              {blog.title}
            </h1>
          </header>

          {blog.image_url && (
            <div className="rounded-[40px] overflow-hidden shadow-2xl mb-16 aspect-[21/9] md:aspect-[16/7]">
              <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-col gap-12 lg:gap-16">
            <div className="flex-1 min-w-0">
              <div 
                className="article-content text-slate-600 text-lg leading-[1.8] prose prose-slate max-w-none break-words
                  prose-headings:text-[#0f172a] prose-headings:font-black prose-headings:mb-6 prose-headings:mt-12
                  prose-p:mb-8 prose-li:mb-2 prose-strong:text-slate-900 prose-img:rounded-3xl prose-img:mx-auto prose-a:text-[#C5A059] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                  prose-pre:bg-slate-900 prose-pre:text-slate-200 prose-pre:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
