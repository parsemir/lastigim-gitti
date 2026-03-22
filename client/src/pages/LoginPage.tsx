import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          {/* Road illustration */}
          <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 800 200" fill="none">
            <path d="M0 200L200 120L400 160L600 80L800 140V200H0Z" fill="white" />
            <rect x="180" y="135" width="40" height="6" rx="3" fill="#FCD34D" opacity="0.5" />
            <rect x="380" y="155" width="40" height="6" rx="3" fill="#FCD34D" opacity="0.5" />
            <rect x="580" y="100" width="40" height="6" rx="3" fill="#FCD34D" opacity="0.5" />
          </svg>
        </div>

        <div className="relative z-10 text-center animate-fade-in-up">
          <Logo size="lg" className="mx-auto mb-6 animate-float" />
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            Lastiğim Gitti
          </h1>
          <p className="text-primary-200 text-lg max-w-md leading-relaxed">
            {lang === 'tr'
              ? "İzmir'in yollarını birlikte düzeltelim. Çukurları bildirin, oy verin, takip edin."
              : "Let's fix İzmir's roads together. Report potholes, vote, and track repairs."
            }
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { num: '500+', label: lang === 'tr' ? 'Rapor' : 'Reports' },
              { num: '120+', label: lang === 'tr' ? 'Onarıldı' : 'Fixed' },
              { num: '2K+', label: lang === 'tr' ? 'Kullanıcı' : 'Users' },
            ].map((stat, i) => (
              <div key={i} className={`animate-fade-in-up delay-${(i + 1) * 100}`}>
                <p className="text-3xl font-bold text-white">{stat.num}</p>
                <p className="text-primary-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Language toggle */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
              className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition font-medium"
            >
              {lang === 'en' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
            </button>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-up">
            <Logo size="md" className="mx-auto mb-3" />
            <h1 className="text-3xl font-black text-gray-800">Lastiğim Gitti</h1>
            <p className="text-gray-500 text-sm mt-1">{t('appTaglineLogin')}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 space-y-5 animate-fade-in-up delay-100"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{t('signIn')}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {lang === 'tr' ? 'Hesabınıza giriş yapın' : 'Welcome back to your account'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 animate-scale-in flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-enhanced"
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-enhanced"
                placeholder={t('passwordPlaceholder')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('signingIn')}
                </span>
              ) : t('signIn')}
            </button>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition">
                {t('forgotPassword')}
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">
                  {lang === 'tr' ? 'veya' : 'or'}
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-accent-500 font-semibold hover:text-accent-600 transition">
                {t('signUp')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
