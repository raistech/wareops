'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Database, Clock, Building2, Truck, CheckCircle2, Timer, ExternalLink, Newspaper, X, Layers, TrendingUp, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [warehouseStats, setWarehouseStats] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [siteSettings, setSiteSettings] = useState({
    site_title: 'CP Prima | Monitoring Warehouse',
    site_name: 'Warehouse Ops',
    site_icon: '',
    hero_title: 'Logistics Control Center',
    hero_description: 'Real-time logistics flow monitoring and warehouse operational efficiency PT. Central Proteina Prima.',
    overview_title: 'Logistics Overview',
    overview_description: 'Comprehensive summary of all warehouse operations.',
    news_title: 'Latest News & Articles',
    news_description: 'Stay updated with our latest logistics insights and company news.'
  });
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

    // Fetch site settings
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            setSiteSettings(prev => ({ ...prev, ...data }));
            if (data.site_title) document.title = data.site_title;
            if (data.site_icon) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = data.site_icon;
            }
        }
      })
      .catch(err => console.error('Settings fetch error:', err));

    // Fetch blogs
    fetch('/api/admin/blogs')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setBlogs(data.slice(0, 3));
      })
      .catch(err => console.error('Blogs fetch error:', err));

    // Fetch employees
    fetch('/api/admin/employees')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setEmployees(data);
      })
      .catch(err => console.error('Employees fetch error:', err));

    // Fetch banners
    fetch('/api/admin/banners')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setBanners(data);
        })
        .catch(err => console.error('Banners fetch error:', err));

    const parseNum = (str) => {
        if (!str) return 0;
        return parseFloat(str.toString().replace(/,/g, '')) || 0;
    };

    const calculateSummary = (data) => {
      if (!data) return;
      let queues = 0;
      let finishedLoading = 0;
      let finishedUnloading = 0;
      let active = 0;
      let processTime = 0;
      let count = 0;
      let capacity = 0;
      let actual = 0;

      Object.values(data).forEach(w => {
        if (!w) return;
        const stats = w.stats || {};
        if (w.status === 'online') active++;
        queues += (stats.muat_waiting || 0) + (stats.bongkar_waiting || 0);
        
        finishedLoading += (w.lifetime?.loading || 0);
        finishedUnloading += (w.lifetime?.unloading || 0);
        
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
      if (!data || !data.id) return;
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
      if (!data || !data.id) return;
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
      if (!data) return;
      setWarehouseStats(data);
      calculateSummary(data);
      setLastRefreshed(new Date());
    });

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data) {
            setWarehouseStats(data);
            calculateSummary(data);
        }
      })
      .catch(err => console.error('Stats fetch error:', err));

    return () => socket.close();
  }, []);

  // Banner Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const getOccupancyPercent = (occ) => {
    if (!occ) return 0;
    const match = occ.toString().match(/(\d+\.?\d*)%/);
    if (match) return Math.min(parseFloat(match[1]), 100);
    if (occ.toString().includes('/')) {
        const parts = occ.toString().split('/');
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
        <div className="flex items-center gap-2 text-[#004A99] font-extrabold text-2xl">
          {siteSettings.site_name.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'text-[#E30613]' : ''}>{word} </span>
          ))}
          {siteSettings.site_name.split(' ').length === 1 && <span>&nbsp;</span>}
        </div>
        <div className="hidden md:flex gap-8">
            <a href="#summary" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Summary</a>
            <a href="#monitoring" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Live Monitor</a>
            <a href="#news" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">News</a>
            <a href="/admin" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Admin Panel</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-10 px-[5%] bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] text-center relative overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] bg-gradient-to-r from-[#004A99] to-[#E30613] bg-clip-text text-transparent">
          {siteSettings.hero_title}
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-[#64748b] mb-10 text-center">
          {siteSettings.hero_description}
        </p>
        <div className="flex justify-center gap-4">
            <a href="#monitoring" className="bg-[#004A99] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#003a7a] hover:-translate-y-0.5 transition-all inline-block no-underline shadow-lg">
                View Dashboard
            </a>
        </div>
      </section>

      {/* Banners Section */}
      {banners.length > 0 && (
          <section className="px-[5%] pb-24 bg-gradient-to-b from-[#f0f9ff] to-[#f1f5f9]">
              <div className="max-w-[1400px] mx-auto relative group">
                  <div className="relative aspect-[21/9] md:aspect-[25/8] w-full overflow-hidden rounded-[40px] shadow-2xl border-4 border-white bg-white">
                      {/* Sliding Container */}
                      <div 
                        className="absolute inset-0 flex transition-transform duration-700 ease-in-out" 
                        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                      >
                          {banners.map((banner) => (
                              <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
                                  {banner.link_url ? (
                                      <a href={banner.link_url} target="_blank" className="block w-full h-full">
                                          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                                      </a>
                                  ) : (
                                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                                  )}
                                  {banner.title && (
                                      <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-left">
                                          <h2 className="text-3xl md:text-5xl font-black drop-shadow-lg">{banner.title}</h2>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Banner Controls */}
                  {banners.length > 1 && (
                      <>
                          <button 
                            onClick={() => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length)}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/30 hover:bg-white/50 backdrop-blur-xl rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"
                          >
                              <ChevronLeft size={32} />
                          </button>
                          <button 
                            onClick={() => setCurrentBanner(prev => (prev + 1) % banners.length)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/30 hover:bg-white/50 backdrop-blur-xl rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"
                          >
                              <ChevronRight size={32} />
                          </button>
                          
                          {/* Modern Dots */}
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                              {banners.map((_, idx) => (
                                  <button 
                                    key={idx} 
                                    onClick={() => setCurrentBanner(idx)}
                                    className={`h-2 rounded-full transition-all duration-500 ${idx === currentBanner ? 'bg-white w-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-white/40 w-2 hover:bg-white/60'}`}
                                  />
                              ))}
                          </div>
                      </>
                  )}
              </div>
          </section>
      )}

      {/* Monitoring Section */}
      <section id="monitoring" className="py-24 px-[5%] bg-[#f1f5f9] rounded-t-[50px] -mt-12 relative z-10">
        <div id="summary" className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div className="text-left">
                <h2 className="text-3xl font-bold m-0">{siteSettings.overview_title}</h2>
                <p className="text-[#64748b] mt-2 text-lg">{siteSettings.overview_description}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 font-bold text-[#E30613] text-sm uppercase tracking-wider">
                    <div className="w-2.5 h-2.5 bg-[#E30613] rounded-full animate-pulse shadow-[0_0_0_0_rgba(227,6,19,0.7)]"></div>
                    Live Update
                </div>
                <div className="text-[0.65rem] text-slate-400 font-bold uppercase">
                    Last sync: {lastRefreshed.toLocaleTimeString()}
                </div>
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
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm text-left">
                        <TrendingUp size={16} /> All Systems Normal
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Truck size={16} /> Total Activity
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                            <span className="block text-2xl font-black text-[#004A99]">{summary.totalFinishedLoading}</span>
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase">Finish Loading</span>
                        </div>
                        <div>
                            <span className="block text-2xl font-black text-[#E30613]">{summary.totalFinishedUnloading}</span>
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase">Finish Unload</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-left">
                        <span className="text-slate-600 font-bold">{summary.totalQueues} Units</span>
                        <span className="text-[0.65rem] text-slate-400 ml-2 uppercase tracking-tighter">In Current Queue</span>
                    </div>
                </div>

                <div className="space-y-6 text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Timer size={16} /> 30-Day Avg. Performance
                    </h3>
                    <div className="text-4xl font-black text-[#0f172a]">{summary.avgProcessTime} <span className="text-xl font-bold text-slate-400">Min</span></div>
                    <p className="text-xs text-slate-500 leading-relaxed">Average processing time for loading and unloading across all units in the last 30 days.</p>
                </div>

                <div className="space-y-6 text-left">
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
              if (!w) return null;
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
                      <span className="text-[0.7rem] font-bold text-[#64748b] uppercase tracking-tighter">Loading Queue</span>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl text-center bg-[#fffbeb] border border-[#fef3c7]">
                      <span className="block text-3xl font-black text-[#f59e0b] leading-none mb-1">{stats.bongkar_waiting || 0}</span>
                      <span className="text-[0.7rem] font-bold text-[#64748b] uppercase tracking-tighter">Unloading Queue</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100">
                      <span className="block font-bold text-xs text-[#004A99]">{Math.round(stats.avg_waiting || 0)}m</span>
                      <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter">Wait (30D)</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100">
                      <span className="block font-bold text-xs text-[#004A99]">{Math.round(stats.avg_loading || 0)}m</span>
                      <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter">Load (30D)</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100">
                      <span className="block font-bold text-xs text-[#004A99]">{Math.round(stats.avg_unloading || 0)}m</span>
                      <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter">Unld (30D)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-center p-2.5 bg-[#eff6ff] rounded-xl border border-blue-50">
                      <span className="block font-bold text-sm text-[#004A99]">{w.lifetime?.loading || 0}</span>
                      <span className="text-[0.6rem] text-[#64748b] font-bold uppercase tracking-tighter text-nowrap">Total Load Finish</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#fff1f2] rounded-xl border border-red-50">
                      <span className="block font-bold text-sm text-[#E30613]">{w.lifetime?.unloading || 0}</span>
                      <span className="text-[0.6rem] text-[#64748b] font-bold uppercase tracking-tighter text-nowrap">Total Unld Finish</span>
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

                  {/* Employee / Org Structure Preview */}
                  {Array.isArray(employees) && employees.filter(emp => emp.warehouse_id === id).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                        <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1 justify-start">
                            <Users size={12} /> Organizational Structure
                        </h4>
                        <div className="space-y-3">
                            {employees
                                .filter(emp => emp.warehouse_id === id)
                                .sort((a, b) => a.sort_order - b.sort_order)
                                .map(emp => (
                                    <div 
                                      key={emp.id} 
                                      onClick={() => setSelectedEmployee(emp)}
                                      className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/50 cursor-pointer hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group/emp"
                                    >
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0 group-hover/emp:border-primary-blue transition-colors">
                                            {emp.image_url ? (
                                                <img src={emp.image_url} alt={emp.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="w-full h-full p-3.5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <div className="text-[0.85rem] font-extrabold text-slate-800 truncate group-hover/emp:text-primary-blue transition-colors">{emp.name}</div>
                                            <div className="text-[0.7rem] font-bold text-primary-blue uppercase tracking-tight truncate opacity-80">{emp.position}</div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                  )}
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
              <h2 className="text-3xl font-bold text-[#0f172a] mb-2">{siteSettings.news_title}</h2>
              <p className="text-[#64748b] text-lg">{siteSettings.news_description}</p>
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
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
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

      {/* Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
            <div className="relative p-10 flex flex-col items-center text-center">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary-blue/20 p-1 mb-8">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                    {selectedEmployee.image_url ? (
                        <img src={selectedEmployee.image_url} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                    ) : (
                        <Users className="w-full h-full p-12 text-slate-300" />
                    )}
                </div>
              </div>

              <div className="text-[0.7rem] font-bold text-primary-blue uppercase tracking-[0.2em] mb-2">Staff Profile</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedEmployee.name}</h2>
              <p className="text-lg font-bold text-primary-red uppercase tracking-tight mb-8">{selectedEmployee.position}</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center gap-3">
                <Building2 size={20} className="text-slate-400" />
                <span className="font-bold text-slate-600 uppercase text-sm">
                    {Object.values(warehouseStats).find(w => w.name.toLowerCase().includes(selectedEmployee.warehouse_id.replace('gudang','').toLowerCase()))?.name || 'CP Prima Logistics'}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-primary-blue transition-all shadow-lg"
              >
                Close Profile
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
