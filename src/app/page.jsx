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
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
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
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-[#e2e8f0] px-[5%] py-4 flex justify-between items-center text-left">
        <div className="flex items-center gap-2 text-[#004A99] font-extrabold text-2xl">
          {siteSettings.site_name.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'text-[#E30613]' : ''}>{word} </span>
          ))}
          {siteSettings.site_name.split(' ').length === 1 && <span>&nbsp;</span>}
        </div>
        <div className="hidden md:flex gap-8">
            <a href="#summary" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Summary</a>
            <a href="#news" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">News</a>
            <a href="#monitoring" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Monitoring</a>
            <a href="/admin" className="text-[#0f172a] font-medium no-underline hover:text-[#004A99] transition-colors">Admin Panel</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-10 px-[5%] bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] text-center relative overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] bg-gradient-to-r from-[#004A99] to-[#E30613] bg-clip-text text-transparent">
          {siteSettings.hero_title}
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-[#64748b] mb-10 text-center text-left">
          {siteSettings.hero_description}
        </p>
        <div className="flex justify-center gap-4 text-left">
            <a href="#summary" className="bg-[#004A99] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#003a7a] hover:-translate-y-0.5 transition-all inline-block no-underline shadow-lg text-left">
                Get Started
            </a>
        </div>
      </section>

      {/* Banners Section */}
      {banners.length > 0 && (
          <section className="px-[5%] pb-24 bg-gradient-to-b from-[#f0f9ff] to-[#f1f5f9]">
              <div className="max-w-[1400px] mx-auto relative group text-left">
                  <div className="relative aspect-[21/9] md:aspect-[25/8] w-full overflow-hidden rounded-[40px] shadow-2xl border-4 border-white bg-white text-left">
                      {/* Sliding Container */}
                      <div 
                        className="absolute inset-0 flex transition-transform duration-700 ease-in-out text-left" 
                        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                      >
                          {banners.map((banner) => (
                              <div 
                                key={banner.id} 
                                onClick={() => setSelectedBanner(banner)}
                                className="w-full h-full flex-shrink-0 relative cursor-pointer text-left"
                              >
                                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover text-left" />
                                  {banner.title && (
                                      <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-left text-left text-left text-left">
                                          <h2 className="text-3xl md:text-5xl font-black drop-shadow-lg text-left text-left">{banner.title}</h2>
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
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/30 hover:bg-white/50 backdrop-blur-xl rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 text-left"
                          >
                              <ChevronLeft size={32} className="text-left" />
                          </button>
                          <button 
                            onClick={() => setCurrentBanner(prev => (prev + 1) % banners.length)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/30 hover:bg-white/50 backdrop-blur-xl rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 text-left"
                          >
                              <ChevronRight size={32} className="text-left" />
                          </button>
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 text-left text-left text-left">
                              {banners.map((_, idx) => (
                                  <button 
                                    key={idx} 
                                    onClick={() => setCurrentBanner(idx)}
                                    className={`h-2 rounded-full transition-all duration-500 ${idx === currentBanner ? 'bg-white w-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-white/40 w-2 hover:bg-white/60'} text-left`}
                                  />
                              ))}
                          </div>
                      </>
                  )}
              </div>
          </section>
      )}

      {/* Global Summary Section */}
      <section id="summary" className="py-24 px-[5%] bg-[#f1f5f9] rounded-t-[50px] -mt-12 relative z-10 text-left">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 text-left text-left text-left text-left">
            <div className="text-left text-left">
                <h2 className="text-3xl font-bold m-0 text-left">{siteSettings.overview_title}</h2>
                <p className="text-[#64748b] mt-2 text-lg text-left">{siteSettings.overview_description}</p>
            </div>
            <div className="flex flex-col items-end gap-1 text-left text-left text-left text-left">
                <div className="flex items-center gap-2 font-bold text-[#E30613] text-sm uppercase tracking-wider text-left text-left">
                    <div className="w-2.5 h-2.5 bg-[#E30613] rounded-full animate-pulse shadow-[0_0_0_0_rgba(227,6,19,0.7)] text-left text-left"></div>
                    Live Update
                </div>
                <div className="text-[0.65rem] text-slate-400 font-bold uppercase text-right text-left text-left">
                    Last sync: {lastRefreshed.toLocaleTimeString()}
                </div>
            </div>
        </div>

        {/* Global Summary Card */}
        <div className="max-w-[1400px] mx-auto bg-white rounded-[32px] p-8 shadow-sm border border-[#e2e8f0] mb-12 overflow-hidden relative text-left">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-left text-left text-left">
                <Layers size={120} className="text-left text-left" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-left text-left text-left text-left text-left text-left text-left">
                <div className="space-y-6 text-left text-left text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 text-left">
                        <Building2 size={16} className="text-left" /> Operational Status
                    </h3>
                    <div className="flex items-end gap-3 text-left text-left text-left">
                        <span className="text-5xl font-black text-[#0f172a] text-left text-left">{summary.activeWarehouses}</span>
                        <span className="text-slate-400 font-bold mb-1 text-left">/ {Object.keys(warehouseStats).length} Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm text-left">
                        <TrendingUp size={16} className="text-left" /> All Systems Normal
                    </div>
                </div>
                
                <div className="space-y-6 text-left text-left text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 text-left text-left">
                        <Truck size={16} className="text-left text-left" /> Total Activity
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-left text-left text-left">
                        <div className="text-left text-left">
                            <span className="block text-2xl font-black text-[#004A99] text-left text-left">{summary.totalFinishedLoading}</span>
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase text-nowrap text-left">Finish Loading</span>
                        </div>
                        <div className="text-left text-left text-left">
                            <span className="block text-2xl font-black text-[#E30613] text-left text-left">{summary.totalFinishedUnloading}</span>
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase text-nowrap text-left text-left">Finish Unload</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-left text-left text-left text-left text-left">
                        <span className="text-slate-600 font-bold text-left text-left">{summary.totalQueues} Units</span>
                        <span className="text-[0.65rem] text-slate-400 ml-2 uppercase tracking-tighter text-left text-left text-left">In Current Queue</span>
                    </div>
                </div>

                <div className="space-y-6 text-left text-left text-left text-left text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 text-left text-left">
                        <Timer size={16} className="text-left text-left text-left" /> 30-Day Avg. Performance
                    </h3>
                    <div className="text-4xl font-black text-[#0f172a] text-left text-left text-left">{summary.avgProcessTime} <span className="text-xl font-bold text-slate-400 text-left">Min</span></div>
                    <p className="text-xs text-slate-500 leading-relaxed text-left text-left text-left">Average processing time for loading and unloading across all units in the last 30 days.</p>
                </div>

                <div className="space-y-6 text-left text-left text-left text-left text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 text-left text-left text-left">
                        <Database size={16} className="text-left text-left text-left" /> Global Occupancy
                    </h3>
                    <div className="flex justify-between items-end text-left text-left text-left text-left">
                        <span className="text-4xl font-black text-[#004A99] text-left text-left">{summary.totalOccupancy}%</span>
                        <div className="text-right text-left text-left">
                            <span className="block text-[0.7rem] font-bold text-slate-500 text-left text-left">{formatKg(summary.totalActual)} Actual</span>
                            <span className="block text-[0.7rem] font-bold text-slate-400 text-nowrap text-nowrap text-left text-left">of {formatKg(summary.totalCapacity)}</span>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden text-left text-left text-left text-left">
                        <div className="h-full bg-gradient-to-r from-[#004A99] to-[#E30613] transition-all duration-1000 text-left" style={{ width: `${summary.totalOccupancy}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-24 px-[5%] bg-white relative z-10 border-y border-slate-100 text-left">
        <div className="max-w-[1400px] mx-auto text-left text-left text-left">
          <div className="flex justify-between items-end mb-10 text-left text-left text-left">
            <div className="text-left text-left">
              <h2 className="text-3xl font-bold text-[#0f172a] mb-2 text-left text-left">{siteSettings.news_title}</h2>
              <p className="text-[#64748b] text-lg text-left text-left">{siteSettings.news_description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-left text-left text-left">
            {blogs.length === 0 ? (
              <p className="text-slate-400 italic col-span-3 text-center py-10 text-left text-left text-left">No articles published yet.</p>
            ) : (
              blogs.map(blog => (
                <div key={blog.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full text-left text-left text-left">
                  <div className="aspect-video bg-slate-100 relative overflow-hidden text-left text-left text-left">
                    {blog.image_url ? (
                      <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 text-left text-left" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-left text-left">
                        <Newspaper size={48} className="text-left text-left text-left" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1 text-left text-left text-left">
                    <div className="text-[0.7rem] font-bold text-[#E30613] uppercase mb-2 text-left text-left text-left text-left text-left">
                      {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-[#004A99] transition-colors text-left text-left text-left text-left">
                      {blog.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 text-left text-left text-left text-left text-left">
                      {blog.content}
                    </p>
                    <button 
                      onClick={() => setSelectedBlog(blog)}
                      className="text-[#004A99] font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform cursor-pointer text-left text-left text-left"
                    >
                      Read More <ExternalLink size={14} className="text-left text-left text-left" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Monitoring Section Header */}
      <section id="monitoring" className="pt-24 px-[5%] bg-[#f8fafc] text-left text-left text-left text-left">
        <div className="max-w-[1400px] mx-auto mb-10 text-left text-left text-left text-left text-left">
            <h2 className="text-3xl font-bold m-0 text-left text-left text-left">{siteSettings.monitoring_title}</h2>
            <p className="text-[#64748b] mt-2 text-lg text-left text-left text-left">{siteSettings.monitoring_description}</p>
        </div>

        {/* Warehouse Grid */}
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 text-left text-left text-left">
            {Object.entries(warehouseStats).map(([id, w]) => {
              if (!w) return null;
              const stats = w.stats || {};
              const isOnline = w.status === 'online';
              const occPercent = getOccupancyPercent(w.occupancy);
              
              return (
                <div key={id} className="bg-white rounded-[20px] p-6 shadow-sm border border-[#f1f5f9] hover:-translate-y-1.5 hover:shadow-xl transition-all flex flex-col text-left text-left text-left text-left">
                  <div className="flex justify-between items-center mb-5 text-left text-left text-left text-left">
                    <div className="flex items-center text-left text-left text-left text-left">
                      <h2 className="text-lg font-bold m-0 text-left text-left text-left">{w.name}</h2>
                      {isOnline && stats.avg_waiting < 10 && (
                        <span className="ml-2 text-[0.65rem] font-extrabold px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-100 uppercase text-left text-left">Optimal</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[0.7rem] font-bold px-2.5 py-1 rounded-full uppercase ${
                      isOnline ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'
                    } text-left text-left text-left`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#10b981]' : 'bg-[#ef4444]'} text-left text-left`}></span>
                      {w.status}
                    </div>
                  </div>

                  <div className="flex gap-3 mb-5 text-left text-left text-left text-left">
                    <div className="flex-1 p-4 rounded-2xl text-center bg-[#eff6ff] border border-[#dbeafe] text-left text-left">
                      <span className="block text-3xl font-black text-[#3b82f6] leading-none mb-1 text-left text-left">{stats.muat_waiting || 0}</span>
                      <span className="text-[0.7rem] font-bold text-[#64748b] uppercase tracking-tighter text-left text-left">Loading Queue</span>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl text-center bg-[#fffbeb] border border-[#fef3c7] text-left text-left">
                      <span className="block text-3xl font-black text-[#f59e0b] leading-none mb-1 text-left text-left">{stats.bongkar_waiting || 0}</span>
                      <span className="text-[0.7rem] font-bold text-[#64748b] uppercase tracking-tighter text-left text-left">Unloading Queue</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-left text-left text-left text-left text-left">
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100 text-left text-left">
                      <span className="block font-bold text-xs text-[#004A99] text-left text-left">{Math.round(stats.avg_waiting || 0)}m</span>
                      <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter text-left text-left">Wait (30D)</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100 text-left text-left">
                      <span className="block font-bold text-xs text-[#004A99] text-left text-left">{Math.round(stats.avg_loading || 0)}m</span>
                      <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter text-left text-left">Load (30D)</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100 text-left text-left">
                      <span className="block font-bold text-xs text-[#004A99] text-left text-left">{Math.round(stats.avg_unloading || 0)}m</span>
                      <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter text-left text-left">Unld (30D)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-left text-left text-left text-left">
                    <div className="text-center p-2.5 bg-[#eff6ff] rounded-xl border border-blue-50 text-left text-left text-left">
                      <span className="block font-bold text-sm text-[#004A99] text-left text-left text-left">{w.lifetime?.loading || 0}</span>
                      <span className="text-[0.6rem] text-[#64748b] font-bold uppercase tracking-tighter text-nowrap text-left text-left text-left text-left text-left">Total Load Finish</span>
                    </div>
                    <div className="text-center p-2.5 bg-[#fff1f2] rounded-xl border border-red-50 text-left text-left text-left text-left">
                      <span className="block font-bold text-sm text-[#E30613] text-left text-left text-left">{w.lifetime?.unloading || 0}</span>
                      <span className="text-[0.6rem] text-[#64748b] font-bold uppercase tracking-tighter text-nowrap text-left text-left text-left text-left text-left text-left text-left">Total Unld Finish</span>
                    </div>
                  </div>

                  <div className="bg-[#f1f5f9] p-4 rounded-xl mb-6 text-left text-left text-left text-left">
                    <div className="flex justify-between items-center mb-2 text-left text-left text-left text-left">
                        <span className="text-[0.7rem] font-bold uppercase text-left text-left">Occupancy</span>
                        <span className="text-[0.75rem] font-extrabold text-[#004A99] text-left text-left">{w.occupancy || '0%'}</span>
                    </div>
                    <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mb-2 text-left text-left text-left text-left">
                        <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] transition-all duration-500 text-left text-left text-left" style={{ width: `${occPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[0.65rem] text-slate-500 font-medium text-left text-left text-left text-left text-left">
                        <span className="text-left text-left">Act: {w.actual || '0'}</span>
                        <span className="text-left text-left text-left">Cap: {w.capacity || '0'}</span>
                    </div>
                  </div>

                  <a href={w.url} target="_blank" className="mt-auto flex items-center justify-center w-full p-3.5 bg-[#0f172a] text-white no-underline rounded-xl font-bold text-sm hover:bg-[#004A99] transition-all text-left text-left">
                    Visit Queue <ExternalLink size={14} className="ml-2 text-left text-left text-left" />
                  </a>
                  
                  <div className="mt-2.5 text-[0.65rem] text-[#64748b] flex items-center gap-1 text-left text-left text-left">
                    <Clock size={12} className="text-left text-left text-left" /> Active: {w.last_update ? new Date(w.last_update).toLocaleTimeString() : 'N/A'}
                  </div>

                  {/* Employee / Org Structure Preview */}
                  {Array.isArray(employees) && employees.filter(emp => emp.warehouse_id === id).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 text-left text-left text-left text-left">
                        <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1 justify-start text-left text-left text-left">
                            <Users size={12} className="text-left text-left text-left" /> Organizational Structure
                        </h4>
                        <div className="space-y-3 text-left text-left text-left text-left">
                            {employees
                                .filter(emp => emp.warehouse_id === id)
                                .sort((a, b) => a.sort_order - b.sort_order)
                                .map(emp => (
                                    <div 
                                      key={emp.id} 
                                      onClick={() => setSelectedEmployee(emp)}
                                      className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/50 cursor-pointer hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group/emp text-left text-left"
                                    >
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0 group-hover/emp:border-primary-blue transition-colors text-left text-left text-left">
                                            {emp.image_url ? (
                                                <img src={emp.image_url} alt={emp.name} className="w-full h-full object-cover text-left text-left text-left" />
                                            ) : (
                                                <Users className="w-full h-full p-3.5 text-slate-400 text-left text-left text-left" />
                                            )}
                                        </div>
                                        <div className="min-w-0 text-left text-left text-left text-left text-left text-left">
                                            <div className="text-[0.85rem] font-extrabold text-slate-800 truncate group-hover/emp:text-primary-blue transition-colors text-left text-left text-left text-left">{emp.name}</div>
                                            <div className="text-[0.7rem] font-bold text-primary-blue uppercase tracking-tight truncate opacity-80 text-left text-left text-left text-left text-left">{emp.position}</div>
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

      {/* Article Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-left text-left text-left">
          <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-left text-left text-left">
            {/* Modal Header */}
            <div className="relative h-64 md:h-80 flex-shrink-0 text-left text-left text-left text-left text-left">
              {selectedBlog.image_url ? (
                <img src={selectedBlog.image_url} alt={selectedBlog.title} className="w-full h-full object-cover text-left text-left text-left text-left" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-left text-left text-left">
                  <Newspaper size={80} className="text-left text-left text-left text-left text-left text-left" />
                </div>
              )}
              <button 
                onClick={() => setSelectedBlog(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors text-left text-left text-left text-left"
              >
                <X size={24} className="text-left text-left text-left text-left text-left" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 md:p-12 overflow-y-auto text-left text-left text-left text-left text-left text-left text-left">
              <div className="text-sm font-bold text-[#E30613] uppercase mb-4 tracking-widest text-left text-left text-left">
                {new Date(selectedBlog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-8 leading-tight text-left text-left text-left">
                {selectedBlog.title}
              </h2>
              <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap text-left text-left text-left text-left text-left">
                {selectedBlog.content}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end text-left text-left text-left text-left">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="px-8 py-3 bg-[#0f172a] text-white rounded-full font-bold hover:bg-[#004A99] transition-all text-left text-left text-left text-left"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md text-left text-left text-left text-left">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300 text-left text-left text-left text-left text-left">
            <div className="relative p-10 flex flex-col items-center text-center text-left text-left text-left text-left text-left">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors text-left text-left text-left text-left text-left"
              >
                <X size={20} className="text-left text-left text-left text-left text-left text-left" />
              </button>
              
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary-blue/20 p-1 mb-8 text-left text-left text-left text-left">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 text-left text-left text-left text-left">
                    {selectedEmployee.image_url ? (
                        <img src={selectedEmployee.image_url} alt={selectedEmployee.name} className="w-full h-full object-cover text-left text-left text-left text-left" />
                    ) : (
                        <Users className="w-full h-full p-12 text-slate-300 text-left text-left text-left text-left" />
                    )}
                </div>
              </div>

              <div className="text-[0.7rem] font-bold text-primary-blue uppercase tracking-[0.2em] mb-2 text-left text-left text-left text-left">Staff Profile</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 text-left text-left text-left text-left text-left text-left">{selectedEmployee.name}</h2>
              <p className="text-lg font-bold text-primary-red uppercase tracking-tight mb-8 text-left text-left text-left text-left text-left text-left text-left text-left">{selectedEmployee.position}</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center gap-3 text-left text-left text-left text-left">
                <Building2 size={20} className="text-slate-400 text-left text-left text-left text-left" />
                <span className="font-bold text-slate-600 uppercase text-sm text-left text-left text-left text-left text-left">
                    {Object.values(warehouseStats).find(w => w.name.toLowerCase().includes(selectedEmployee.warehouse_id.replace('gudang','').toLowerCase()))?.name || siteSettings.company_name}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 text-left text-left text-left text-left text-left">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-primary-blue transition-all shadow-lg text-left text-left text-left text-left text-left text-left"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {selectedBanner && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-left text-left text-left text-left text-left">
          <div className="bg-white rounded-[40px] w-full max-w-5xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300 text-left text-left text-left text-left text-left text-left text-left">
            <div className="relative aspect-[21/9] md:aspect-[25/8] bg-slate-100 text-left text-left text-left text-left">
              <img src={selectedBanner.image_url} alt="" className="w-full h-full object-cover text-left text-left text-left text-left text-left" />
              <button 
                onClick={() => setSelectedBanner(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors text-left text-left text-left text-left text-left text-left"
              >
                <X size={24} className="text-left text-left text-left text-left text-left text-left text-left" />
              </button>
            </div>
            
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-white text-left text-left text-left text-left">
              <div className="text-left flex-1 text-left text-left text-left text-left text-left text-left">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 text-left text-left text-left text-left text-left">{selectedBanner.title || 'Special Promotion'}</h2>
                <p className="text-slate-500 font-medium text-left text-left text-left text-left text-left text-left text-left">PT. Central Proteina Prima - Warehouse Information Center</p>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto text-left text-left text-left text-left">
                  {selectedBanner.link_url && (
                    <a 
                      href={selectedBanner.link_url} 
                      target="_blank"
                      className="flex-1 md:flex-none px-8 py-4 bg-primary-blue text-white rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center gap-2 text-left text-left text-left text-left"
                    >
                      Visit Link <ExternalLink size={20} className="text-left text-left text-left text-left text-left" />
                    </a>
                  )}
                  <button 
                    onClick={() => setSelectedBanner(null)}
                    className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center text-left text-left text-left text-left text-left"
                  >
                    Close
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white pt-16 pb-8 px-[5%] text-center text-left text-left text-left">
        <div className="text-2xl font-extrabold mb-5 text-left text-left text-left text-left">
            {siteSettings.site_name.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? 'text-[#E30613]' : ''}>{word} </span>
            ))}
        </div>
        <div className="mt-8 pt-8 border-t border-[#1e293b] text-[#64748b] text-[0.85rem] flex flex-col md:flex-row justify-center items-center gap-2 text-left text-left text-left text-left">
            <span className="text-left text-left text-left text-left">© {new Date().getFullYear()} PT Central Proteina Prima Tbk - Internal Warehouse Monitoring</span>
            <span className="hidden md:inline text-slate-700 text-left text-left text-left">•</span>
            <span className="text-left text-left text-left text-left">Developed with ❤️ by <a href="https://instagram.com/araiisen" target="_blank" className="text-[#E30613] no-underline font-bold text-left text-left text-left">arai</a></span>
        </div>
      </footer>
    </div>
  );
}
