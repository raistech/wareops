'use client';

import { Plus, Loader2, Users, Building, Trash2 } from 'lucide-react';
import { warehouseOptions } from '../../app/admin/constants';

export const EmployeeManagement = ({ 
  newEmployee, 
  setNewEmployee, 
  handleCreateEmployee, 
  uploadImage, 
  setUploadImage, 
  loading, 
  employees, 
  deleteItem 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm h-fit text-left">
        <h3 className="text-xl font-bold mb-6">Add New Staff / Org Structure</h3>
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Full Name</label>
            <input 
              type="text" 
              value={newEmployee.name} 
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              required 
              disabled={loading} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Position / Jabatan</label>
            <input 
              type="text" 
              value={newEmployee.position} 
              onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]" 
              required 
              disabled={loading} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Warehouse / Unit</label>
            <select 
              value={newEmployee.warehouse_id} 
              onChange={(e) => setNewEmployee({...newEmployee, warehouse_id: e.target.value})} 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-[#004A99]"
            >
              {warehouseOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Staff Photo</label>
            <input 
              type="file" 
              onChange={(e) => setUploadImage(e.target.files[0])} 
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#004A99] hover:file:bg-blue-100" 
              disabled={loading} 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Add Staff Member
          </button>
        </form>
      </div>

      <div className="space-y-4 text-left">
        <h3 className="text-xl font-bold mb-6">Current Organization</h3>
        {employees.length === 0 && <p className="text-slate-400 italic">No staff added yet.</p>}
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
            <div className="w-14 h-14 bg-slate-200 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#004A99]">
              {emp.image_url ? <img src={emp.image_url} className="w-full h-full object-cover" alt="" /> : <Users className="w-full h-full p-3 text-slate-400" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">{emp.name}</h4>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{emp.position}</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-[#004A99] font-bold uppercase">
                <Building size={10} /> {warehouseOptions.find(o => o.id === emp.warehouse_id)?.name || 'Unknown'}
              </div>
            </div>
            <button 
              onClick={() => deleteItem(emp.id)} 
              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
