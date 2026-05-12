import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BannerSlider = ({ banners, currentBanner, setCurrentBanner, setSelectedBanner }) => {
  if (banners.length === 0) return null;

  return (
    <section className="px-[5%] pb-24 bg-gradient-to-b from-[#f0f9ff] to-[#f1f5f9]">
      <div className="max-w-[1400px] mx-auto relative group">
        <div className="relative aspect-[16/9] md:aspect-[21/7] w-full overflow-hidden rounded-[40px] shadow-2xl border-4 border-white bg-white">
          <div 
            className="absolute inset-0 flex transition-transform duration-700 ease-in-out" 
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                onClick={() => setSelectedBanner(banner)}
                className="w-full h-full flex-shrink-0 relative cursor-pointer"
              >
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                {banner.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-left">
                    <h2 className="text-3xl md:text-5xl font-black drop-shadow-lg">{banner.title}</h2>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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
  );
};
