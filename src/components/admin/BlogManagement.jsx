'use client';

import { Save, Loader2, Trash2 } from 'lucide-react';

export const BlogManagement = ({ 
  newBlog, 
  setNewBlog, 
  handleCreateBlog, 
  uploadImage, 
  setUploadImage, 
  loading, 
  blogs, 
  deleteItem 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
        <h3 className="text-xl font-bold mb-6">Create New Article</h3>
        <form onSubmit={handleCreateBlog} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
            <input 
              type="text" 
              value={newBlog.title} 
              onChange={(e) => setNewBlog({...newBlog, title: e.target.value})} 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              required 
              disabled={loading} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Content</label>
            <textarea 
              value={newBlog.content} 
              onChange={(e) => setNewBlog({...newBlog, content: e.target.value})} 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99] h-32" 
              required 
              disabled={loading}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Featured Image</label>
            <input 
              type="file" 
              onChange={(e) => setUploadImage(e.target.files[0])} 
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#004A99] hover:file:bg-blue-100" 
              disabled={loading} 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Publish Article
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-6">Recent Articles</h3>
        {blogs.length === 0 && <p className="text-slate-400 italic">No articles published yet.</p>}
        {blogs.map(blog => (
          <div key={blog.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
            <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
              {blog.image_url && <img src={blog.image_url} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">{blog.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-1">{blog.content}</p>
            </div>
            <button 
              onClick={() => deleteItem(blog.id)} 
              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
