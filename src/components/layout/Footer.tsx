import { Link } from 'react-router-dom';
import { Waves, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-8 justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Waves className="w-6 h-6 text-sky-600" />
              <span className="font-bold text-gray-900 text-lg tracking-tight">Aqua<span className="text-sky-600">Wave</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Лучший сервис бронирования бассейнов в Екатеринбурге. Тренируйтесь с комфортом.
            </p>
          </div>

          {/* Company + Help */}
          <div className="flex gap-12">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Компания</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-gray-500 hover:text-sky-600 transition-colors">О нас</Link></li>
                <li><Link to="/about#contacts" className="text-sm text-gray-500 hover:text-sky-600 transition-colors">Контакты</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Помощь</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-sm text-gray-500 hover:text-sky-600 transition-colors">FAQ</Link></li>
                <li><Link to="/faq#support" className="text-sm text-gray-500 hover:text-sky-600 transition-colors">Поддержка</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">© 2026 All rights reserved.</p>
          <Globe className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </footer>
  );
}
