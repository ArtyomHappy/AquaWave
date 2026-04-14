import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { updateProfile } from '../../services/profiles';
import { supabase } from '../../lib/supabase';

async function deleteAccountViaEdgeFunction() {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка удаления аккаунта');
}
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export function ProfileSettingsPage() {
  const { profile, setProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updateProfile(profile.id, {
        first_name: form.first_name,
        last_name: form.last_name,
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop();
    const fileName = `avatars/${profile.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    if (uploadError) { setError(uploadError.message); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const updated = await updateProfile(profile.id, { avatar_url: data.publicUrl });
    setProfile(updated);
  };

  const handleDelete = async () => {
    try {
      await deleteAccountViaEdgeFunction();
    } catch (err: any) {
      setError(err.message);
      setDeleteModal(false);
      return;
    }
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Настройки профиля</h1>
      <p className="text-gray-500 text-sm mb-8">Обновите информацию о себе и фотографию профиля</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Фотография профиля</h2>
            <div className="relative inline-block">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-24 h-24 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-sky-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-sky-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-sky-700 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="mt-2 space-y-1">
              <Button variant="secondary" size="sm" className="w-full">Изменить</Button>
              <p className="text-xs text-gray-400 text-center">JPG, PNG. Максимальный размер: 800KB</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Имя"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Анна"
                />
                <Input
                  label="Фамилия"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Кузнецова"
                />
              </div>
              <Input
                label="Адрес электронной почты"
                type="email"
                value={form.email}
                disabled
                className="bg-gray-50"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>
              )}
              {saved && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
                  Изменения сохранены
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
                  Отменить изменения
                </Button>
                <Button type="submit" loading={saving}>
                  Сохранить изменения
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete account */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-red-600 mb-1">Удалить аккаунт</h2>
            <p className="text-sm text-gray-500">Навсегда удалите свой аккаунт и все связанные данные.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>
            Удалить
          </Button>
        </div>
      </div>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Удаление аккаунта">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Вы уверены?</h3>
            <p className="text-sm text-gray-500">
              Это действие необратимо. Все ваши данные будут удалены.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModal(false)}>
              Отмена
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
