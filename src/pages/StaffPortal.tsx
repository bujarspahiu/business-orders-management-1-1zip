import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, AlertCircle, Loader2, Globe, ArrowLeft } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserDashboard from '@/components/user/UserDashboard';

const StaffPortalContent: React.FC = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'sq' ? 'en' : 'sq');
  };

  const handleLogout = () => {
    logout();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(username, password);

    if (result.success) {
      setUsername('');
      setPassword('');
    } else {
      setError(result.error || t.loginModal.loginFailed);
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <AdminDashboard onLogout={handleLogout} />;
    }
    return <UserDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 left-4">
        <a
          href="/"
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.staffPortal.backToSite}</span>
        </a>
      </div>

      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors text-sm"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'sq' ? 'EN' : 'SQ'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982837014_7fe60ac7.png"
            alt="Lassa Tyres"
            className="h-10 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">
            {t.staffPortal.title}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {t.staffPortal.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            {t.loginModal.title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.loginModal.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder={t.loginModal.usernamePlaceholder}
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder={t.loginModal.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.loginModal.loggingIn}</span>
                </>
              ) : (
                <span>{t.loginModal.loginButton}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">{t.loginModal.demoCredentials}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-gray-700 mb-1">👔 {t.loginModal.admin}</p>
                <p className="text-xs text-gray-500">admin / admin123</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-gray-700 mb-1">🏪 {t.loginModal.user}</p>
                <p className="text-xs text-gray-500">user / user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffPortal: React.FC = () => {
  return (
    <AuthProvider>
      <StaffPortalContent />
    </AuthProvider>
  );
};

export default StaffPortal;
