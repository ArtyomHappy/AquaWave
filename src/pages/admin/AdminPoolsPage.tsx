import { useState, useEffect } from 'react';
import { Pencil, Plus, Thermometer, Layers, Ruler, Image as ImageIcon, X, Check } from 'lucide-react';
import { getPools, createPool, updatePool, deletePool } from '../../services/pools';
import { Pool } from '../../types';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: 500,
  lanes: 4,
  water_temp: 28,
  length: 25,
  address: '',
  lat: 56.8389,
  lng: 60.6057,
  image_url: '',
};

export function AdminPoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Pool | null>(null);

  useEffect(() => {
    getPools().then((data) => { setPools(data); setLoading(false); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const pool = await createPool(form);
      setPools((prev) => [...prev, pool]);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pool: Pool) => {
    setEditingPool(pool);
    setForm({
      name: pool.name,
      description: pool.description,
      price: pool.price,
      lanes: pool.lanes,
      water_temp: pool.water_temp,
      length: pool.length,
      address: pool.address,
      lat: pool.lat,
      lng: pool.lng,
      image_url: pool.image_url,
    });
    setEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPool) return;
    setSaving(true);
    try {
      const updated = await updatePool(editingPool.id, form);
      setPools((prev) => prev.map((p) => (p.id === editingPool.id ? updated : p)));
      setEditModal(false);
      setEditingPool(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    await deletePool(deleteModal.id);
    setPools((prev) => prev.filter((p) => p.id !== deleteModal.id));
    setDeleteModal(null);
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Управление каталогом бассейнов</h1>
      <p className="text-gray-500 text-sm mb-8">Изменяйте информацию о бассейнах и добавляйте новые бассейны в каталог.</p>

      {/* Pool list */}
      <div className="space-y-4 mb-10">
        {pools.map((pool) => (
          <div key={pool.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base mb-1">{pool.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{pool.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {pool.lanes} дорожки</span>
                  <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> Длина - {pool.length}м</span>
                  <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> {pool.water_temp}°C</span>
                  <span>{pool.price} ₽/сеанс</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-gray-900">{pool.price} ₽</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Button size="sm" variant="outline" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => handleEdit(pool)}>
                Редактировать
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" icon={<X className="w-3.5 h-3.5" />} onClick={() => setDeleteModal(pool)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new pool form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Добавить новый бассейн</h2>
        <p className="text-sm text-gray-500 mb-5">Зарегистрируйте новый бассейн.</p>

        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Название бассейна"
                  placeholder="Название бассейна"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Цена за сеанс (РУБ)"
                  type="number"
                  placeholder="500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  required
                />
              </div>
              <Textarea
                label="О бассейне"
                placeholder="Опишите основные характеристики бассейна и его особенности..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <Input
                label="Адрес"
                placeholder="ул. Ленина, 1, Екатеринбург"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Кол-во дорожек"
                  type="number"
                  placeholder="4"
                  value={form.lanes}
                  onChange={(e) => setForm({ ...form, lanes: Number(e.target.value) })}
                />
                <Input
                  label="Температура воды (°C)"
                  type="number"
                  placeholder="28"
                  value={form.water_temp}
                  onChange={(e) => setForm({ ...form, water_temp: Number(e.target.value) })}
                />
                <Input
                  label="Длина бассейна (м)"
                  type="number"
                  placeholder="25"
                  value={form.length}
                  onChange={(e) => setForm({ ...form, length: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Изображение</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400 h-40">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">Загрузить изображение</span>
              </div>
              <Input
                className="mt-2"
                placeholder="или вставьте URL изображения"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1 text-center">Максимальный размер: 10МБ</p>
            </div>
          </div>

          <div className="mt-5 flex justify-start">
            <Button type="submit" loading={saving} icon={<Plus className="w-4 h-4" />}>
              Добавить бассейн
            </Button>
          </div>
        </form>
      </div>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Редактировать бассейн">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Описание" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Цена" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <Input label="Адрес" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Дорожки" type="number" value={form.lanes} onChange={(e) => setForm({ ...form, lanes: Number(e.target.value) })} />
            <Input label="Температура" type="number" value={form.water_temp} onChange={(e) => setForm({ ...form, water_temp: Number(e.target.value) })} />
            <Input label="Длина" type="number" value={form.length} onChange={(e) => setForm({ ...form, length: Number(e.target.value) })} />
          </div>
          <Input label="URL изображения" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setEditModal(false)}>Отмена</Button>
            <Button type="submit" loading={saving} icon={<Check className="w-4 h-4" />}>Сохранить</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Удалить бассейн">
        <p className="text-sm text-gray-600 mb-4">Вы уверены, что хотите удалить бассейн «{deleteModal?.name}»?</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteModal(null)}>Отмена</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>Удалить</Button>
        </div>
      </Modal>
    </div>
  );
}
