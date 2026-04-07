import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { PageLoader } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { profile, loading } = useAuthStore();

  if (loading) return <PageLoader />;
  if (!profile) return <Navigate to="/auth/login" replace />;
  if (roles && !roles.includes(profile.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
