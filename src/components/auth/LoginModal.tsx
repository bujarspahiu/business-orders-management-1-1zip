import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);

    if (result.success) {
      onSuccess();
      onClose();
      setUsername('');
      setPassword('');
    } else {
      setError(result.error || t.loginModal.loginFailed);
    }

    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.loginModal.title} size="sm">
      <div className="p-6">
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
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {t.loginModal.noAccount}{' '}
            <button
              onClick={onClose}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              {t.loginModal.contactUs}
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-2">{t.loginModal.demoCredentials}</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>{t.loginModal.admin}:</strong> Admin / Admin</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
