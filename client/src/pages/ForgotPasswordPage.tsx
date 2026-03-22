import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const { lang, setLang, t } = useLanguage();

  // Step 1: Enter email
  // Step 2: Enter reset code + new password
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(t('resetCodeSent'));
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword,
      });
      // Auto-login after reset
      localStorage.setItem('token', res.data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.error || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
            className="flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition font-medium backdrop-blur"
          >
            {lang === 'en' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('appName')}</h1>
          <p className="text-primary-200">{t('resetYourPassword')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
          {step === 1 ? (
            /* Step 1: Enter email */
            <form onSubmit={handleRequestCode} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">{t('forgotPassword')}</h2>
              <p className="text-sm text-gray-500">{t('forgotPasswordDescription')}</p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder={t('emailPlaceholder')}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? t('sending') : t('sendResetCode')}
              </button>

              <p className="text-center text-sm text-gray-600">
                {t('rememberPassword')}{' '}
                <Link to="/login" className="text-primary-600 font-medium hover:underline">
                  {t('signIn')}
                </Link>
              </p>
            </form>
          ) : (
            /* Step 2: Enter code + new password */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">{t('enterResetCode')}</h2>

              {success && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
                  <p>{success}</p>
                  <p className="text-xs mt-1 text-green-600">{t('checkEmailForCode')}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('resetCode')}</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-center text-xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder={t('passwordMinLength')}
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder={t('confirmPasswordPlaceholder')}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-500 text-white py-2.5 rounded-lg font-medium hover:bg-accent-600 transition disabled:opacity-50"
              >
                {loading ? t('resetting') : t('resetPassword')}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                {t('tryDifferentEmail')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
