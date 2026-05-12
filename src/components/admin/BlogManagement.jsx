'use client';

import { Save, Loader2, Trash2, Edit, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-50 animate-pulse rounded-lg border border-slate-200" />
});

export const BlogManagement = ({ 
  newBlog, 
  setNewBlog, 
  handleCreateBlog, 
  uploadImage, 
  setUploadImage, 
  loading, 
  blogs, 
  deleteItem,
  editingBlogId,
  setEditBlog,
  cancelEditBlog
}) => {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image', 'clean']
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = async () => {
            const file = input.files[0];
            const formData = new FormData();
            formData.append('image', file);
            const token = localStorage.getItem('adminToken');
            try {
              const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
              });
              const data = await res.json();
              if (data.success) {
                const range = this.quill.getSelection();
                this.quill.insertEmbed(range.index, 'image', data.url);
              }
            } catch (err) {
              console.error('Upload failed:', err);
            }
          };
        }
      }
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'align',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{editingBlogId ? 'Edit Article' : 'Create New Article'}</h3>
          {editingBlogId && (
            <button 
              onClick={cancelEditBlog}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Cancel Edit"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <style jsx global>{`
          .ql-container {
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            font-family: inherit;
          }
          .ql-toolbar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background: #f8fafc;
          }
          .ql-editor {
            min-height: 200px;
            font-size: 1rem;
          }
        `}</style>
        <form onSubmit={handleCreateBlog} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
            <input 
              type="text" 
              value={newBlog.title} 
              onChange={(e) => setNewBlog({...newBlog, title: e.target.value})} 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#C5A059]" 
              required 
              disabled={loading} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Content</label>
            <div className="bg-white">
              <ReactQuill 
                theme="snow"
                value={newBlog.content}
                onChange={(content) => setNewBlog({...newBlog, content})}
                modules={modules}
                formats={formats}
                readOnly={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Featured Image {editingBlogId && '(Leave empty to keep current)'}
            </label>
            <input 
              type="file" 
              onChange={(e) => setUploadImage(e.target.files[0])} 
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#C5A059] hover:file:bg-blue-100" 
              disabled={loading} 
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="flex-1 bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {editingBlogId ? 'Update Article' : 'Publish Article'}
            </button>
            {editingBlogId && (
              <button 
                type="button"
                onClick={cancelEditBlog}
                className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
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
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold text-slate-800 truncate">{blog.title}</h4>
              <div 
                className="text-sm text-slate-500 line-clamp-1 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content.replace(/<[^>]*>?/gm, ' ') }}
              />
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setEditBlog(blog)} 
                className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                title="Edit Article"
              >
                <Edit size={20} />
              </button>
              <button 
                onClick={() => deleteItem(blog.id)} 
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Delete Article"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
