import { useState } from 'react';
import { ChevronDown, Send, Wifi, Mail, Phone } from 'lucide-react';
import { createSupportRequest } from '../../services/support';
import { useAuthStore } from '../../store/authStore';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const FAQ_ITEMS = [
  {
    q: 'Как перенести бронирование бассейна на другое время?',
    a: 'Вы можете перенести любое бронирование за 24 часа до назначенного времени. Просто перейдите в «Настройки профиля» и выберите бронирование, которое хотите изменить или отменить.',
  },
  {
    q: 'Каковы правила отмены бронирования?',
    a: 'При отмене бронирования более чем за 24 часа производится полный возврат средств. При отмене за 5–24 часа предоставляется 70% от стоимости. При отмене менее чем за 5 часов возврат средств не производится.',
  },
  {
    q: 'Есть ли в наличии профессиональные тренеры?',
    a: 'Да. Сервис сотрудничает с сертифицированными инструкторами по плаванию. Вы можете просмотреть их профили в разделе «Тренеры» и записаться на индивидуальные занятия с подходящим тренером.',
  },
  {
    q: 'Показывается ли актуальная загруженность бассейнов?',
    a: 'Да, загруженность бассейнов обновляется в режиме реального времени.',
  },
];

export function FAQPage() {
  const { profile } = useAuthStore();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) { setError('Необходимо войти в аккаунт'); return; }
    if (!form.subject || !form.message) { setError('Заполните все поля'); return; }
    setSending(true);
    setError('');
    try {
      await createSupportRequest({ user_id: profile.id, subject: form.subject, message: form.message });
      setSent(true);
      setForm({ subject: '', message: '' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла неизвестная ошибка');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-sky-600 mb-3">Чем мы можем вам помочь?</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Воспользуйтесь нашей базой часто задаваемых вопросов или свяжитесь со специализированной службой поддержки.
        </p>
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Часто задаваемые вопросы</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-medium text-gray-900 text-sm pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Support form + info */}
      <section id="support">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Поддержка</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800 mb-1">Сообщение отправлено!</h3>
                <p className="text-green-700 text-sm">Мы ответим вам в течение 5–10 минут.</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setSent(false)}>
                  Отправить ещё
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <Input
                  label="Тема вопроса"
                  placeholder="Введите тему вопроса..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
                <Textarea
                  label="Сообщение вопроса"
                  placeholder="Расскажите подробнее о том, как мы можем помочь..."
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                {error && (
                  <div className="text-sm text-red-500">{error}</div>
                )}
                <Button type="submit" className="w-full" loading={sending} icon={<Send className="w-4 h-4" />}>
                  Отправить сообщение
                </Button>
              </form>
            )}
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="bg-sky-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-semibold">СТАТУС ПОДДЕРЖКИ: В СЕТИ</span>
              </div>
              <p className="text-sky-100 text-xs">Примерное время ответа: 5–10 минут</p>
            </div>

            <div className="bg-emerald-500 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-semibold">Электронная почта поддержки</span>
              </div>
              <p className="text-emerald-100 text-sm">support@email.com</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-900">Телефон поддержки</span>
              </div>
              <p className="text-gray-600 text-sm">+7(823)456-78-90</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
