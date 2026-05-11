'use client';

import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import { useAdminData } from '../../hooks/admin/useAdminData';
import { LoginForm } from '../../components/admin/LoginForm';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { BlogManagement } from '../../components/admin/BlogManagement';
import { EmployeeManagement } from '../../components/admin/EmployeeManagement';
import { BannerManagement } from '../../components/admin/BannerManagement';
import { ReviewModeration } from '../../components/admin/ReviewModeration';
import { SiteSettings } from '../../components/admin/SiteSettings';

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
    loading: dataLoading,
    deleteItem,
    handleDeleteReview,
    handleCreateBlog,
    handleCreateEmployee,
    handleCreateBanner,
    handleSaveSettings,
    handleUploadIcon
  } = useAdminData(isLoggedIn);

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
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      <div className="flex-1 p-10 overflow-auto text-left">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 capitalize">{activeTab} Management</h2>
          {message.text && (
            <div className={`px-4 py-2 rounded-lg font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
