'use client';

import { Trash2, CheckCircle, Clock, XCircle, User, Phone, Tag, Calendar, Image as ImageIcon } from 'lucide-react';

export const ReportManagement = ({ 
  reports, 
  handleUpdateReportStatus, 
  handleDeleteReport 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'received': return 'bg-blue-100 text-[#004A99] border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {reports.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400 italic">
          No reports found. All clear!
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="w-full md:w-48 h-48 md:h-auto bg-slate-100 flex-shrink-0 relative group">
                {report.photo ? (
                  <img 
                    src={report.photo} 
                    className="w-full h-full object-cover cursor-pointer" 
                    alt="Evidence"
                    onClick={() => window.open().document.write(`<img src="${report.photo}" />`)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon size={40} />
                    <span className="text-[10px] font-bold mt-1 uppercase">No Photo</span>
                  </div>
                )}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(report.status)} shadow-sm`}>
                  {report.status}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#004A99] uppercase mb-1">
                      <Tag size={12} /> {report.category}
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 leading-tight mb-1">{report.warehouse_id}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(report.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl mb-6 text-sm text-slate-600 italic leading-relaxed border border-slate-100/50">
                  "{report.description}"
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><User size={14} /></div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-black text-slate-400 uppercase">Reporter</div>
                      <div className="text-[11px] font-bold text-slate-700 truncate">{report.reporter_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><Phone size={14} /></div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-black text-slate-400 uppercase">Contact</div>
                      <div className="text-[11px] font-bold text-slate-700 truncate">{report.reporter_phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                  {report.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateReportStatus(report.id, 'received')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-[#004A99] hover:bg-[#004A99] hover:text-white rounded-xl text-[11px] font-black uppercase transition-all"
                    >
                      <Clock size={14} /> Mark Received
                    </button>
                  )}
                  {report.status !== 'resolved' && (
                    <button 
                      onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-50 text-green-700 hover:bg-green-700 hover:text-white rounded-xl text-[11px] font-black uppercase transition-all"
                    >
                      <CheckCircle size={14} /> Mark Resolved
                    </button>
                  )}
                  {report.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateReportStatus(report.id, 'rejected')}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-[11px] font-black uppercase transition-all"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};