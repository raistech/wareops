export const HeroSection = ({ siteSettings }) => {
  return (
    <section className="pt-24 pb-10 px-[5%] bg-gradient-to-br from-[#FDF5E6] to-[#F5F5DC] text-center relative overflow-hidden">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] bg-gradient-to-r from-[#C5A059] to-[#996515] bg-clip-text text-transparent">
        {siteSettings.hero_title}
      </h1>
      <p className="max-w-2xl mx-auto text-xl text-[#64748b] mb-10 text-center">
        {siteSettings.hero_description}
      </p>
      <div className="flex justify-center gap-4">
        <a href="#summary" className="bg-[#C5A059] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#A67C00] hover:-translate-y-0.5 transition-all inline-block no-underline shadow-lg">
          Get Started
        </a>
      </div>
    </section>
  );
};
