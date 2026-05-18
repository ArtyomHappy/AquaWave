import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckCircle } from 'lucide-react';
import { getTrainer, createTrainingRequest, getTrainerBookedSlots } from '../../services/trainers';
import { Trainer } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getWeekDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const TRAINER_AVATAR = 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=400';

export function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      getTrainer(id).then((data) => {
        setTrainer(data);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      getTrainerBookedSlots(id, formatDate(selectedDate)).then(setBookedSlots);
    }
  }, [id, selectedDate]);

  const handleBook = async () => {
    if (!profile) { navigate('/auth/login'); return; }
    if (!selectedTime || !trainer) return;
    setSubmitting(true);
    try {
      await createTrainingRequest({
        client_id: profile.id,
        trainer_id: trainer.id,
        date: formatDate(selectedDate),
        time_slot: selectedTime,
      });
      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  if (!trainer) return <div className="text-center py-20">Тренер не найден</div>;

  const name = trainer.profile ? `${trainer.profile.first_name} ${trainer.profile.last_name}` : 'Тренер';
  const avatar = trainer.avatar_url || trainer.profile?.avatar_url || TRAINER_AVATAR;
  const weekDates = getWeekDates();

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Заявка отправлена!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Тренер {name} получит уведомление и подтвердит занятие на {formatDate(selectedDate)} в {selectedTime}.
          </p>
          <Button className="w-full" onClick={() => navigate('/profile')}>В личный кабинет</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/trainers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Вернуться к каталогу тренеров
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trainer info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-sky-800 to-sky-600">
              <img src={avatar} alt={name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="p-5">
              <h1 className="text-xl font-bold text-gray-900 mb-1">{name}</h1>
              <p className="text-sky-600 text-sm font-medium mb-3">{trainer.specialization || 'Мастер спорта'}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Опыт {trainer.experience} лет
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio + booking */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">О тренере</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {trainer.bio || 'Профессиональный тренер по плаванию с многолетним опытом подготовки спортсменов различного уровня.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Записаться на занятие</h2>
              <div className="text-right">
                <div className="text-xl font-bold text-sky-600">{trainer.price_per_hour.toLocaleString()} ₽</div>
                <div className="text-xs text-gray-400">за час</div>
              </div>
            </div>

            {/* Week calendar */}
            <div className="mb-5">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>Выберите день</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDates.map((d, i) => {
                  const isSelected = formatDate(d) === formatDate(selectedDate);
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                      className={`flex flex-col items-center py-2 rounded-xl text-xs transition-colors ${
                        isSelected ? 'bg-sky-600 text-white' : 'bg-gray-50 hover:bg-sky-50 text-gray-600'
                      }`}
                    >
                      <span className="opacity-70">{DAYS_SHORT[d.getDay()]}</span>
                      <span className="font-bold text-sm">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Свободные места</p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => {
                  const isBooked = bookedSlots.includes(t);
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        isBooked
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-gray-50 hover:bg-sky-50 text-gray-700'
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
              disabled={!selectedTime}
              loading={submitting}
              onClick={handleBook}
            >
              Записаться на занятие
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
