'use client';

import { Newspaper, Image as ImageIcon, Users, Star, Settings, LogOut, X } from 'lucide-react';

export const AdminSidebar = ({ activeTab, setActiveTab, handleLogout, isOpen, setIsOpen }) => {
  const tabs = [
    { id: 'blogs', label: 'Articles', icon: Newspaper },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-6 flex-shrink-0 flex flex-col h-screen z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-xl font-black text-[#E30613]">CP PRIMA ADMIN</h1>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-[#004A99]' : 'hover:bg-slate-800'}`}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors font-bold"
        >
          <LogOut size={20} /> Log Out
        </button>
      </div>
    </>
  );
};
