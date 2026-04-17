import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function TrainerLayout() {
  const { profile } = useAuthStore();

  if (!profile || profile.role !== 'TRAINER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex gap-1 border-b border-gray-200 mb-8">
        {[
          { to: '/trainer/profile', label: 'О себе' },
          { to: '/trainer/schedule', label: 'Расписание' },
          { to: '/trainer/requests', label: 'Заявки' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
