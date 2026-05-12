'use client';

import { useState, useEffect } from 'react';

export const useAdminData = (isLoggedIn) => {
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
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

  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', warehouse_id: 'newgudang', sort_order: 0 });
  const [newBanner, setNewBanner] = useState({ title: '', link_url: '', sort_order: 0 });
  const [uploadImage, setUploadImage] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/${activeTab}`);
      const data = await res.json();
      if (activeTab === 'blogs') setBlogs(data);
      if (activeTab === 'banners') setBanners(data);
      if (activeTab === 'employees') setEmployees(data);
      if (activeTab === 'reviews') setReviews(data);
      if (activeTab === 'reports') setReports(data);
      if (activeTab === 'settings') setSiteSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleUpdateReportStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchData();
        showMessage('success', `Report marked as ${status}`);
      }
    } catch (err) {
      showMessage('error', 'Failed to update status');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        showMessage('success', 'Report deleted');
      }
    } catch (err) {
      showMessage('error', 'Delete failed');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [activeTab, isLoggedIn]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await fetch(`/api/admin/${activeTab}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        showMessage('success', 'Item deleted successfully');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete item');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        showMessage('success', 'Review deleted');
      }
    } catch (err) {
      showMessage('error', 'Delete failed');
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBlog.title);
      formData.append('content', newBlog.content);
      if (uploadImage) formData.append('image', uploadImage);

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setNewBlog({ title: '', content: '' });
        setUploadImage(null);
        e.target.reset();
        await fetchData();
        showMessage('success', 'Article published successfully!');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newEmployee.name);
      formData.append('position', newEmployee.position);
      formData.append('warehouse_id', newEmployee.warehouse_id);
      formData.append('sort_order', newEmployee.sort_order);
      if (uploadImage) formData.append('image', uploadImage);

      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setNewEmployee({ name: '', position: '', warehouse_id: 'newgudang', sort_order: 0 });
        setUploadImage(null);
        e.target.reset();
        await fetchData();
        showMessage('success', 'Employee added successfully!');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!uploadImage) return alert('Please select a banner image');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBanner.title);
      formData.append('link_url', newBanner.link_url);
      formData.append('sort_order', newBanner.sort_order);
      formData.append('is_active', 'true');
      formData.append('image', uploadImage);

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setNewBanner({ title: '', link_url: '', sort_order: 0 });
        setUploadImage(null);
        e.target.reset();
        await fetchData();
        showMessage('success', 'Banner added successfully!');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      if (res.ok) showMessage('success', 'Settings saved successfully');
    } catch (err) {
      showMessage('error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadIcon = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/admin/settings/icon', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSiteSettings(prev => ({ ...prev, site_icon: data.imageUrl }));
        showMessage('success', 'Site icon updated');
      }
    } catch (err) {
      showMessage('error', 'Failed to upload icon');
    } finally {
      setLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    blogs,
    banners,
    employees,
    reviews,
    reports,
    siteSettings,
    setSiteSettings,
    newBlog,
    setNewBlog,
    newEmployee,
    setNewEmployee,
    newBanner,
    setNewBanner,
    uploadImage,
    setUploadImage,
    message,
    showMessage,
    loading,
    setLoading,
    fetchData,
    deleteItem,
    handleDeleteReview,
    handleUpdateReportStatus,
    handleDeleteReport,
    handleCreateBlog,
    handleCreateEmployee,
    handleCreateBanner,
    handleSaveSettings,
    handleUploadIcon
  };
};
