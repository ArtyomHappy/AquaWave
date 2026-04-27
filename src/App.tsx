import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PageLoader } from './components/ui/Spinner';

// Auth
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Client
import { PoolsPage } from './pages/client/PoolsPage';
import { PoolDetailPage } from './pages/client/PoolDetailPage';
import { PaymentPage } from './pages/client/PaymentPage';
import { TrainersPage } from './pages/client/TrainersPage';
import { TrainerDetailPage } from './pages/client/TrainerDetailPage';

// Shared
import { ProfilePage } from './pages/shared/ProfilePage';
import { ProfileSettingsPage } from './pages/shared/ProfileSettingsPage';
import { AboutPage } from './pages/shared/AboutPage';
import { FAQPage } from './pages/shared/FAQPage';

// Trainer
import { TrainerLayout } from './pages/trainer/TrainerLayout';
import { TrainerProfilePage } from './pages/trainer/TrainerProfilePage';
import { TrainerSchedulePage } from './pages/trainer/TrainerSchedulePage';
import { TrainerRequestsPage } from './pages/trainer/TrainerRequestsPage';

// Admin
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminPoolsPage } from './pages/admin/AdminPoolsPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';

export default function App() {
  const { setSession, fetchProfile, loading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public */}
          <Route index element={<Navigate to="/pools" replace />} />
          <Route path="pools" element={<PoolsPage />} />
          <Route path="pools/:id" element={<PoolDetailPage />} />
          <Route path="trainers" element={<TrainersPage />} />
          <Route path="trainers/:id" element={<TrainerDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="faq" element={<FAQPage />} />

          {/* Payment */}
          <Route path="payment/:bookingId" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />

          {/* Profile */}
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="profile/settings" element={
            <ProtectedRoute>
              <ProfileSettingsPage />
            </ProtectedRoute>
          } />

          {/* Trainer panel */}
          <Route path="trainer" element={<TrainerLayout />}>
            <Route index element={<Navigate to="/trainer/profile" replace />} />
            <Route path="profile" element={<TrainerProfilePage />} />
            <Route path="schedule" element={<TrainerSchedulePage />} />
            <Route path="requests" element={<TrainerRequestsPage />} />
          </Route>

          {/* Admin panel */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/pools" replace />} />
            <Route path="pools" element={<AdminPoolsPage />} />
            <Route path="support" element={<AdminSupportPage />} />
          </Route>
        </Route>

        {/* Auth pages */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        <Route path="*" element={<Navigate to="/pools" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
