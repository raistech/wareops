'use client';

import { Trash2, Star } from 'lucide-react';
import { warehouseOptions } from '../../app/admin/constants';

export const ReviewModeration = ({ reviews, handleDeleteReview }) => {
  return (
    <div className="space-y-6 text-left">
      <h3 className="text-xl font-bold mb-6">Review Moderation</h3>
      {reviews.length === 0 && <p className="text-slate-400 italic">No reviews found.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-fit">
            <div className="flex justify-between items-start mb-4">
              <div className="text-left">
                <div className="font-bold text-slate-800 text-lg">{review.reviewer_name}</div>
                <div className="text-xs font-bold text-[#C5A059] uppercase">
                  {warehouseOptions.find(w => w.id === review.warehouse_id)?.name || review.warehouse_id}
                </div>
              </div>
              <button 
                onClick={() => handleDeleteReview(review.id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Delete malicious review"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}`} 
                />
              ))}
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 italic text-left">
              "{review.comment}"
            </p>
            
            <div className="text-[0.7rem] font-bold text-slate-300 uppercase mt-auto text-left">
              Submitted: {new Date(review.created_at).toLocaleString('id-ID')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
