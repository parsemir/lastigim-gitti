import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const { register } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err: any) {
      setError(err.response?.data?.error || t('registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
            className="flex items-center gap-1.5 text-sm bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full transition font-medium shadow-sm"
          >
            {lang === 'en' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
          </button>
        </div>

        <div className="text-center mb-6 animate-fade-in-up">
          <Logo size="md" className="mx-auto mb-3" />
          <h1 className="text-3xl font-black text-gray-800">Lastiğim Gitti</h1>
          <p className="text-gray-500 text-sm mt-1">{t('appTaglineRegister')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 space-y-5 animate-fade-in-up delay-100"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('createAccount')}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {lang === 'tr' ? 'Topluluğa katılın' : 'Join the community'}
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('fullName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-enhanced"
              placeholder={t('namePlaceholder')}
              required
            />
          </div>

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
              placeholder={t('passwordMinLength')}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white py-3.5 rounded-xl font-semibold hover:from-accent-600 hover:to-accent-600 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('creatingAccount')}
              </span>
            ) : t('createAccount')}
          </button>

          <p className="text-center text-sm text-gray-600">
            {t('hasAccount')}{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition">
              {t('signIn')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
