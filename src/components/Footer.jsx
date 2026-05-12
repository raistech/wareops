export const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-10 pb-8 px-[5%] text-center">
      <div className="pt-8 border-t border-[#1e293b] text-[#64748b] text-[0.85rem] flex flex-col md:flex-row justify-center items-center gap-2">
        <span>© {new Date().getFullYear()} PT Central Proteina Prima Tbk - Internal Warehouse Monitoring</span>
        <span className="hidden md:inline text-slate-700">•</span>
        <span>Developed with ❤️ by <a href="https://instagram.com/araiisen" target="_blank" className="text-[#996515] no-underline font-bold">Arai</a></span>
      </div>
    </footer>
  );
};
