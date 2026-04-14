import { Phone, Mail, MapPin } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-72 mb-12">
        <img
          src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Pool"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-3xl font-bold mb-1">Ваш идеальный заплыв начинается здесь</h1>
          <p className="text-white/80">Весь водный мир Екатеринбурга в одном клике</p>
        </div>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
        <div>
          <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">Наша миссия</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Сделать высококачественное плавание доступным и простым.
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Мы стремимся стать главным цифровым мостом между жителями Екатеринбурга и культурой плавания. Наша цель — превратить сложный поиск бассейна и запись к тренеру в минутное дело, делая здоровый образ жизни технологичным и доступным для каждого.
          </p>
          <blockquote className="border-l-4 border-sky-300 pl-4 bg-sky-50 py-3 pr-4 rounded-r-lg text-sm text-sky-800 italic">
            «Плавание — это не просто физическая нагрузка: это медитативный способ отключиться от шума современного мира.»
          </blockquote>
        </div>
        <div>
          <img
            src="https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Swimmer"
            className="rounded-2xl h-72 w-full object-cover"
          />
        </div>
      </div>

      {/* Contacts */}
      <div id="contacts">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Контакты</h2>
        <p className="text-gray-500 text-sm mb-8">Есть вопросы о нашем сервисе? Наша команда готова вам помочь освоить.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Phone className="w-5 h-5 text-sky-600" />,
              label: 'Наш телефон',
              value: '+7 (123) 456 78-90',
              href: 'tel:+71234567890',
            },
            {
              icon: <Mail className="w-5 h-5 text-sky-600" />,
              label: 'Электронная почта',
              value: 'support@email.com',
              href: 'mailto:support@email.com',
            },
            {
              icon: <MapPin className="w-5 h-5 text-sky-600" />,
              label: 'Адрес офиса',
              value: 'г. Екатеринбург, ул. Ленина, 1',
              href: '#',
            },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mb-3">
                {c.icon}
              </div>
              <p className="text-xs text-gray-400 mb-1">{c.label}</p>
              <a href={c.href} className="text-gray-900 font-semibold text-sm hover:text-sky-600 transition-colors">
                {c.value}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
