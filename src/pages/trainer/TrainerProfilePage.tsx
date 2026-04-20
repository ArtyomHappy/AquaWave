import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getTrainerByUserId, updateTrainer } from '../../services/trainers';
import { Trainer } from '../../types';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

export function TrainerProfilePage() {
  const { profile } = useAuthStore();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bio: '', specialization: '', experience: 1, price_per_hour: 2500 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      getTrainerByUserId(profile.id).then((data) => {
        setTrainer(data);
        if (data) {
          setForm({
            bio: data.bio,
            specialization: data.specialization,
            experience: data.experience,
            price_per_hour: data.price_per_hour,
          });
        }
        setLoading(false);
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer) return;
    setSaving(true);
    try {
      const updated = await updateTrainer(trainer.id, form);
      setTrainer(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Редактирование информации профиля</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Основная информация</h2>
            <Textarea
              placeholder="Расскажите о себе как о тренере..."
              rows={6}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Сфера обучения</h2>
              <div className="relative">
                <Input
                  placeholder="Скоростное плавание"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Опыт (в годах)</h2>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                  className="w-full pl-10 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Цена за час</h2>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₽</span>
              <input
                type="number"
                min={0}
                value={form.price_per_hour}
                onChange={(e) => setForm({ ...form, price_per_hour: Number(e.target.value) })}
                className="w-full pl-10 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
              Изменения сохранены
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Сохранить изменения</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
