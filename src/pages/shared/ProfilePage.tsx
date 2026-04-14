import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Calendar, Clock, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getUserBookings, updateBookingStatus } from '../../services/bookings';
import { Booking } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  paid: { label: 'Оплачено', variant: 'success' },
  pending: { label: 'Ожидает', variant: 'warning' },
  cancelled: { label: 'Отменено', variant: 'error' },
};

export function ProfilePage() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      getUserBookings(profile.id).then((data) => {
        setBookings(data);
        setLoading(false);
      });
    }
  }, [profile]);

  const handleCancel = async (id: string) => {
    await updateBookingStatus(id, 'cancelled');
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!profile) return null;

  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && new Date(`${b.date}T${b.time_slot}`) >= new Date());
  const past = bookings.filter((b) => b.status !== 'cancelled' && new Date(`${b.date}T${b.time_slot}`) < new Date());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-20 h-20 rounded-full mx-auto object-cover mb-3" alt="" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-3">
                <User className="w-9 h-9 text-sky-500" />
              </div>
            )}
            <h2 className="font-bold text-gray-900 text-lg">{profile.first_name} {profile.last_name}</h2>
            <p className="text-sm text-gray-500 mb-5">{profile.email}</p>

            <div className="space-y-2">
              <Link to="/profile/settings">
                <Button variant="outline" size="sm" className="w-full" icon={<Settings className="w-4 h-4" />}>
                  Настройки профиля
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-full text-red-500 hover:bg-red-50" icon={<LogOut className="w-4 h-4" />} onClick={handleSignOut}>
                Выйти из аккаунта
              </Button>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Личный кабинет</h1>
            <p className="text-gray-500 text-sm">Добро пожаловать, {profile.first_name}. У вас {upcoming.length} предстоящих занятий.</p>
          </div>

          {/* Upcoming bookings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Предстоящие бронирования</h2>
            {loading ? (
              <div className="flex justify-center py-8"><Spinner className="w-6 h-6" /></div>
            ) : upcoming.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Нет предстоящих бронирований</p>
                <Link to="/pools" className="text-sky-600 text-sm hover:underline mt-1 inline-block">
                  Найти бассейн
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-center">
                    <img
                      src={b.pool?.image_url || 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{b.pool?.name || 'Бассейн'}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.time_slot}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_MAP[b.status]?.variant || 'neutral'}>
                        {STATUS_MAP[b.status]?.label || b.status}
                      </Badge>
                      {b.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past bookings */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">История посещений</h2>
              <div className="space-y-3">
                {past.slice(0, 5).map((b) => (
                  <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-center opacity-70">
                    <img
                      src={b.pool?.image_url || 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">{b.pool?.name || 'Бассейн'}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>{b.date}</span>
                        <span>{b.time_slot}</span>
                      </div>
                    </div>
                    <Badge variant={STATUS_MAP[b.status]?.variant || 'neutral'}>
                      {STATUS_MAP[b.status]?.label || b.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
