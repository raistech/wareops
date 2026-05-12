'use client';

import { Lock, Loader2 } from 'lucide-react';

export const LoginForm = ({ handleLogin, loginPassword, setLoginPassword, loading }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
      <div className="bg-white rounded-3xl p-6 md:p-10 w-full max-w-md shadow-2xl">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#E30613]/10 text-[#E30613] rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8">
          <Lock size={32} />
        </div>
        <h1 className="text-xl md:text-2xl font-black mb-2 text-slate-800 tracking-tight">ADMIN ACCESS</h1>
        <p className="text-slate-500 mb-8 md:mb-10 text-sm">Please enter your password to continue.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="password" 
            placeholder="Enter Admin Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#004A99] focus:bg-white transition-all text-center text-lg font-bold tracking-widest"
            required
            autoFocus
          />
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Log In Now'}
          </button>
        </form>
      </div>
    </div>
  );
};
