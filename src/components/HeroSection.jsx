export const HeroSection = ({ siteSettings }) => {
  return (
    <section className="pt-24 pb-10 px-[5%] bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] text-center relative overflow-hidden">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] bg-gradient-to-r from-[#004A99] to-[#E30613] bg-clip-text text-transparent">
        {siteSettings.hero_title}
      </h1>
      <p className="max-w-2xl mx-auto text-xl text-[#64748b] mb-10 text-center">
        {siteSettings.hero_description}
      </p>
      <div className="flex justify-center gap-4">
        <a href="#summary" className="bg-[#004A99] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#003a7a] hover:-translate-y-0.5 transition-all inline-block no-underline shadow-lg">
          Get Started
        </a>
      </div>
    </section>
  );
};
