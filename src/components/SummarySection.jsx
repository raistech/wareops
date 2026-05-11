import { Clock, Building2, TrendingUp, Truck, Timer, Database, Layers } from 'lucide-react';
import { formatKg } from '../utils/formatters';

export const SummarySection = ({ 
  siteSettings, 
  summary, 
  isHistorical, 
  selectedDate, 
  lastRefreshed, 
  totalWarehouses 
}) => {
  return (
    <section id="summary" className="py-24 px-[5%] bg-[#f1f5f9] rounded-t-[50px] -mt-12 relative z-10">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div className="text-left">
          <h2 className="text-3xl font-bold m-0">{siteSettings.overview_title}</h2>
          <p className="text-[#64748b] mt-2 text-lg">{siteSettings.overview_description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isHistorical ? (
            <div className="flex items-center gap-2 font-bold text-[#004A99] text-sm uppercase tracking-wider">
              <Clock size={16} />
              Historical View
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-[#E30613] text-sm uppercase tracking-wider">
              <div className="w-2.5 h-2.5 bg-[#E30613] rounded-full animate-pulse shadow-[0_0_0_0_rgba(227,6,19,0.7)]"></div>
              Live Update
            </div>
          )}
          <div className="text-[0.65rem] text-slate-400 font-bold uppercase text-right">
            {isHistorical ? 
              `Date: ${new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : 
              `Last sync: ${lastRefreshed.toLocaleTimeString()}`
            }
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto bg-white rounded-[32px] p-8 shadow-sm border border-[#e2e8f0] mb-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Layers size={120} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} className="text-left" /> Operational Status
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-[#0f172a]">{summary.activeWarehouses}</span>
              <span className="text-slate-400 font-bold mb-1">/ {totalWarehouses} Active</span>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              <TrendingUp size={16} /> All Systems Normal
            </div>
          </div>
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Truck size={16} /> Activity Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-2xl font-black text-[#004A99]">{summary.totalFinishedLoading}</span>
                  <span className="text-[0.6rem] font-bold text-slate-400 uppercase">Day</span>
                </div>
                <div className="text-[0.65rem] font-bold text-slate-400 border-t border-slate-100 pt-1">
                  <span className="text-slate-500">Total:</span> {summary.totalLifetimeLoading}
                </div>
              </div>
              <div className="text-left">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-2xl font-black text-[#E30613]">{summary.totalFinishedUnloading}</span>
                  <span className="text-[0.6rem] font-bold text-slate-400 uppercase">Day</span>
                </div>
                <div className="text-[0.65rem] font-bold text-slate-400 border-t border-slate-100 pt-1">
                  <span className="text-slate-500">Total:</span> {summary.totalLifetimeUnloading}
                </div>
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
                <span className="block text-[0.7rem] font-bold text-slate-400 text-nowrap">of {formatKg(summary.totalCapacity)}</span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#004A99] to-[#E30613] transition-all duration-1000" style={{ width: `${summary.totalOccupancy}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
