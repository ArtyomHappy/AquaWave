import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Thermometer, Layers, ArrowLeft, Calendar, Clock,
  Wifi, Coffee, Dumbbell, Droplets
} from 'lucide-react';
import { getPool } from '../../services/pools';
import { getBookedSlots, createBooking } from '../../services/bookings';
import { Pool } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const TIME_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
// const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export function PoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (id) {
      getPool(id).then((data) => {
        setPool(data);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      getBookedSlots(id, formatDate(selectedDate)).then(setBookedSlots);
    }
  }, [id, selectedDate]);

  const handleBook = async () => {
    if (!profile) {
      navigate('/auth/login');
      return;
    }
    if (!selectedTime || !id) return;
    setBooking(true);
    try {
      const newBooking = await createBooking({
        user_id: profile.id,
        pool_id: id,
        date: formatDate(selectedDate),
        time_slot: selectedTime,
      });
      navigate(`/payment/${newBooking.id}`, { state: { pool, booking: newBooking } });
    } catch (e) {
      console.error(e);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="w-8 h-8" />
    </div>
  );

  if (!pool) return <div className="text-center py-20 text-gray-500">Бассейн не найден</div>;

  const dates = getDates();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/pools" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Назад к списку
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden h-72">
            <img
              src={pool.image_url || 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={pool.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 text-center shadow-lg">
              <div className="text-xs text-gray-500 mb-1">50 метров совершенства</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-sky-500" />{pool.water_temp}°C</span>
                <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-sky-500" />{pool.lanes} дорожки</span>
              </div>
            </div>
          </div>

          {/* Title & description */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{pool.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{pool.address}</span>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">— О бассейне</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{pool.description}</p>

            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-sky-600">{pool.length}м</div>
                <div className="text-xs text-gray-500 mt-1">длина бассейна</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sky-600">{pool.water_temp}°C</div>
                <div className="text-xs text-gray-500 mt-1">температура воды</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sky-600">{pool.lanes}</div>
                <div className="text-xs text-gray-500 mt-1">дорожки</div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Удобства и сервисы</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Dumbbell className="w-5 h-5 text-sky-500" />, name: 'Фитнес-зона', desc: 'Кардио и силовые тренажёры' },
                { icon: <Coffee className="w-5 h-5 text-sky-500" />, name: 'Аква-кафе', desc: 'Спортивное питание и напитки' },
                { icon: <Wifi className="w-5 h-5 text-sky-500" />, name: 'Тренировочный зал', desc: 'Залы разминки перед заплывом' },
                { icon: <Droplets className="w-5 h-5 text-sky-500" />, name: 'Аквапарк', desc: 'Горки, волны и игровая зона' },
              ].map((a) => (
                <div key={a.name} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {a.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-500">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: booking */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <div className="text-2xl font-bold text-gray-900">{pool.price} ₽</div>
                <div className="text-xs text-gray-500">за посещение</div>
              </div>
            </div>

            {/* Date selector */}
            <div className="mb-5">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4 text-sky-500" />
                Выберите дату
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dates.slice(0, 14).map((d, i) => {
                  const isSelected = formatDate(d) === formatDate(selectedDate);
                  const isToday = formatDate(d) === formatDate(new Date());
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'hover:bg-sky-50 text-gray-600'
                      }`}
                    >
                      <span className="opacity-70">{DAYS_SHORT[d.getDay()]}</span>
                      <span className={`font-semibold text-sm ${isToday && !isSelected ? 'text-sky-600' : ''}`}>
                        {d.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div className="mb-5">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Clock className="w-4 h-4 text-sky-500" />
                Свободные места к 8-ми
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => {
                  const isBooked = bookedSlots.includes(t);
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                        isBooked
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-gray-50 hover:bg-sky-50 text-gray-700 hover:text-sky-700'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleBook}
              disabled={!selectedTime}
              loading={booking}
            >
              Забронировать
            </Button>

            {!profile && (
              <p className="text-xs text-center text-gray-500 mt-3">
                Для бронирования необходимо <Link to="/auth/login" className="text-sky-600">войти</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
