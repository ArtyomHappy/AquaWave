import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getTrainerByUserId, getTrainerRequests } from '../../services/trainers';
import { TrainingRequest } from '../../types';
import { Spinner } from '../../components/ui/Spinner';

const HOURS = Array.from({ length: 9 }, (_, i) => i + 8); // 8:00 - 16:00
const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

const COLORS = ['bg-sky-100 border-sky-300 text-sky-800', 'bg-emerald-100 border-emerald-300 text-emerald-800', 'bg-amber-100 border-amber-300 text-amber-800'];

export function TrainerSchedulePage() {
  const { profile } = useAuthStore();
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));

  useEffect(() => {
    if (!profile) return;
    getTrainerByUserId(profile.id).then((trainer) => {
      if (trainer) {
        getTrainerRequests(trainer.id).then((reqs) => {
          setRequests(reqs.filter((r) => r.status === 'approved'));
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [profile]);

  const weekDates = getWeekDates(weekStart);
  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const getRequestsForSlot = (date: Date, hour: number): TrainingRequest[] => {
    const dateStr = formatDate(date);
    return requests.filter((r) => {
      const slotHour = parseInt(r.time_slot.split(':')[0]);
      return r.date === dateStr && slotHour === hour;
    });
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Расписание тренировок</h1>
      <p className="text-gray-500 text-sm mb-6">Управляйте своим еженедельным расписанием и предстоящими занятиями.</p>

      {/* Week nav */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-gray-900">
          {MONTHS[weekStart.getMonth()]} {weekStart.getFullYear()}
        </span>
        <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-3 text-xs text-gray-400" />
            {weekDates.map((d, i) => (
              <div key={i} className="p-3 text-center border-l border-gray-100">
                <div className="text-xs text-gray-400">{DAYS_SHORT[d.getDay()]}</div>
                <div className="text-sm font-semibold text-gray-900">{d.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-50">
              <div className="p-3 text-xs text-gray-400 text-right pr-4">{hour}:00</div>
              {weekDates.map((d, i) => {
                const slotRequests = getRequestsForSlot(d, hour);
                return (
                  <div key={i} className="p-1 border-l border-gray-100 min-h-[60px]">
                    {slotRequests.map((req, ri) => (
                      <div
                        key={req.id}
                        className={`rounded p-1.5 border text-xs mb-1 ${COLORS[ri % COLORS.length]}`}
                      >
                        <div className="font-medium truncate">
                          {req.client?.first_name} {req.client?.last_name}
                        </div>
                        <div className="opacity-70">{req.time_slot}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
