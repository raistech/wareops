'use client';

import { Plus, Loader2, Trash2 } from 'lucide-react';

export const BannerManagement = ({ 
  newBanner, 
  setNewBanner, 
  handleCreateBanner, 
  uploadImage, 
  setUploadImage, 
  loading, 
  banners, 
  deleteItem 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm h-fit text-left">
        <h3 className="text-xl font-bold mb-6">Upload New Banner</h3>
        <form onSubmit={handleCreateBanner} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Banner Title (Optional)</label>
            <input 
              type="text" 
              value={newBanner.title} 
              onChange={(e) => setNewBanner({...newBanner, title: e.target.value})} 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              disabled={loading} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Link URL (Optional)</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={newBanner.link_url} 
              onChange={(e) => setNewBanner({...newBanner, link_url: e.target.value})} 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              disabled={loading} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Banner Image (Wide recommended)</label>
            <input 
              type="file" 
              onChange={(e) => setUploadImage(e.target.files[0])} 
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#004A99] hover:file:bg-blue-100" 
              required 
              disabled={loading} 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Upload Banner
          </button>
        </form>
      </div>

      <div className="space-y-4 text-left">
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
                <button 
                  onClick={() => deleteItem(banner.id)} 
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
