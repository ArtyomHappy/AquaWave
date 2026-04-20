import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getTrainerByUserId, getTrainerRequests, updateRequestStatus } from '../../services/trainers';
import { TrainingRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

export function TrainerRequestsPage() {
  const { profile } = useAuthStore();
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    getTrainerByUserId(profile.id).then((trainer) => {
      if (trainer) {
        getTrainerRequests(trainer.id).then((reqs) => {
          setRequests(reqs);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [profile]);

  const handleUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id);
    try {
      const updated = await updateRequestStatus(id, status);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r)));
    } finally {
      setUpdating(null);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const processed = requests.filter((r) => r.status !== 'pending');

  if (loading) return <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Запросы на запись</h1>
      <p className="text-gray-500 text-sm mb-6">Обрабатывайте запросы клиентов.</p>

      {/* Pending count banner */}
      {pending.length > 0 && (
        <div className="flex items-center justify-between bg-sky-600 text-white rounded-xl p-5 mb-6">
          <div>
            <div className="font-semibold">Ожидают рассмотрения</div>
            <div className="text-sky-100 text-sm">У вас {pending.length} новых запросов, ожидающих подтверждения.</div>
          </div>
          <div className="text-4xl font-bold">{pending.length}</div>
        </div>
      )}

      {pending.length === 0 && processed.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle className="w-10 h-10 mx-auto mb-3" />
          <p>Нет запросов на запись</p>
        </div>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="space-y-4 mb-8">
          {pending.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {req.client?.first_name} {req.client?.last_name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(req.date).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {req.time_slot}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    icon={<CheckCircle className="w-4 h-4" />}
                    loading={updating === req.id}
                    onClick={() => handleUpdate(req.id, 'approved')}
                  >
                    Подтвердить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<XCircle className="w-4 h-4" />}
                    loading={updating === req.id}
                    onClick={() => handleUpdate(req.id, 'rejected')}
                  >
                    Отклонить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processed requests */}
      {processed.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Обработанные</h2>
          <div className="space-y-3">
            {processed.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between opacity-70">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    {req.client?.first_name} {req.client?.last_name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>{req.date}</span>
                    <span>{req.time_slot}</span>
                  </div>
                </div>
                <Badge variant={req.status === 'approved' ? 'success' : 'error'}>
                  {req.status === 'approved' ? 'Подтверждено' : 'Отклонено'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
