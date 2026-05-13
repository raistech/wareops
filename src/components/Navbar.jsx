import { X, Menu } from 'lucide-react';

export const Navbar = ({ siteSettings, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <nav className="sticky top-0 bg-white/95 backdrop-blur-md z-[100] border-b border-[#e2e8f0] px-[5%] py-4 flex justify-between items-center">
      <a href="/" className="flex items-center gap-2 text-[#C5A059] font-extrabold text-2xl no-underline">
        {siteSettings.site_name.split(' ').map((word, i) => (
          <span key={i} className={i === 1 ? 'text-[#996515]' : ''}>{word} </span>
        ))}
        {siteSettings.site_name.split(' ').length === 1 && <span>&nbsp;</span>}
      </a>
      <div className="hidden md:flex gap-8">
        <a href="#summary" className="text-[#0f172a] font-medium no-underline hover:text-[#C5A059] transition-colors">Summary</a>
        <a href="#news" className="text-[#0f172a] font-medium no-underline hover:text-[#C5A059] transition-colors">News</a>
        <a href="#monitoring" className="text-[#0f172a] font-medium no-underline hover:text-[#C5A059] transition-colors">Monitoring</a>
        <a href="https://cpp.co.id" target="_blank" rel="noopener noreferrer" className="text-[#0f172a] font-medium no-underline hover:text-[#C5A059] transition-colors">Company Web</a>
      </div>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-[#0f172a] hover:bg-slate-100 rounded-lg transition-colors"
      >
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl flex flex-col p-6 gap-6 md:hidden animate-in slide-in-from-top duration-300">
          <a href="#summary" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-[#0f172a] no-underline text-left hover:text-[#C5A059] transition-colors">Summary</a>
          <a href="#news" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-[#0f172a] no-underline text-left hover:text-[#C5A059] transition-colors">News</a>
          <a href="#monitoring" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-[#0f172a] no-underline text-left hover:text-[#C5A059] transition-colors">Monitoring</a>
          <a href="https://cpp.co.id" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-[#0f172a] no-underline text-left">Company Web</a>
        </div>
      )}
    </nav>
  );
};
