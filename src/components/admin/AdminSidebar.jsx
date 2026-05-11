'use client';

import { Newspaper, Image as ImageIcon, Users, Star, Settings, LogOut } from 'lucide-react';

export const AdminSidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <div className="w-64 bg-slate-900 text-white p-6 flex-shrink-0 flex flex-col h-screen sticky top-0">
      <h1 className="text-xl font-black mb-10 text-[#E30613]">CP PRIMA ADMIN</h1>
      <nav className="space-y-2 flex-1">
        <button 
          onClick={() => setActiveTab('blogs')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'blogs' ? 'bg-[#004A99]' : 'hover:bg-slate-800'}`}
        >
          <Newspaper size={20} /> Articles
        </button>
        <button 
          onClick={() => setActiveTab('banners')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'banners' ? 'bg-[#004A99]' : 'hover:bg-slate-800'}`}
        >
          <ImageIcon size={20} /> Banners
        </button>
        <button 
          onClick={() => setActiveTab('employees')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'employees' ? 'bg-[#004A99]' : 'hover:bg-slate-800'}`}
        >
          <Users size={20} /> Employees
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'reviews' ? 'bg-[#004A99]' : 'hover:bg-slate-800'}`}
        >
          <Star size={20} /> Reviews
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-[#004A99]' : 'hover:bg-slate-800'}`}
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
  );
};
