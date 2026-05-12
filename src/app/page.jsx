'use client';
import { useState } from 'react';
import { useWarehouseData } from '../hooks/useWarehouseData';
import { useSiteData } from '../hooks/useSiteData';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { BannerSlider } from '../components/BannerSlider';
import { SummarySection } from '../components/SummarySection';
import { NewsSection } from '../components/NewsSection';
import { WarehouseMonitoring } from '../components/WarehouseMonitoring';
import { BlogModal, EmployeeModal, BannerModal, ReviewModal, ReportModal } from '../components/Modals';
import { Footer } from '../components/Footer';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Selection states for modals
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [selectedWarehouseForReview, setSelectedWarehouseForReview] = useState(null);
  const [selectedWarehouseForReport, setSelectedWarehouseForReport] = useState(null);

  const {
    warehouseStats,
    unregisteredStats,
    summary,
    lastRefreshed,
    isHistorical,
    isFetchingHistory,
    error,
    fetchCurrentStats
  } = useWarehouseData(selectedDate);

  const {
    siteSettings,
    blogs,
    employees,
    banners,
    currentBanner,
    setCurrentBanner,
    reviews,
    newReview,
    setNewReview,
    isSubmittingReview,
    fetchReviews,
    handleReviewSubmit,
    submitReport
  } = useSiteData();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#0f172a]">
      <Navbar 
        siteSettings={siteSettings} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      <HeroSection siteSettings={siteSettings} />
      
      <BannerSlider 
        banners={banners} 
        currentBanner={currentBanner} 
        setCurrentBanner={setCurrentBanner} 
        setSelectedBanner={setSelectedBanner} 
      />

      <SummarySection 
        siteSettings={siteSettings}
        summary={summary}
        isHistorical={isHistorical}
        selectedDate={selectedDate}
        lastRefreshed={lastRefreshed}
        totalWarehouses={Object.keys(warehouseStats).length}
      />

      <NewsSection 
        siteSettings={siteSettings}
        blogs={blogs}
      />

      <WarehouseMonitoring 
        siteSettings={siteSettings}
        warehouseStats={warehouseStats}
        unregisteredStats={unregisteredStats}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isFetchingHistory={isFetchingHistory}
        isHistorical={isHistorical}
        error={error}
        fetchCurrentStats={fetchCurrentStats}
        employees={employees}
        setSelectedEmployee={setSelectedEmployee}
        setSelectedWarehouseForReview={setSelectedWarehouseForReview}
        setSelectedWarehouseForReport={setSelectedWarehouseForReport}
        fetchReviews={fetchReviews}
      />

      <EmployeeModal 
        selectedEmployee={selectedEmployee} 
        setSelectedEmployee={setSelectedEmployee} 
        warehouseStats={warehouseStats}
        siteSettings={siteSettings}
      />
      
      <BannerModal selectedBanner={selectedBanner} setSelectedBanner={setSelectedBanner} />
      
      <ReviewModal 
        selectedWarehouseForReview={selectedWarehouseForReview}
        setSelectedWarehouseForReview={setSelectedWarehouseForReview}
        newReview={newReview}
        setNewReview={setNewReview}
        handleReviewSubmit={handleReviewSubmit}
        isSubmittingReview={isSubmittingReview}
        reviews={reviews}
      />

      <ReportModal 
        selectedWarehouseForReport={selectedWarehouseForReport}
        setSelectedWarehouseForReport={setSelectedWarehouseForReport}
        submitReport={submitReport}
      />

      <Footer />
    </div>
  );
}
