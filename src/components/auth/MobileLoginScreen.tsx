import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileLoginScreenProps {
  onSuccess: () => void;
}

const MobileLoginScreen: React.FC<MobileLoginScreenProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      onSuccess();
      setEmail('');
      setPassword('');
    } else {
      setError(result.error || t.loginModal.loginFailed);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'sq' ? 'en' : 'sq')}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors text-sm"
        >
          <span className="text-xs">🌐</span>
          <span>{language === 'sq' ? 'EN' : 'SQ'}</span>
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-600 rounded-2xl mb-4 shadow-lg shadow-orange-600/30">
            <span className="text-white text-2xl font-bold">LT</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Lassa Tyres</h1>
          <p className="text-gray-400 mt-1 text-sm">B2B Order Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 text-center">
            {t.loginModal.title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.loginModal.emailAddress}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-base"
                placeholder={t.loginModal.emailPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.loginModal.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-base"
                  placeholder={t.loginModal.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:bg-orange-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.loginModal.loggingIn}</span>
                </>
              ) : (
                <span>{t.loginModal.loginButton}</span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {t.loginModal.noAccount}{' '}
              <span className="text-orange-600 font-medium">
                {t.loginModal.contactUs}
              </span>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          © {new Date().getFullYear()} Lassa Tyres. {t.footer.allRightsReserved}
        </p>
      </div>
    </div>
  );
};

export default MobileLoginScreen;
