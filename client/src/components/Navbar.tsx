import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'text-white bg-primary-700' : 'text-primary-100 hover:bg-primary-500';

  return (
    <nav className="bg-primary-600 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('appName')}
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Link to="/" className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${isActive('/')}`}>
                {t('map')}
              </Link>
              <Link to="/feed" className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${isActive('/feed')}`}>
                {t('feed')}
              </Link>
              <Link to="/report" className={`px-3 py-1.5 rounded-md text-sm font-medium transition bg-accent-500 hover:bg-accent-600 text-white`}>
                {t('report')}
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${isActive('/admin')}`}>
                  {t('admin')}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
              className="flex items-center gap-1 text-xs bg-primary-700 hover:bg-primary-800 text-white px-2 py-1 rounded-md transition font-medium"
              title={lang === 'en' ? 'Türkçe\'ye geç' : 'Switch to English'}
            >
              {lang === 'en' ? '🇹🇷 TR' : '🇬🇧 EN'}
            </button>
            <span className="text-primary-100 text-sm hidden sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="text-primary-200 hover:text-white text-sm font-medium"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
