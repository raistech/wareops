import { Calendar, Loader2, Star, ExternalLink, Clock, Users, AlertTriangle } from 'lucide-react';
import { getOccupancyPercent } from '../utils/formatters';

export const WarehouseMonitoring = ({ 
  siteSettings, 
  warehouseStats, 
  unregisteredStats, 
  selectedDate, 
  setSelectedDate, 
  isFetchingHistory, 
  isHistorical, 
  employees, 
  setSelectedEmployee, 
  setSelectedWarehouseForReview, 
  setSelectedWarehouseForReport,
  fetchReviews,
  error,
  fetchCurrentStats
}) => {
  if (error) {
    return (
      <section className="py-20 px-[5%] bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center py-12 bg-red-50 rounded-[40px] border border-red-100 px-6">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-2xl font-black text-red-800 mb-3 uppercase">Gagal Memuat Data</h3>
          <p className="text-red-600 mb-8 font-medium max-w-lg mx-auto leading-relaxed">
            Maaf, terjadi kesalahan saat mengambil data dari server. Silakan periksa koneksi Anda atau coba lagi beberapa saat lagi.
          </p>
          <button 
            onClick={fetchCurrentStats}
            className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
          >
            Coba Lagi Sekarang
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="monitoring" className="pt-24 px-[5%] bg-[#f8fafc]">
      <div className="max-w-[1400px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h2 className="text-3xl font-bold m-0">{siteSettings.monitoring_title}</h2>
          <p className="text-[#64748b] mt-2 text-lg">{siteSettings.monitoring_description}</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2.5 pl-5 rounded-2xl shadow-sm border border-slate-200 min-w-[300px]">
          <div className="flex items-center gap-3 text-slate-400">
            <Calendar size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Filter Date</span>
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#C5A059] outline-none cursor-pointer"
          />
          {isFetchingHistory && (
            <div className="animate-spin text-[#C5A059] mr-2">
              <Loader2 size={20} />
            </div>
          )}
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {Object.entries(warehouseStats)
          .filter(([id, w]) => w)
          .map(([id, w]) => {
          const stats = w.stats || {};
          const isOnline = w.status === 'online';
          const occPercent = getOccupancyPercent(w.occupancy);
          
          // Logic for status label: Use Day if available (>0), otherwise fallback to 30D
          const effectiveLoading = stats.avg_loading_today > 0 ? stats.avg_loading_today : (stats.avg_loading_30d || 0);
          const effectiveUnloading = stats.avg_unloading_today > 0 ? stats.avg_unloading_today : (stats.avg_unloading_30d || 0);
          const avgCombined = (effectiveLoading + effectiveUnloading) / 2;

          return (
            <div key={id} className="bg-white rounded-[20px] p-6 shadow-sm border border-[#f1f5f9] hover:-translate-y-1.5 hover:shadow-xl transition-all flex flex-col text-left">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="text-lg font-bold m-0">{w.name}</h2>
                  {w.total_reviews > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg border border-yellow-100 text-[0.7rem] font-bold">
                      <Star size={12} className="fill-yellow-500 text-yellow-500" />
                      {w.avg_rating} <span className="text-yellow-400 opacity-60">({w.total_reviews})</span>
                    </div>
                  )}
                  {avgCombined > 0 && (
                    <>
                      {avgCombined <= 28 && (
                        <span className="text-[0.65rem] font-extrabold px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-100 uppercase">Optimal</span>
                      )}
                      {avgCombined > 28 && avgCombined <= 35 && (
                        <span className="text-[0.65rem] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 uppercase">Normal</span>
                      )}
                      {avgCombined > 35 && (
                        <span className="text-[0.65rem] font-extrabold px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-100 uppercase">Delayed</span>
                      )}
                    </>
                  )}
                  {w.active_reports > 0 && (
                    <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-lg border border-red-100 text-[0.65rem] font-black animate-pulse">
                      <AlertTriangle size={10} />
                      {w.active_reports} ISSUE{w.active_reports > 1 ? 'S' : ''}
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 text-[0.7rem] font-bold px-2.5 py-1 rounded-full uppercase ${
                  isOnline ? 'bg-[#dcfce7] text-[#166534]' : 
                  w.status === 'historical' ? 'bg-[#F5F5DC] text-[#0369a1]' : 'bg-[#fee2e2] text-[#991b1b]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-[#10b981]' : 
                    w.status === 'historical' ? 'bg-[#0ea5e9]' : 'bg-[#ef4444]'
                  }`}></span>
                  {w.status}
                </div>
              </div>
              <div className="flex gap-3 mb-5">
                <div className="flex-1 p-4 rounded-2xl text-center bg-[#FDF5E6] border border-[#F7E7CE]">
                  <div className="flex justify-around items-center mb-1">
                    <div>
                      <span className="block text-2xl font-black text-[#C5A059] leading-none mb-1">{stats.muat_waiting || 0}</span>
                      <span className="text-[0.6rem] font-bold text-[#64748b] uppercase tracking-tighter">Queue</span>
                    </div>
                    <div className="w-px h-8 bg-blue-100 mx-1"></div>
                    <div>
                      <span className="block text-2xl font-black text-[#C5A059] leading-none mb-1">{stats.muat_processing || 0}</span>
                      <span className="text-[0.6rem] font-bold text-[#64748b] uppercase tracking-tighter">Process</span>
                    </div>
                  </div>
                  <span className="block text-[0.7rem] font-bold text-[#64748b] uppercase tracking-tighter pt-1.5 border-t border-blue-100">
                    {isHistorical ? 'Remaining' : 'Loading'}
                  </span>
                </div>
                <div className="flex-1 p-4 rounded-2xl text-center bg-[#fffbeb] border border-[#fef3c7]">
                  <div className="flex justify-around items-center mb-1">
                    <div>
                      <span className="block text-2xl font-black text-[#f59e0b] leading-none mb-1">{stats.bongkar_waiting || 0}</span>
                      <span className="text-[0.6rem] font-bold text-[#64748b] uppercase tracking-tighter">Queue</span>
                    </div>
                    <div className="w-px h-8 bg-amber-100 mx-1"></div>
                    <div>
                      <span className="block text-2xl font-black text-[#f59e0b] leading-none mb-1">{stats.bongkar_processing || 0}</span>
                      <span className="text-[0.6rem] font-bold text-[#64748b] uppercase tracking-tighter">Process</span>
                    </div>
                  </div>
                  <span className="block text-[0.7rem] font-bold text-[#64748b] uppercase tracking-tighter pt-1.5 border-t border-amber-100">
                    {isHistorical ? 'Remaining' : 'Unloading'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100">
                  <div className="flex flex-col items-center">
                    <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter mb-1">Wait Time</span>
                    <div className="flex justify-around w-full">
                      <div className="flex flex-col items-center">
                        <span className="block font-black text-[10px] text-[#C5A059] leading-none">{Math.round(stats.avg_waiting_today || 0)}m</span>
                        <span className="text-[6px] text-slate-400 font-bold uppercase">Day</span>
                      </div>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <div className="flex flex-col items-center">
                        <span className="block font-black text-[10px] text-slate-500 leading-none">{Math.round(stats.avg_waiting_30d || 0)}m</span>
                        <span className="text-[6px] text-slate-400 font-bold uppercase">30D</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100">
                  <div className="flex flex-col items-center">
                    <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter mb-1">Load Time</span>
                    <div className="flex justify-around w-full">
                      <div className="flex flex-col items-center">
                        <span className="block font-black text-[10px] text-[#C5A059] leading-none">{Math.round(stats.avg_loading_today || 0)}m</span>
                        <span className="text-[6px] text-slate-400 font-bold uppercase">Day</span>
                      </div>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <div className="flex flex-col items-center">
                        <span className="block font-black text-[10px] text-slate-500 leading-none">{Math.round(stats.avg_loading_30d || 0)}m</span>
                        <span className="text-[6px] text-slate-400 font-bold uppercase">30D</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100">
                  <div className="flex flex-col items-center">
                    <span className="text-[0.55rem] text-[#64748b] font-bold uppercase tracking-tighter mb-1">Unld Time</span>
                    <div className="flex justify-around w-full">
                      <div className="flex flex-col items-center">
                        <span className="block font-black text-[10px] text-[#C5A059] leading-none">{Math.round(stats.avg_unloading_today || 0)}m</span>
                        <span className="text-[6px] text-slate-400 font-bold uppercase">Day</span>
                      </div>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <div className="flex flex-col items-center">
                        <span className="block font-black text-[10px] text-slate-500 leading-none">{Math.round(stats.avg_unloading_30d || 0)}m</span>
                        <span className="text-[6px] text-slate-400 font-bold uppercase">30D</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-left p-3.5 bg-[#FDF5E6] rounded-2xl border border-blue-50">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-2xl font-black text-[#C5A059]">{stats.finished_muat_today || 0}</span>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-tighter">Day</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-blue-100/50">
                    <span className="text-[0.6rem] font-bold text-slate-500 uppercase">Total Load</span>
                    <span className="text-[0.7rem] font-black text-[#C5A059]">{w.lifetime?.loading || 0}</span>
                  </div>
                </div>
                <div className="text-left p-3.5 bg-[#fff1f2] rounded-2xl border border-red-50">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-2xl font-black text-[#996515]">{stats.finished_bongkar_today || 0}</span>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-tighter">Day</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-red-100/50">
                    <span className="text-[0.6rem] font-bold text-slate-500 uppercase">Total Unld</span>
                    <span className="text-[0.7rem] font-black text-[#996515]">{w.lifetime?.unloading || 0}</span>
                  </div>
                </div>
              </div>

              {/* Tonnage Section */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-left p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-end mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-[#C5A059]">{stats.tonnage_muat_today ? stats.tonnage_muat_today.toFixed(1) : 0}</span>
                      <span className="text-[0.65rem] font-bold text-slate-400">Ton</span>
                    </div>
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">Day Out</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                    <span className="text-[0.55rem] font-bold text-slate-500 uppercase">Total Out</span>
                    <span className="text-[0.65rem] font-black text-[#C5A059]">{w.lifetime?.tonnage_loading ? w.lifetime.tonnage_loading.toFixed(1) : 0}</span>
                  </div>
                </div>
                <div className="text-left p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-end mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-[#996515]">{stats.tonnage_bongkar_today ? stats.tonnage_bongkar_today.toFixed(1) : 0}</span>
                      <span className="text-[0.65rem] font-bold text-slate-400">Ton</span>
                    </div>
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">Day In</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                    <span className="text-[0.55rem] font-bold text-slate-500 uppercase">Total In</span>
                    <span className="text-[0.65rem] font-black text-[#996515]">{w.lifetime?.tonnage_unloading ? w.lifetime.tonnage_unloading.toFixed(1) : 0}</span>
                  </div>
                </div>
              </div>
              <div className={`${
                occPercent > 80 ? 'bg-red-50 border border-red-100' : 
                occPercent > 50 ? 'bg-amber-50 border border-amber-100' : 
                'bg-emerald-50 border border-emerald-100'
              } p-4 rounded-xl mb-6 text-left transition-colors duration-500`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[0.7rem] font-bold uppercase text-slate-600">Occupancy</span>
                  <span className={`text-[0.75rem] font-black ${
                    occPercent > 80 ? 'text-red-600' : 
                    occPercent > 50 ? 'text-amber-600' : 
                    'text-emerald-600'
                  }`}>{w.occupancy || '0%'}</span>
                </div>
                <div className="h-1.5 bg-slate-200/50 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${
                    occPercent > 80 ? 'bg-red-500' : 
                    occPercent > 50 ? 'bg-amber-500' : 
                    'bg-emerald-500'
                  } transition-all duration-500`} style={{ width: `${occPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-[0.65rem] text-slate-500 font-bold">
                  <span>Act: {w.actual || '0'}</span>
                  <span>Cap: {w.capacity || '0'}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                <div className="flex gap-2 flex-1">
                  <button 
                    onClick={() => {
                      setSelectedWarehouseForReview({ id, name: w.name });
                      fetchReviews(id);
                    }}
                    className="flex-1 flex items-center justify-center p-2.5 sm:p-3.5 bg-white text-[#0f172a] border border-[#e2e8f0] rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all"
                  >
                    Reviews <Star size={12} className="ml-1.5 text-yellow-500 fill-yellow-500" />
                  </button>
                  <button 
                    onClick={() => setSelectedWarehouseForReport({ id, name: w.name })}
                    className="flex-1 flex items-center justify-center p-2.5 sm:p-3.5 bg-white text-red-600 border border-red-100 rounded-xl font-bold text-xs sm:text-sm hover:bg-red-50 transition-all"
                  >
                    Lapor <AlertTriangle size={12} className="ml-1.5" />
                  </button>
                </div>
                <a href={w.url} target="_blank" className="flex-1 sm:flex-[1.5] flex items-center justify-center p-2.5 sm:p-3.5 bg-[#0f172a] text-white no-underline rounded-xl font-bold text-xs sm:text-sm hover:bg-[#C5A059] transition-all">
                  Visit Queue <ExternalLink size={12} className="ml-1.5" />
                </a>
              </div>
              <div className="mt-2.5 text-[0.65rem] text-[#64748b] flex items-center gap-1">
                <Clock size={12} /> Active: {w.last_update ? new Date(w.last_update).toLocaleTimeString() : 'N/A'}
              </div>
              {Array.isArray(employees) && employees.filter(emp => emp.warehouse_id === id).length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
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
                          className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/50 cursor-pointer hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group/emp text-left"
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
      {Object.keys(unregisteredStats).length > 0 && (
        <div className="max-w-[1400px] mx-auto mb-10 text-left">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-[#996515] rounded-full"></div>
            <div>
              <h3 className="text-xl font-black text-slate-800 m-0">Other Storage Units</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Occupancy Tracking Only</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-24">
            {Object.values(unregisteredStats).map((w, idx) => {
              const occPercent = getOccupancyPercent(w.occupancy);
              return (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-black text-slate-900 mb-4">{w.name}</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[0.7rem] font-bold">
                      <span className="text-slate-500 uppercase">Occupancy</span>
                      <span className={occPercent > 80 ? 'text-red-600' : 'text-emerald-600'}>{w.occupancy}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${occPercent > 80 ? 'bg-red-500' : 'bg-emerald-500'} transition-all`} style={{ width: `${occPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[0.6rem] text-slate-400 font-bold uppercase">
                      <span>Act: {w.actual}</span>
                      <span>Cap: {w.capacity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
