import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth, isUserProfileIncomplete } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MedicinesProvider } from './context/MedicinesContext';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Halaman ringan tetap di-import biasa (dimuat langsung)
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

// Halaman berat pakai lazy loading — hanya dimuat saat dibutuhkan
const UserDashboard    = lazy(() => import('./components/UserDashboard'));
const AdminDashboard   = lazy(() => import('./components/AdminDashboard'));
const CheckoutPage     = lazy(() => import('./components/CheckoutPage'));
const TrackingPage     = lazy(() => import('./components/TrackingPage'));
const SettingsPage     = lazy(() => import('./components/SettingsPage'));
const MedicineDetailPage = lazy(() => import('./components/MedicineDetailPage'));
const ProfilePage      = lazy(() => import('./components/ProfilePage'));
const PaymentConfirmationPage = lazy(() => import('./components/PaymentConfirmationPage'));

import ProfileCompletionModal from './components/ProfileCompletionModal';
import { useEffect, useState } from 'react';

/** Komponen loading yang tampil saat halaman lazy sedang dimuat */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-[3px] border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[color:var(--muted-foreground)] font-medium">Memuat halaman...</p>
      </div>
    </div>
  );
}

function ProfileCompletionWrapper({ children }: { children: React.ReactNode }) {
  const { isProfileIncomplete, isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isProfileIncomplete && !isAdmin) setShowModal(true);
  }, [isProfileIncomplete, isAdmin]);

  return (
    <>
      {children}
      <ProfileCompletionModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}


function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[color:var(--muted-foreground)]">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/user/dashboard" replace />;
  return <ProfileCompletionWrapper>{children}</ProfileCompletionWrapper>;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null; // Wait for session restore before rendering
  }

  return (
    <ErrorBoundary name="App">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/user/dashboard" element={
            <ProtectedRoute><ErrorBoundary name="UserDashboard"><UserDashboard /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="/medicine/:id" element={
            <ErrorBoundary name="MedicineDetail"><MedicineDetailPage /></ErrorBoundary>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute><ErrorBoundary name="Checkout"><CheckoutPage /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="/tracking/:orderId" element={
            <ProtectedRoute><ErrorBoundary name="Tracking"><TrackingPage /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><ErrorBoundary name="Settings"><SettingsPage /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ErrorBoundary name="Profile"><ProfilePage /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly><ErrorBoundary name="AdminDashboard"><AdminDashboard /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="/payment/success" element={
            <ProtectedRoute><ErrorBoundary name="PaymentConfirmation"><PaymentConfirmationPage /></ErrorBoundary></ProtectedRoute>
          } />

          <Route path="*" element={
            isAuthenticated
              ? <Navigate to={isAdmin ? '/admin/dashboard' : '/user/dashboard'} replace />
              : <Navigate to="/" replace />
          } />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MedicinesProvider>
            <BrowserRouter>
              {/* Skip link untuk keyboard navigasi */}
              <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none">
                Langsung ke konten utama
              </a>
              <AppRoutes />
            </BrowserRouter>
            <Toaster position="top-right" richColors />
          </MedicinesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
