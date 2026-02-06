import React from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Header: React.FC = () => {
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
          <div className="flex items-center">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982837014_7fe60ac7.png"
              alt="Lassa Tyres"
              className="h-8 md:h-10 w-auto"
            />
          </div>

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

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium text-sm"
              title={language === 'sq' ? 'Switch to English' : 'Kalo në Shqip'}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language === 'sq' ? 'EN' : 'SQ'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

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
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'sq' ? 'English' : 'Shqip'}</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
