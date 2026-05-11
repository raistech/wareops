import { X, Newspaper, Users, Building2, ExternalLink, MessageSquare, Star, Loader2 } from 'lucide-react';

export const BlogModal = ({ selectedBlog, setSelectedBlog }) => {
  if (!selectedBlog) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="relative h-64 md:h-80 flex-shrink-0 text-left">
          {selectedBlog.image_url ? (
            <img src={selectedBlog.image_url} alt={selectedBlog.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
              <Newspaper size={80} />
            </div>
          )}
          <button 
            onClick={() => setSelectedBlog(null)}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8 md:p-12 overflow-y-auto text-left">
          <div className="text-sm font-bold text-[#E30613] uppercase mb-4 tracking-widest text-left">
            {new Date(selectedBlog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-8 leading-tight text-left">
            {selectedBlog.title}
          </h2>
          <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap text-left">
            {selectedBlog.content}
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={() => setSelectedBlog(null)}
            className="px-8 py-3 bg-[#0f172a] text-white rounded-full font-bold hover:bg-[#004A99] transition-all text-left"
          >
            Close Article
          </button>
        </div>
      </div>
    </div>
  );
};

export const EmployeeModal = ({ selectedEmployee, setSelectedEmployee, warehouseStats, siteSettings }) => {
  if (!selectedEmployee) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300 text-left">
        <div className="relative p-10 flex flex-col items-center text-center">
          <button 
            onClick={() => setSelectedEmployee(null)}
            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary-blue/20 p-1 mb-8">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
              {selectedEmployee.image_url ? (
                <img src={selectedEmployee.image_url} alt={selectedEmployee.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-full h-full p-12 text-slate-300" />
              )}
            </div>
          </div>
          <div className="text-[0.7rem] font-bold text-primary-blue uppercase tracking-[0.2em] mb-2">Staff Profile</div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedEmployee.name}</h2>
          <p className="text-lg font-bold text-primary-red uppercase tracking-tight mb-8">{selectedEmployee.position}</p>
          <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center gap-3">
            <Building2 size={20} className="text-slate-400" />
            <span className="font-bold text-slate-600 uppercase text-sm">
              {Object.values(warehouseStats).find(w => w.name.toLowerCase().includes(selectedEmployee.warehouse_id.replace('gudang','').toLowerCase()))?.name || siteSettings.company_name}
            </span>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={() => setSelectedEmployee(null)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-primary-blue transition-all shadow-lg"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export const BannerModal = ({ selectedBanner, setSelectedBanner }) => {
  if (!selectedBanner) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-5xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300 text-left">
        <div className="relative aspect-[21/9] md:aspect-[25/8] bg-slate-100">
          <img src={selectedBanner.image_url} alt="" className="w-full h-full object-cover" />
          <button 
            onClick={() => setSelectedBanner(null)}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-white">
          <div className="text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{selectedBanner.title || 'Special Promotion'}</h2>
            <p className="text-slate-500 font-medium">PT. Central Proteina Prima - Warehouse Information Center</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            {selectedBanner.link_url && (
              <a 
                href={selectedBanner.link_url} 
                target="_blank"
                className="flex-1 md:flex-none px-8 py-4 bg-[#004A99] text-white rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center gap-2 no-underline"
              >
                Visit Link <ExternalLink size={20} />
              </a>
            )}
            <button 
              onClick={() => setSelectedBanner(null)}
              className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReviewModal = ({ 
  selectedWarehouseForReview, 
  setSelectedWarehouseForReview, 
  newReview, 
  setNewReview, 
  handleReviewSubmit, 
  isSubmittingReview, 
  reviews 
}) => {
  if (!selectedWarehouseForReview) return null;
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-900">{selectedWarehouseForReview.name}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Reviews & Ratings</p>
          </div>
          <button 
            onClick={() => setSelectedWarehouseForReview(null)}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 text-left">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#004A99]" /> Write a Review
              </h3>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReviewSubmit(selectedWarehouseForReview.id);
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={28} 
                          className={`${star <= newReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
                  <input 
                    type="text"
                    placeholder="Anonymous"
                    value={newReview.reviewer_name}
                    onChange={(e) => setNewReview({...newReview, reviewer_name: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#004A99] outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comment</label>
                  <textarea 
                    placeholder="Tell us about your experience..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#004A99] outline-none font-medium h-32 resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-4 bg-[#004A99] text-white rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? <Loader2 size={20} className="animate-spin" /> : 'Submit Review'}
                </button>
              </form>
            </div>
            <div className="space-y-6 text-left">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" /> Recent Feedback
              </h3>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 italic">
                    No reviews yet. Be the first!
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-slate-800">{review.reviewer_name}</div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{review.comment}</p>
                      <div className="text-[0.65rem] font-bold text-slate-300 uppercase">
                        {new Date(review.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
