import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award } from 'lucide-react';
import { getTrainers } from '../../services/trainers';
import { Trainer } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const TRAINER_AVATARS = [
  'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrainers().then((data) => {
      setTrainers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner className="w-8 h-8" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Наши тренеры</h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Познакомьтесь с нашей командой профессионалов. Мы объединяем опыт, методику и страсть к плаванию, чтобы вы достигали своих целей в воде.
        </p>
      </div>

      {trainers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3" />
          <p>Тренеры скоро появятся</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer, idx) => {
            const profile = trainer.profile;
            const avatar = trainer.avatar_url || profile?.avatar_url || TRAINER_AVATARS[idx % TRAINER_AVATARS.length];
            const name = profile ? `${profile.first_name} ${profile.last_name}` : 'Тренер';
            return (
              <div key={trainer.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative h-48 bg-gradient-to-br from-sky-100 to-sky-200">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    variant="info"
                    className="absolute top-3 left-3 shadow-sm"
                  >
                    Мастер спорта
                  </Badge>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
                  <p className="text-sky-600 text-sm font-medium mb-3">{trainer.specialization || 'Плавание — спринт'}</p>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed">{trainer.bio || 'Профессиональный тренер по плаванию с многолетним опытом работы.'}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Опыт {trainer.experience} лет
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{trainer.price_per_hour.toLocaleString()} ₽ <span className="text-sm font-normal text-gray-400">/ час</span></span>
                    <Link to={`/trainers/${trainer.id}`}>
                      <Button size="sm">Записаться</Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
