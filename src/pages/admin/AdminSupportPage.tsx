import { useState, useEffect } from 'react';
import { Send, Image as ImageIcon, Clock } from 'lucide-react';
import { getAllSupportRequests, replyToSupportRequest } from '../../services/support';
import { SupportRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 60;
  if (diff < 60) return `${Math.round(diff)} мин. назад`;
  if (diff < 1440) return `${Math.round(diff / 60)} ч. назад`;
  return `${Math.round(diff / 1440)} д. назад`;
}

export function AdminSupportPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    getAllSupportRequests().then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  const handleReply = async (id: string) => {
    const reply = replies[id];
    if (!reply?.trim()) return;
    setSending(id);
    try {
      const updated = await replyToSupportRequest(id, reply);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      setReplies((prev) => ({ ...prev, [id]: '' }));
    } finally {
      setSending(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Обращения в поддержку</h1>
      <p className="text-gray-500 text-sm mb-8">Обрабатывайте и разрешайте запросы пользователей.</p>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Send className="w-10 h-10 mx-auto mb-3" />
          <p>Нет обращений в поддержку</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {req.user?.first_name} {req.user?.last_name}
                    </h3>
                    <Badge variant={req.status === 'open' ? 'warning' : 'success'}>
                      {req.status === 'open' ? 'Открыто' : 'Закрыто'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {timeAgo(req.created_at)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Тема: {req.subject}</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 italic">
                  "{req.message}"
                </div>
              </div>

              {req.admin_reply && (
                <div className="mb-4 bg-sky-50 border border-sky-100 rounded-lg p-4">
                  <p className="text-xs font-medium text-sky-700 mb-1">Ответ администратора:</p>
                  <p className="text-sm text-sky-800">{req.admin_reply}</p>
                </div>
              )}

              {req.status === 'open' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Ответ пользователю</label>
                  <textarea
                    rows={3}
                    placeholder="Введите свой ответ здесь..."
                    value={replies[req.id] || ''}
                    onChange={(e) => setReplies((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <Button
                      size="sm"
                      icon={<Send className="w-3.5 h-3.5" />}
                      loading={sending === req.id}
                      onClick={() => handleReply(req.id)}
                    >
                      Отправить →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
