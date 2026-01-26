import React from 'react';
import { ShoppingCart, User, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onLoginClick: () => void;
  onCartClick: () => void;
  cartCount: number;
  isAuthenticated: boolean;
  userRole?: 'admin' | 'user';
  onDashboardClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onLoginClick,
  onCartClick,
  cartCount,
  isAuthenticated,
  userRole,
  onDashboardClick,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'sq' ? 'en' : 'sq');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982837014_7fe60ac7.png"
              alt="Lassa Tyres"
              className="h-8 md:h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('products')}
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              {t.header.products}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              {t.header.about}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              {t.header.contact}
            </button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium text-sm"
              title={language === 'sq' ? 'Switch to English' : 'Kalo në Shqip'}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language === 'sq' ? 'EN' : 'SQ'}</span>
            </button>

            {isAuthenticated && userRole === 'user' && (
              <button
                onClick={onCartClick}
                className="relative p-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onDashboardClick}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
                  <span>{userRole === 'admin' ? t.header.adminPanel : t.header.dashboard}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
                >
                  {t.header.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t.header.businessLogin}</span>
                <span className="sm:hidden">{t.header.login}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => scrollToSection('products')}
                className="px-4 py-2 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors"
              >
                {t.header.products}
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="px-4 py-2 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors"
              >
                {t.header.about}
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-4 py-2 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors"
              >
                {t.header.contact}
              </button>
              {/* Mobile Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'sq' ? 'English' : 'Shqip'}</span>
              </button>
              {isAuthenticated && (
                <button
                  onClick={onDashboardClick}
                  className="px-4 py-2 text-left text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors sm:hidden"
                >
                  {userRole === 'admin' ? t.header.adminPanel : t.header.dashboard}
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
