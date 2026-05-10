'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Database, Clock, Building2, Truck, CheckCircle2, Timer, ExternalLink, Newspaper, X, Layers, TrendingUp } from 'lucide-react';

export default function Home() {
  const [warehouseStats, setWarehouseStats] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [summary, setSummary] = useState({
    activeWarehouses: 0,
    totalQueues: 0,
    totalFinishedLoading: 0,
    totalFinishedUnloading: 0,
    avgProcessTime: 0,
    totalCapacity: 0,
    totalActual: 0,
    totalOccupancy: 0
  });

  useEffect(() => {
    const socket = io();

    // Fetch blogs
    fetch('/api/admin/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data.slice(0, 3))); // Show latest 3

    const parseNum = (str) => {
        if (!str) return 0;
        return parseFloat(str.toString().replace(/,/g, '')) || 0;
    };

    const calculateSummary = (data) => {
      let queues = 0;
      let finishedLoading = 0;
      let finishedUnloading = 0;
      let active = 0;
      let processTime = 0;
      let count = 0;
      let capacity = 0;
      let actual = 0;

      Object.values(data).forEach(w => {
        const stats = w.stats || {};
        if (w.status === 'online') active++;
        queues += (stats.muat_waiting || 0) + (stats.bongkar_waiting || 0);
        finishedLoading += (stats.finished_muat_today || 0);
        finishedUnloading += (stats.finished_bongkar_today || 0);
        
        if (stats.avg_loading > 0) { processTime += stats.avg_loading; count++; }
        if (stats.avg_unloading > 0) { processTime += stats.avg_unloading; count++; }

        capacity += parseNum(w.capacity);
        actual += parseNum(w.actual);
      });

      setSummary({
        activeWarehouses: active,
        totalQueues: queues,
        totalFinishedLoading: finishedLoading,
        totalFinishedUnloading: finishedUnloading,
        avgProcessTime: count > 0 ? Math.round(processTime / count) : 0,
        totalCapacity: capacity,
        totalActual: actual,
        totalOccupancy: capacity > 0 ? Math.round((actual / capacity) * 100) : 0
      });
    };

    socket.on('stats_updated', (data) => {
      setWarehouseStats(prev => {
        const newState = {
          ...prev,
          [data.id]: {
            ...prev[data.id],
            ...data,
            last_update: new Date()
          }
        };
        calculateSummary(newState);
        return newState;
      });
    });

    socket.on('warehouse_status_changed', (data) => {
      setWarehouseStats(prev => {
        const newState = {
          ...prev,
          [data.id]: {
            ...prev[data.id],
            ...data,
            last_update: new Date()
          }
        };
        calculateSummary(newState);
        return newState;
      });
    });

    socket.on('occupancy_updated', (data) => {
      setWarehouseStats(data);
      calculateSummary(data);
    });

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setWarehouseStats(data);
        calculateSummary(data);
      });

    return () => socket.close();
  }, []);

  const getOccupancyPercent = (occ) => {
    if (!occ) return 0;
    const match = occ.match(/(\d+\.?\d*)%/);
    if (match) return Math.min(parseFloat(match[1]), 100);
    if (occ.includes('/')) {
        const parts = occ.split('/');
        const val = Math.round((parseFloat(parts[0]) / parseFloat(parts[1])) * 100);
        return isNaN(val) ? 0 : Math.min(val, 100);
    }
    return 0;
  };

  const formatKg = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M kg';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k kg';
      return num + ' kg';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#0f172a]">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-[#e2e8f0] px-[5%] py-4 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2 text-[#004A99] font-extrabold text-2xl no-underline">
          Warehouse <span className="text-[#E30613]">Ops</span>
        </a>
        <div className="hidden md:flex gap-8">
            <a href="#summary" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Summary</a>
            <a href="#monitoring" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Live Monitor</a>
            <a href="#news" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">News</a>
            <a href="/admin" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Admin Panel</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-[5%] bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] text-center relative overflow-hidden after:content-[''] after:absolute after:-bottom-[50px] after:left-0 after:right-0 after:h-[100px] after:bg-[#f8fafc] after:-skew-y-2">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] bg-gradient-to-r from-[#004A99] to-[#E30613] bg-clip-text text-transparent">
          Logistics Control Center
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-[#64748b] mb-10 text-center">
          Real-time logistics flow monitoring and warehouse operational efficiencyPT. Central Proteina Prima.
        </p>
        <div className="flex justify-center gap-4">
            <a href="#monitoring" className="bg-[#004A99] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#003a7a] hover:-translate-y-0.5 transition-all inline-block no-underline shadow-lg">
                View Dashboard
            </a>
        </div>
      </section>

      {/* Monitoring Section */}
      <section id="monitoring" className="py-24 px-[5%] bg-[#f1f5f9] rounded-t-[50px]">
        <div id="summary" className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
                <h2 className="text-3xl font-bold m-0">Logistics Overview</h2>
                <p className="text-[#64748b] mt-2 text-lg">Comprehensive summary of all warehouse operations.</p>
            </div>
            <div className="flex items-center gap-2 font-bold text-[#E30613] text-sm uppercase tracking-wider">
                <div className="w-2.5 h-2.5 bg-[#E30613] rounded-full animate-pulse shadow-[0_0_0_0_rgba(227,6,19,0.7)]"></div>
                Live Update
            </div>
        </div>

        {/* Global Summary Card */}
        <div className="max-w-[1400px] mx-auto bg-white rounded-[32px] p-8 shadow-sm border border-[#e2e8f0] mb-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Layers size={120} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Building2 size={16} /> Operational Status
                    </h3>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-black text-[#0f172a]">{summary.activeWarehouses}</span>
                        <span className="text-slate-400 font-bold mb-1">/ {Object.keys(warehouseStats).length} Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                        <TrendingUp size={16} /> All Systems Normal
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Truck size={16} /> Total Activity
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-2xl font-black text-[#004A99]">{summary.totalFinishedLoading}</span>
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase">Finish Loading</span>
                        </div>
                        <div>
                            <span className="block text-2xl font-black text-[#E30613]">{summary.totalFinishedUnloading}</span>
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase">Finish Unload</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-600 font-bold">{summary.totalQueues} Units</span>
                        <span className="text-[0.65rem] text-slate-400 ml-2 uppercase">In Current Queue</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Timer size={16} /> 30-Day Avg. Performance
                    </h3>
                    <div className="text-4xl font-black text-[#0f172a]">{summary.avgProcessTime} <span className="text-xl font-bold text-slate-400">Min</span></div>
                    <p className="text-xs text-slate-500 leading-relaxed">Average processing time for loading and unloading across all units in the last 30 days.</p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Database size={16} /> Global Occupancy
                    </h3>
                    <div className="flex justify-between items-end">
                        <span className="text-4xl font-black text-[#004A99]">{summary.totalOccupancy}%</span>
                        <div className="text-right">
                            <span className="block text-[0.7rem] font-bold text-slate-500">{formatKg(summary.totalActual)} Actual</span>
                            <span className="block text-[0.7rem] font-bold text-slate-400">of {formatKg(summary.totalCapacity)}</span>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#004A99] to-[#E30613] transition-all duration-1000" style={{ width: `${summary.totalOccupancy}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Warehouse Grid */}
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(warehouseStats).map(([id, w]) => {
              const stats = w.stats || {};
              const isOnline = w.status === 'online';
              const occPercent = getOccupancyPercent(w.occupancy);
              
              return (
                <div key={id} className="bg-white rounded-[20px] p-6 shadow-sm border border-[#f1f5f9] hover:-translate-y-1.5 hover:shadow-xl transition-all flex flex-col">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center">
                      <h2 className="text-lg font-bold m-0">{w.name}</h2>
                      {isOnline && stats.avg_waiting < 10 && (
                        <span className="ml-2 text-[0.65rem] font-extrabold px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-100 uppercase">Optimal</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[0.7rem] font-bold px-2.5 py-1 rounded-full uppercase ${
                      isOnline ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></span>
                      {w.status}
                    </div>
                  </div>

                  <div className="flex gap-3 mb-5">
                    <div className="flex-1 p-4 rounded-2xl text-center bg-[#eff6ff] border border-[#dbeafe]">
                      <span className="block text-3xl font-black text-[#3b82f6] leading-none mb-1">{stats.muat_waiting || 0}</span>
                      <span className="text-[0.7rem] font-bold text-[#64748b] uppercase">Loading Queue</span>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl text-center bg-[#fffbeb] border border-[#fef3c7]">
                      <span className="block text-3xl font-black text-[#f59e0b] leading-none mb-1">{stats.bongkar_waiting || 0}</span>
                      <span className="text-[0.7rem] font-bold text-[#64748b] uppercase">Unloading Queue</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl">
                      <span className="block font-bold text-sm text-[#004A99]">{Math.round(stats.avg_waiting || 0)}m</span>
                      <span className="text-[0.6rem] text-[#64748b] font-bold uppercase">Wait (30D)</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl">
                      <span className="block font-bold text-sm text-[#004A99]">{Math.round(stats.avg_loading || 0)}m</span>
                      <span className="text-[0.6rem] text-[#64748b] font-bold uppercase">Load (30D)</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl">
                      <span className="block font-bold text-sm text-[#004A99]">{Math.round(stats.avg_unloading || 0)}m</span>
                      <span className="text-[0.6rem] text-[#64748b] font-bold uppercase">Unld (30D)</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#ecfdf5] rounded-xl">
                      <span className="block font-bold text-sm text-[#059669]">{ (stats.finished_muat_today || 0) + (stats.finished_bongkar_today || 0) }</span>
                      <span className="text-[0.6rem] text-[#64748b] font-bold uppercase">Finish</span>
                    </div>
                  </div>

                  <div className="bg-[#f1f5f9] p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[0.7rem] font-bold uppercase">Occupancy</span>
                        <span className="text-[0.75rem] font-extrabold text-[#004A99]">{w.occupancy || '0%'}</span>
                    </div>
                    <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] transition-all duration-500" style={{ width: `${occPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[0.65rem] text-slate-500 font-medium">
                        <span>Act: {w.actual || '0'}</span>
                        <span>Cap: {w.capacity || '0'}</span>
                    </div>
                  </div>

                  <a href={w.url} target="_blank" className="mt-auto flex items-center justify-center w-full p-3.5 bg-[#0f172a] text-white no-underline rounded-xl font-bold text-sm hover:bg-[#004A99] transition-all">
                    Visit Queue <ExternalLink size={14} className="ml-2" />
                  </a>
                  
                  <div className="mt-2.5 text-[0.65rem] text-[#64748b] flex items-center gap-1">
                    <Clock size={12} /> Active: {w.last_update ? new Date(w.last_update).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-24 px-[5%] bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-10 text-left">
            <div>
              <h2 className="text-3xl font-bold text-[#0f172a] mb-2">Latest News & Articles</h2>
              <p className="text-[#64748b] text-lg">Stay updated with our latest logistics insights and company news.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
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
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-[0.7rem] font-bold text-[#E30613] uppercase mb-2">
                      {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-[#004A99] transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
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

      {/* Article Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="relative h-64 md:h-80 flex-shrink-0 text-left">
              {selectedBlog.image_url ? (
                <img src={selectedBlog.image_url} alt={selectedBlog.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <Newspaper size={80} />
                </div>
              )}
              <button 
                onClick={() => setSelectedBlog(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 md:p-12 overflow-y-auto text-left">
              <div className="text-sm font-bold text-[#E30613] uppercase mb-4 tracking-widest">
                {new Date(selectedBlog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-8 leading-tight">
                {selectedBlog.title}
              </h2>
              <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                {selectedBlog.content}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="px-8 py-3 bg-[#0f172a] text-white rounded-full font-bold hover:bg-[#004A99] transition-all"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white pt-16 pb-8 px-[5%] text-center">
        <div className="text-2xl font-extrabold mb-5">Warehouse <span className="text-[#E30613]">Operations</span></div>
        <p className="mb-2 text-slate-400">Developed with ❤️ by <a href="https://instagram.com/araiisen" target="_blank" className="text-[#E30613] no-underline font-bold">arai</a></p>
        <div className="mt-8 pt-8 border-t border-[#1e293b] text-[#64748b] text-[0.85rem]">
            &copy; {new Date().getFullYear()} PT Central Proteina Prima Tbk - Internal Logistics Dashboard
        </div>
      </footer>
    </div>
  );
}
