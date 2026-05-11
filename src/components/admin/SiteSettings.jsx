'use client';

import { Save, Loader2, Lock } from 'lucide-react';

export const SiteSettings = ({ 
  siteSettings, 
  setSiteSettings, 
  handleSaveSettings, 
  handleUploadIcon, 
  loading, 
  passwords, 
  setPasswords, 
  handleChangePassword, 
  showMessage 
}) => {
  return (
    <div className="max-w-3xl text-left">
      <div className="bg-white p-8 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold mb-6">General Site Settings</h3>
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Branding Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#004A99] border-b pb-2 text-left">Website Branding</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Navbar Name</label>
                <input 
                  type="text" 
                  value={siteSettings.site_name} 
                  onChange={(e) => setSiteSettings({...siteSettings, site_name: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Browser Tab Title</label>
                <input 
                  type="text" 
                  value={siteSettings.site_title} 
                  onChange={(e) => setSiteSettings({...siteSettings, site_title: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Company Name (Popups Footer)</label>
              <input 
                type="text" 
                value={siteSettings.company_name} 
                onChange={(e) => setSiteSettings({...siteSettings, company_name: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1 text-left">Website Icon (Favicon)</label>
              <div className="flex items-center gap-4">
                {siteSettings.site_icon && (
                  <div className="w-10 h-10 bg-slate-100 rounded p-1 border">
                    <img src={siteSettings.site_icon} className="w-full h-full object-contain" alt="icon" />
                  </div>
                )}
                <input 
                  type="file" 
                  onChange={handleUploadIcon} 
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#004A99] hover:file:bg-blue-100" 
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#004A99] border-b pb-2 text-left">Hero Section</h4>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
              <input 
                type="text" 
                value={siteSettings.hero_title} 
                onChange={(e) => setSiteSettings({...siteSettings, hero_title: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
              <textarea 
                value={siteSettings.hero_description} 
                onChange={(e) => setSiteSettings({...siteSettings, hero_description: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99] h-24"
              ></textarea>
            </div>
          </div>

          {/* Overview Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#004A99] border-b pb-2 text-left">Logistics Overview</h4>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
              <input 
                type="text" 
                value={siteSettings.overview_title} 
                onChange={(e) => setSiteSettings({...siteSettings, overview_title: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
              <textarea 
                value={siteSettings.overview_description} 
                onChange={(e) => setSiteSettings({...siteSettings, overview_description: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99] h-20"
              ></textarea>
            </div>
          </div>

          {/* News Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#004A99] border-b pb-2 text-left">News & Articles</h4>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
              <input 
                type="text" 
                value={siteSettings.news_title} 
                onChange={(e) => setSiteSettings({...siteSettings, news_title: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
              <textarea 
                value={siteSettings.news_description} 
                onChange={(e) => setSiteSettings({...siteSettings, news_description: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99] h-20"
              ></textarea>
            </div>
          </div>

          {/* Monitoring Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#004A99] border-b pb-2 text-left">Warehouse Monitoring Grid</h4>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
              <input 
                type="text" 
                value={siteSettings.monitoring_title} 
                onChange={(e) => setSiteSettings({...siteSettings, monitoring_title: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
              <textarea 
                value={siteSettings.monitoring_description} 
                onChange={(e) => setSiteSettings({...siteSettings, monitoring_description: e.target.value})} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99] h-20"
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

        {/* Password Change Section */}
        <div className="mt-16 pt-10 border-t border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-red-600 flex items-center gap-2">
            <Lock size={20} /> Security & Password
          </h3>
          <form 
            onSubmit={(e) => handleChangePassword(e, showMessage)} 
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1 text-left">Current Password</label>
                <input 
                  type="password" 
                  value={passwords.current} 
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-red-500 text-left" 
                  required 
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1 text-left">New Password</label>
                <input 
                  type="password" 
                  value={passwords.next} 
                  onChange={(e) => setPasswords({...passwords, next: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-red-500 text-left" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1 text-left">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwords.confirm} 
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-red-500 text-left" 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
