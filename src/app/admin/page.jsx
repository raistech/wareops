'use client';

import { useState, useEffect } from 'react';
import { Newspaper, Users, Settings, Save, Trash2, Plus, Image as ImageIcon, Loader2, LogOut, Lock, Building, Check, X, Star } from 'lucide-react';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    site_title: 'CP Prima | Monitoring Warehouse',
    site_name: 'Warehouse Ops',
    company_name: 'CP Prima Logistics',
    site_icon: '',
    hero_title: 'Logistics Control Center',
    hero_description: 'Real-time logistics flow monitoring and warehouse operational efficiency PT. Central Proteina Prima.',
    overview_title: 'Logistics Overview',
    overview_description: 'Comprehensive summary of all warehouse operations.',
    news_title: 'Latest News & Articles',
    news_description: 'Stay updated with our latest logistics insights and company news.',
    monitoring_title: 'Warehouse Overview',
    monitoring_description: 'Detailed real-time monitoring for each warehouse unit.'
  });
  
  // Form states
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', warehouse_id: 'newgudang', sort_order: 0 });
  const [newBanner, setNewBanner] = useState({ title: '', link_url: '', sort_order: 0 });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [uploadImage, setUploadImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const warehouseOptions = [
    { id: 'newgudang', name: 'Gudang Waru' },
    { id: 'gudangkletek', name: 'Gudang Kletek' },
    { id: 'gudangrm1', name: 'RM Abba' },
    { id: 'gudangrm2', name: 'RM Cassaland' },
    { id: 'gudangrm3', name: 'RM Sumber Asia' },
    { id: 'gudangrm4', name: 'RM Kemasan' },
    { id: 'gudangpabrik', name: 'RM Pabrik' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token === 'skye-admin-auth-token') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [activeTab, isLoggedIn]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/${activeTab}`);
      const data = await res.json();
      if (activeTab === 'blogs') setBlogs(data);
      if (activeTab === 'banners') setBanners(data);
      if (activeTab === 'employees') setEmployees(data);
      if (activeTab === 'reviews') setReviews(data);
      if (activeTab === 'settings') setSiteSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        showMessage('success', 'Review deleted');
      }
    } catch (err) {
      showMessage('error', 'Delete failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
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
      if (uploadImage) formData.append('image', uploadImage);

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setNewBlog({ title: '', content: '' });
        setUploadImage(null);
        e.target.reset();
        await fetchData();
        showMessage('success', 'Article published successfully!');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newEmployee.name);
      formData.append('position', newEmployee.position);
      formData.append('warehouse_id', newEmployee.warehouse_id);
      formData.append('sort_order', newEmployee.sort_order);
      if (uploadImage) formData.append('image', uploadImage);

      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setNewEmployee({ name: '', position: '', warehouse_id: 'newgudang', sort_order: 0 });
        setUploadImage(null);
        e.target.reset();
        await fetchData();
        showMessage('success', 'Employee added successfully!');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!uploadImage) return alert('Please select a banner image');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBanner.title);
      formData.append('link_url', newBanner.link_url);
      formData.append('sort_order', newBanner.sort_order);
      formData.append('is_active', 'true');
      formData.append('image', uploadImage);

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setNewBanner({ title: '', link_url: '', sort_order: 0 });
        setUploadImage(null);
        e.target.reset();
        await fetchData();
        showMessage('success', 'Banner added successfully!');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setLoading(false);
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return alert('New passwords do not match');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next })
      });
      if (res.ok) {
        showMessage('success', 'Password updated successfully');
        setPasswords({ current: '', next: '', confirm: '' });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update password');
      }
    } catch (err) {
      alert('Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadIcon = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/admin/settings/icon', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSiteSettings(prev => ({ ...prev, site_icon: data.imageUrl }));
        showMessage('success', 'Site icon updated');
      }
    } catch (err) {
      showMessage('error', 'Failed to upload icon');
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
          <div className="w-20 h-20 bg-primary-red/10 text-primary-red rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">ADMIN ACCESS</h1>
          <p className="text-slate-500 mb-10 text-sm">Please enter your password to continue.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="Enter Admin Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-blue focus:bg-white transition-all text-center text-lg font-bold tracking-widest"
              required
              autoFocus
            />
            <button 
              type="submit" 
              className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Log In Now'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 flex-shrink-0 flex flex-col">
        <h1 className="text-xl font-black mb-10 text-primary-red">CP PRIMA ADMIN</h1>
        <nav className="space-y-2 flex-1">
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
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'reviews' ? 'bg-primary-blue' : 'hover:bg-slate-800'}`}
          >
            <Star size={20} /> Reviews
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-primary-blue' : 'hover:bg-slate-800'}`}
          >
            <Settings size={20} /> Site Settings
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors font-bold"
        >
          <LogOut size={20} /> Log Out
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-10 overflow-auto text-left">
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
            <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
              <h3 className="text-xl font-bold mb-6">Create New Article</h3>
              <form onSubmit={handleCreateBlog} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                  <input type="text" value={newBlog.title} onChange={(e) => setNewBlog({...newBlog, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" required disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Content</label>
                  <textarea value={newBlog.content} onChange={(e) => setNewBlog({...newBlog, content: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-32" required disabled={loading}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Featured Image</label>
                  <input type="file" onChange={(e) => setUploadImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary-blue hover:file:bg-blue-100" disabled={loading} />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Publish Article
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6">Recent Articles</h3>
              {blogs.map(blog => (
                <div key={blog.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                    {blog.image_url && <img src={blog.image_url} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{blog.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{blog.content}</p>
                  </div>
                  <button onClick={() => deleteItem(blog.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
              <h3 className="text-xl font-bold mb-6">Add New Staff / Org Structure</h3>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Full Name</label>
                  <input type="text" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" required disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Position / Jabatan</label>
                  <input type="text" value={newEmployee.position} onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" required disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Warehouse / Unit</label>
                  <select value={newEmployee.warehouse_id} onChange={(e) => setNewEmployee({...newEmployee, warehouse_id: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue">
                    {warehouseOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Staff Photo</label>
                  <input type="file" onChange={(e) => setUploadImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary-blue hover:file:bg-blue-100" disabled={loading} />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  Add Staff Member
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6">Current Organization</h3>
              {employees.length === 0 && <p className="text-slate-400 italic">No staff added yet.</p>}
              {employees.map(emp => (
                <div key={emp.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
                  <div className="w-14 h-14 bg-slate-200 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary-blue">
                    {emp.image_url ? <img src={emp.image_url} className="w-full h-full object-cover" alt="" /> : <Users className="w-full h-full p-3 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{emp.name}</h4>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{emp.position}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-primary-blue font-bold uppercase">
                      <Building size={10} /> {warehouseOptions.find(o => o.id === emp.warehouse_id)?.name || 'Unknown'}
                    </div>
                  </div>
                  <button onClick={() => deleteItem(emp.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
              <h3 className="text-xl font-bold mb-6">Upload New Banner</h3>
              <form onSubmit={handleCreateBanner} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Banner Title (Optional)</label>
                  <input type="text" value={newBanner.title} onChange={(e) => setNewBanner({...newBanner, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Link URL (Optional)</label>
                  <input type="text" placeholder="https://..." value={newBanner.link_url} onChange={(e) => setNewBanner({...newBanner, link_url: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Banner Image (Wide recommended)</label>
                  <input type="file" onChange={(e) => setUploadImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary-blue hover:file:bg-blue-100" required disabled={loading} />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  Upload Banner
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6">Active Banners</h3>
              {banners.length === 0 && <p className="text-slate-400 italic">No banners uploaded yet.</p>}
              <div className="grid grid-cols-1 gap-4">
                {banners.map(banner => (
                  <div key={banner.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="aspect-[21/9] bg-slate-100 rounded-lg overflow-hidden mb-3">
                      <img src={banner.image_url} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="font-bold text-slate-800">{banner.title || 'Untitled Banner'}</div>
                        <button onClick={() => deleteItem(banner.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-6">Review Moderation</h3>
            {reviews.length === 0 && <p className="text-slate-400 italic">No reviews found.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-fit">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-left">
                      <div className="font-bold text-slate-800 text-lg">{review.reviewer_name}</div>
                      <div className="text-xs font-bold text-[#004A99] uppercase">
                        {warehouseOptions.find(w => w.id === review.warehouse_id)?.name || review.warehouse_id}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete malicious review"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                  
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 italic text-left">
                    "{review.comment}"
                  </p>
                  
                  <div className="text-[0.7rem] font-bold text-slate-300 uppercase mt-auto text-left">
                    Submitted: {new Date(review.created_at).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-6">General Site Settings</h3>
              <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* Branding Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary-blue border-b pb-2 text-left">Website Branding</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Navbar Name</label>
                        <input type="text" value={siteSettings.site_name} onChange={(e) => setSiteSettings({...siteSettings, site_name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Browser Tab Title</label>
                        <input type="text" value={siteSettings.site_title} onChange={(e) => setSiteSettings({...siteSettings, site_title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" />
                      </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Company Name (Popups Footer)</label>
                    <input type="text" value={siteSettings.company_name} onChange={(e) => setSiteSettings({...siteSettings, company_name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1 text-left">Website Icon (Favicon)</label>
                    <div className="flex items-center gap-4">
                        {siteSettings.site_icon && (
                            <div className="w-10 h-10 bg-slate-100 rounded p-1 border">
                                <img src={siteSettings.site_icon} className="w-full h-full object-contain" alt="icon" />
                            </div>
                        )}
                        <input type="file" onChange={handleUploadIcon} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary-blue hover:file:bg-blue-100" />
                    </div>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary-blue border-b pb-2 text-left">Hero Section</h4>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                    <input type="text" value={siteSettings.hero_title} onChange={(e) => setSiteSettings({...siteSettings, hero_title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
                    <textarea value={siteSettings.hero_description} onChange={(e) => setSiteSettings({...siteSettings, hero_description: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-24"></textarea>
                  </div>
                </div>

                {/* Overview Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary-blue border-b pb-2 text-left">Logistics Overview</h4>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                    <input type="text" value={siteSettings.overview_title} onChange={(e) => setSiteSettings({...siteSettings, overview_title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
                    <textarea value={siteSettings.overview_description} onChange={(e) => setSiteSettings({...siteSettings, overview_description: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-20"></textarea>
                  </div>
                </div>

                {/* News Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary-blue border-b pb-2 text-left">News & Articles</h4>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                    <input type="text" value={siteSettings.news_title} onChange={(e) => setSiteSettings({...siteSettings, news_title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
                    <textarea value={siteSettings.news_description} onChange={(e) => setSiteSettings({...siteSettings, news_description: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-20"></textarea>
                  </div>
                </div>

                {/* Monitoring Section */}
                <div className="space-y-4 text-left">
                  <h4 className="font-bold text-primary-blue border-b pb-2 text-left text-left">Warehouse Monitoring Grid</h4>
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                    <input type="text" value={siteSettings.monitoring_title} onChange={(e) => setSiteSettings({...siteSettings, monitoring_title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue" />
                  </div>
                  <div className="text-left">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
                    <textarea value={siteSettings.monitoring_description} onChange={(e) => setSiteSettings({...siteSettings, monitoring_description: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary-blue h-20"></textarea>
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Save All Settings
                </button>
              </form>

              {/* Password Change Section */}
              <div className="mt-16 pt-10 border-t border-slate-100">
                <h3 className="text-xl font-bold mb-6 text-red-600 flex items-center gap-2">
                    <Lock size={20} /> Security & Password
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1 text-left">Current Password</label>
                            <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-red-500 text-left" required />
                        </div>
                        <div></div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1 text-left">New Password</label>
                            <input type="password" value={passwords.next} onChange={(e) => setPasswords({...passwords, next: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-red-500 text-left" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1 text-left">Confirm New Password</label>
                            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-red-500 text-left" required />
                        </div>
                    </div>
                    <button type="submit" className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                        Update Password
                    </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
