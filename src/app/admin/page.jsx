'use client';

import { useState } from 'react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import { useAdminData } from '../../hooks/admin/useAdminData';
import { LoginForm } from '../../components/admin/LoginForm';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { BlogManagement } from '../../components/admin/BlogManagement';
import { EmployeeManagement } from '../../components/admin/EmployeeManagement';
import { BannerManagement } from '../../components/admin/BannerManagement';
import { ReviewModeration } from '../../components/admin/ReviewModeration';
import { SiteSettings } from '../../components/admin/SiteSettings';
import { ReportManagement } from '../../components/admin/ReportManagement';

export default function AdminPage() {
  const {
    isLoggedIn,
    loginPassword,
    setLoginPassword,
    loading: authLoading,
    passwords,
    setPasswords,
    handleLogin,
    handleLogout,
    handleChangePassword
  } = useAdminAuth();

  const {
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
    editingBlogId,
    setEditBlog,
    cancelEditBlog,
    newEmployee,
    setNewEmployee,
    newBanner,
    setNewBanner,
    uploadImage,
    setUploadImage,
    message,
    showMessage,
    loading: dataLoading,
    deleteItem,
    handleDeleteReview,
    handleUpdateReportStatus,
    handleDeleteReport,
    handleCreateBlog,
    handleCreateEmployee,
    handleCreateBanner,
    handleSaveSettings,
    handleUploadIcon
  } = useAdminData(isLoggedIn);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const loading = authLoading || dataLoading;

  if (!isLoggedIn) {
    return (
      <LoginForm 
        handleLogin={handleLogin} 
        loginPassword={loginPassword} 
        setLoginPassword={setLoginPassword} 
        loading={loading} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-lg font-black text-[#E30613]">CP PRIMA ADMIN</h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-slate-800 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 p-4 md:p-10 overflow-auto text-left">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 capitalize">{activeTab} Management</h2>
          {message.text && (
            <div className={`w-full md:w-auto px-4 py-2 rounded-lg font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
        </header>

        {activeTab === 'blogs' && (
          <BlogManagement 
            newBlog={newBlog}
            setNewBlog={setNewBlog}
            handleCreateBlog={handleCreateBlog}
            uploadImage={uploadImage}
            setUploadImage={setUploadImage}
            loading={loading}
            blogs={blogs}
            deleteItem={deleteItem}
            editingBlogId={editingBlogId}
            setEditBlog={setEditBlog}
            cancelEditBlog={cancelEditBlog}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement 
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            handleCreateEmployee={handleCreateEmployee}
            uploadImage={uploadImage}
            setUploadImage={setUploadImage}
            loading={loading}
            employees={employees}
            deleteItem={deleteItem}
          />
        )}

        {activeTab === 'banners' && (
          <BannerManagement 
            newBanner={newBanner}
            setNewBanner={setNewBanner}
            handleCreateBanner={handleCreateBanner}
            uploadImage={uploadImage}
            setUploadImage={setUploadImage}
            loading={loading}
            banners={banners}
            deleteItem={deleteItem}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewModeration 
            reviews={reviews}
            handleDeleteReview={handleDeleteReview}
          />
        )}

        {activeTab === 'reports' && (
          <ReportManagement 
            reports={reports}
            handleUpdateReportStatus={handleUpdateReportStatus}
            handleDeleteReport={handleDeleteReport}
          />
        )}

        {activeTab === 'settings' && (
          <SiteSettings 
            siteSettings={siteSettings}
            setSiteSettings={setSiteSettings}
            handleSaveSettings={handleSaveSettings}
            handleUploadIcon={handleUploadIcon}
            loading={loading}
            passwords={passwords}
            setPasswords={setPasswords}
            handleChangePassword={handleChangePassword}
            showMessage={showMessage}
          />
        )}
      </div>
    </div>
  );
}
