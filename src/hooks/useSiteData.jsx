'use client';
import { useState, useEffect } from 'react';

export const useSiteData = () => {
  const [siteSettings, setSiteSettings] = useState({
    site_title: 'Warehouse Monitoring',
    site_name: 'Warehouse CPP',
    company_name: 'PT. Central Proteina Prima',
    site_icon: '',
    hero_title: 'Warehouse Division PT. Central Proteina Prima',
    hero_description: 'Real-time flow monitoring for warehouse operational efficiency PT. Central Proteina Prima.',
    overview_title: 'Warehouse Overview',
    overview_description: 'Comprehensive summary of all warehouse operations.',
    news_title: 'Latest News & Articles',
    news_description: 'Stay updated with our latest Warehouse insights and company news.',
    monitoring_title: 'Warehouse Monitoring',
    monitoring_description: 'Comprehensive Monitoring of all warehouse operations.'
  });
  const [blogs, setBlogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', reviewer_name: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setSiteSettings(prev => ({ ...prev, ...data }));
          if (data.site_title) document.title = data.site_title;
          if (data.site_icon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = data.site_icon;
          }
        }
      })
      .catch(err => console.error('Settings fetch error:', err));

    fetch('/api/admin/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogs(data.slice(0, 3));
      })
      .catch(err => console.error('Blogs fetch error:', err));

    fetch('/api/admin/employees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEmployees(data);
      })
      .catch(err => console.error('Employees fetch error:', err));

    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBanners(data);
      })
      .catch(err => console.error('Banners fetch error:', err));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const fetchReviews = async (warehouseId) => {
    try {
      const res = await fetch(`/api/reviews/${warehouseId}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Fetch reviews error:', err);
    }
  };

  const handleReviewSubmit = async (warehouseId) => {
    if (!warehouseId) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouse_id: warehouseId,
          ...newReview
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewReview({ rating: 5, comment: '', reviewer_name: '' });
        fetchReviews(warehouseId);
        return true;
      }
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setIsSubmittingReview(false);
    }
    return false;
  };

  return {
    siteSettings,
    blogs,
    employees,
    banners,
    currentBanner,
    setCurrentBanner,
    reviews,
    setReviews,
    newReview,
    setNewReview,
    isSubmittingReview,
    fetchReviews,
    handleReviewSubmit
  };
};
