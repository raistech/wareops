import { Newspaper, ExternalLink } from 'lucide-react';

export const NewsSection = ({ siteSettings, blogs, setSelectedBlog }) => {
  return (
    <section id="news" className="py-24 px-[5%] bg-white relative z-10 border-y border-slate-100">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-10 text-left">
          <div>
            <h2 className="text-3xl font-bold text-[#0f172a] mb-2">{siteSettings.news_title}</h2>
            <p className="text-[#64748b] text-lg">{siteSettings.news_description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.length === 0 ? (
            <p className="text-slate-400 italic col-span-3 text-center py-10">No articles published yet.</p>
          ) : (
            blogs.map(blog => (
              <div key={blog.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {blog.image_url ? (
                    <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Newspaper size={48} />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1 text-left">
                  <div className="text-[0.7rem] font-bold text-[#E30613] uppercase mb-2">
                    {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-[#004A99] transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 text-left">
                    {blog.content}
                  </p>
                  <button 
                    onClick={() => setSelectedBlog(blog)}
                    className="text-[#004A99] font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    Read More <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
