import { Newspaper, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const NewsSection = ({ siteSettings, blogs }) => {
  return (
    <section id="news" className="py-24 px-[5%] bg-white relative z-10 border-y border-slate-100">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-12 text-left">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black text-[#0f172a] mb-4 tracking-tight">{siteSettings.news_title}</h2>
            <p className="text-[#64748b] text-lg leading-relaxed">{siteSettings.news_description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {blogs.length === 0 ? (
            <p className="text-slate-400 italic col-span-3 text-center py-10">No articles published yet.</p>
          ) : (
            blogs.map(blog => (
              <Link key={blog.id} href={`/news/${blog.slug}`} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full no-underline">
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
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
                    Read More <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {blogs.length > 0 && (
          <div className="mt-16 text-center">
            <Link 
              href="/news" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-bold hover:bg-slate-900 hover:text-white transition-all no-underline shadow-sm"
            >
              See More News <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
