import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { updateBookingStatus } from '../../services/bookings';
import { Pool, Booking } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

type PayMethod = 'card' | 'sbp';

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pool, booking } = (location.state || {}) as { pool: Pool; booking: Booking };
  const [method, setMethod] = useState<PayMethod>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!pool || !booking) {
    navigate('/pools');
    return null;
  }

  const handlePay = async () => {
    if (method === 'card') {
      if (!card.number.replace(/\s/g, '') || card.number.replace(/\s/g, '').length < 16) {
        setError('Введите корректный номер карты');
        return;
      }
      if (!card.expiry || !card.cvc) {
        setError('Заполните все поля карты');
        return;
      }
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    try {
      await updateBookingStatus(booking.id, 'paid');
      setSuccess(true);
    } catch {
      setError('Ошибка оплаты. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Оплата прошла успешно!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Бронирование подтверждено. Ждём вас в {pool.name} {booking.date} в {booking.time_slot}.
          </p>
          <Button className="w-full" onClick={() => navigate('/profile')}>
            Перейти в личный кабинет
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Выберите способ оплаты</h1>
      <p className="text-gray-500 text-sm mb-8">Выберите удобный для вас способ оплаты вашего бронирования.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Payment methods */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card */}
          <div
            className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${method === 'card' ? 'border-sky-500 bg-sky-50/50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => setMethod('card')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Банковская карта</div>
                  <div className="text-xs text-gray-500">Visa, Mastercard</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 transition-colors ${method === 'card' ? 'border-sky-600 bg-sky-600' : 'border-gray-300'}`}>
                {method === 'card' && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
              </div>
            </div>

            {method === 'card' && (
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <Input
                  label="Номер карты"
                  placeholder="0000 0000 0000 0000"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                  maxLength={19}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Срок действия"
                    placeholder="ММ/ГГ"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    maxLength={5}
                  />
                  <Input
                    label="CVC"
                    placeholder="•••"
                    type="password"
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    maxLength={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SBP */}
          <div
            className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${method === 'sbp' ? 'border-sky-500 bg-sky-50/50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => setMethod('sbp')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">СБП</div>
                  <div className="text-xs text-gray-500">Отсканируйте QR-код через банковское приложение</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 transition-colors ${method === 'sbp' ? 'border-sky-600 bg-sky-600' : 'border-gray-300'}`}>
                {method === 'sbp' && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
              </div>
            </div>

            {method === 'sbp' && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col items-center gap-3">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-400">
                    <Smartphone className="w-8 h-8 mx-auto mb-1" />
                    <div className="text-xs">QR-код</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">Откройте приложение банка, чтобы отсканировать QR-код</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Описание заказа</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Посещение бассейна «{pool.name}»</span>
                <span>{pool.price} ₽</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Дата</span>
                <span>{booking.date}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Время</span>
                <span>{booking.time_slot}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                <span>ИТОГОВАЯ СУММА</span>
                <span className="text-sky-600">{pool.price} ₽</span>
              </div>
            </div>

            <Button className="w-full mb-3" size="lg" loading={loading} onClick={handlePay}>
              Оплатить {pool.price} ₽
            </Button>
            <p className="text-xs text-center text-gray-400">
              Подтверждая оплату, вы соглашаетесь с условиями предоставления услуг
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
