import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { signIn } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await signIn(form.email, form.password);
      if (user) {
        await fetchProfile(user.id);
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Неверный email или пароль' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Вход в аккаунт</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Адрес электронной почты"
                type="email"
                placeholder="name@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <div>
                <Input
                  label="Пароль"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <div className="flex justify-end mt-1">
                  <button type="button" className="text-xs text-sky-600 hover:text-sky-700">
                    Забыли пароль?
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Войти
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Ещё нет аккаунта?{' '}
              <Link to="/auth/register" className="text-sky-600 font-medium hover:text-sky-700">
                Зарегистрируйтесь
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
