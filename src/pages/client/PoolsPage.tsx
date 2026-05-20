import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Thermometer, Layers, Waves } from 'lucide-react';
import { getPools } from '../../services/pools';
import { Pool } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const fetchPools = useCallback(
    debounce(async (q: string) => {
      setLoading(true);
      try {
        const data = await getPools(q);
        setPools(data);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchPools(search);
  }, [search]);

  useEffect(() => {
    const existingScript = document.getElementById('yandex-maps-script');

    if (window.ymaps && window.ymaps.Map) {
      window.ymaps.ready(initMap);
      return;
    }

    if (existingScript) {
      const interval = setInterval(() => {
        if (window.ymaps && window.ymaps.Map) {
          clearInterval(interval);
          window.ymaps.ready(initMap);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    const script = document.createElement('script');
    script.id = 'yandex-maps-script';
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=8eeedc05-c2ec-4243-b9b2-342578db734f&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(initMap);
    };
    document.head.appendChild(script);
  }, []);

  const initMap = () => {
    const container = document.getElementById('ymap');
    if (!container) return;
    if ((container as any)._ymaps_map) {
      try { (container as any)._ymaps_map.destroy(); } catch (_) {}
    }
    try {
      const map = new window.ymaps.Map('ymap', {
        center: [56.8389, 60.6057],
        zoom: 12,
        controls: ['zoomControl'],
      });
      (container as any)._ymaps_map = map;
      setMapReady(true);

      const poolsData = [
        { name: 'Crystal Bay Center', lat: 56.8389, lng: 60.6057 },
        { name: 'Дворец водных видов спорта', lat: 56.820, lng: 60.610 },
        { name: 'Sky High Pool', lat: 56.845, lng: 60.615 },
        { name: 'Олимпийский "Кристалл"', lat: 56.830, lng: 60.595 },
        { name: 'Grand Aqua SPA', lat: 56.835, lng: 60.600 },
      ];

      poolsData.forEach((p) => {
        const placemark = new window.ymaps.Placemark(
          [p.lat, p.lng],
          { balloonContent: p.name },
          {
            preset: 'islands#blueDotIcon',
          }
        );
        map.geoObjects.add(placemark);
      });
    } catch (e) {
      console.error('Map init error', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-sky-700 via-sky-600 to-sky-500 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            Погрузитесь в атмосферу спокойствия в Екатеринбурге
          </h1>
          <p className="text-sky-100 text-sm md:text-base mb-6 leading-relaxed">
            Найдите идеальный бассейн для тренировок или отдыха. Бронируйте дорожки онлайн за считанные секунды. Записывайтесь на персональные тренировки с опытными тренерами.
          </p>
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Найти бассейн..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <Button
              variant="secondary"
              icon={<Search className="w-4 h-4" />}
              className="bg-white text-sky-700 hover:bg-sky-50"
              onClick={() => fetchPools(search)}
            >
              Поиск
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pool list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Доступные бассейны</h2>
            <span className="text-sm text-gray-500">{pools.length} бассейнов в Екатеринбурге</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="w-8 h-8" />
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Waves className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Бассейны не найдены</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pools.map((pool) => (
                <Link
                  key={pool.id}
                  to={`/pools/${pool.id}`}
                  className="group flex gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-sky-200 hover:shadow-md transition-all"
                >
                  <img
                    src={pool.image_url || 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={pool.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-sky-600 transition-colors">{pool.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pool.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{pool.address}</span>
                    </div>
                    <p className="text-sm font-semibold text-sky-600 mt-2">от {pool.price} ₽</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">На карте</h2>
            <div
              id="ymap"
              className="w-full h-96 lg:h-[520px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200"
            />
            {!mapReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
