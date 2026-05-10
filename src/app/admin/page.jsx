'use client';

import { useState, useEffect } from 'react';
import { Newspaper, Users, Settings, Save, Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    hero_title: 'Logistics Control Center',
    hero_description: 'Real-time logistics flow monitoring and warehouse operational efficiency PT. Central Proteina Prima.',
    overview_title: 'Logistics Overview',
    overview_description: 'Comprehensive summary of all warehouse operations.',
    news_title: 'Latest News & Articles',
    news_description: 'Stay updated with our latest logistics insights and company news.'
  });
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [blogImage, setBlogImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/${activeTab}`);
      const data = await res.json();
      if (activeTab === 'blogs') setBlogs(data);
      if (activeTab === 'banners') setBanners(data);
      if (activeTab === 'employees') setEmployees(data);
      if (activeTab === 'settings') setSiteSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      if (res.ok) showMessage('success', 'Settings saved successfully');
    } catch (err) {
      showMessage('error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBlog.title);
      formData.append('content', newBlog.content);
      if (blogImage) formData.append('image', blogImage);

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setNewBlog({ title: '', content: '' });
        setBlogImage(null);
        // Reset file input manually
        e.target.reset();
        await fetchData();
        showMessage('success', 'Article published successfully!');
      } else {
        const errData = await res.json();
        showMessage('error', errData.error || 'Failed to publish article');
      }
    } catch (err) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await fetch(`/api/admin/${activeTab}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        showMessage('success', 'Item deleted successfully');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete item');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 flex-shrink-0">
        <h1 className="text-xl font-black mb-10 text-primary-red">CP PRIMA ADMIN</h1>
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'blogs' ? 'bg-primary-blue' : 'hover:bg-slate-800'}`}
          >
            <Newspaper size={20} /> Articles
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'banners' ? 'bg-primary-blue' : 'hover:bg-slate-800'}`}
          >
            <ImageIcon size={20} /> Banners
          </button>
          <button 
            onClick={() => setActiveTab('employees')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'employees' ? 'bg-primary-blue' : 'hover:bg-slate-800'}`}
          >
            <Users size={20} /> Employees
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-primary-blue' : 'hover:bg-slate-800'}`}
          >
            <Settings size={20} /> Site Settings
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-10 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 capitalize">{activeTab} Management</h2>
          {message.text && (
            <div className={`px-4 py-2 rounded-lg font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
        </header>

        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
              <h3 className="text-xl font-bold mb-6">Create New Article</h3>
              <form onSubmit={handleCreateBlog} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Content</label>
                  <textarea 
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-32"
                    required
                    disabled={loading}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Featured Image</label>
                  <input 
                    type="file" 
                    onChange={(e) => setBlogImage(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary-blue hover:file:bg-blue-100"
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {loading ? 'Publishing...' : 'Publish Article'}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6">Recent Articles</h3>
              {blogs.length === 0 && <p className="text-slate-400 italic">No articles yet.</p>}
              {blogs.map(blog => (
                <div key={blog.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                    {blog.image_url && <img src={blog.image_url} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{blog.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{blog.content}</p>
                  </div>
                  <button onClick={() => deleteItem(blog.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center py-20 h-fit">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold mb-2">Employee Profiles</h3>
            <p className="text-slate-500 max-w-md mx-auto">This section is ready to be linked with your employee photo database. HR can upload photos and profiles here.</p>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center py-20 h-fit">
            <ImageIcon size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold mb-2">Banner Management</h3>
            <p className="text-slate-500 max-w-md mx-auto">Manage hero banners and promotional images for the company profile.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-6">General Site Settings</h3>
              <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* Hero Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary-blue border-b pb-2 text-left">Hero Section</h4>
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={siteSettings.hero_title}
                      onChange={(e) => setSiteSettings({...siteSettings, hero_title: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue"
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
                    <textarea 
                      value={siteSettings.hero_description}
                      onChange={(e) => setSiteSettings({...siteSettings, hero_description: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-24"
                    ></textarea>
                  </div>
                </div>

                {/* Overview Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary-blue border-b pb-2 text-left">Logistics Overview</h4>
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={siteSettings.overview_title}
                      onChange={(e) => setSiteSettings({...siteSettings, overview_title: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue"
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
                    <textarea 
                      value={siteSettings.overview_description}
                      onChange={(e) => setSiteSettings({...siteSettings, overview_description: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-20"
                    ></textarea>
                  </div>
                </div>

                {/* News Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary-blue border-b pb-2 text-left">News & Articles</h4>
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={siteSettings.news_title}
                      onChange={(e) => setSiteSettings({...siteSettings, news_title: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue"
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
                    <textarea 
                      value={siteSettings.news_description}
                      onChange={(e) => setSiteSettings({...siteSettings, news_description: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-20"
                    ></textarea>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white p-4 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Save All Settings
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
