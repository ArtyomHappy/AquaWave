import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Waves, User, LogOut, Settings, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { to: '/pools', label: 'Бассейны' },
    { to: '/trainers', label: 'Тренеры' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-sky-600 font-bold text-lg hover:text-sky-700 transition-colors">
            <Waves className="w-7 h-7" />
            <span className="hidden sm:block text-gray-900 font-bold text-lg tracking-tight">
              Aqua<span className="text-sky-600">Wave</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-sky-600" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {profile.first_name}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{profile.first_name} {profile.last_name}</p>
                        <p className="text-xs text-gray-500">{profile.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Личный кабинет
                      </Link>
                      <Link
                        to="/profile/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Настройки
                      </Link>
                      {profile.role === 'TRAINER' && (
                        <Link
                          to="/trainer"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4" /> Кабинет тренера
                        </Link>
                      )}
                      {profile.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Администрирование
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Выйти
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
              >
                Войти
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
