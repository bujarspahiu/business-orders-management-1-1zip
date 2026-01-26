import React from 'react';
import { ArrowRight, Shield, Truck, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroProps {
  onLoginClick: () => void;
  onExploreClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onLoginClick, onExploreClick }) => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982831203_b8524095.jpg"
          alt="Lassa Tires Performance"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-orange-600/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982838635_5740439c.png"
              alt="TUV Certified"
              className="h-6 w-auto"
            />
            <span className="text-orange-400 text-sm font-medium">{t.hero.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t.hero.headline}{' '}
            <span className="text-orange-500">{t.hero.headlineHighlight}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
            {t.hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={onExploreClick}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-semibold text-lg shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50"
            >
              <span>{t.hero.exploreProducts}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>


          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <Shield className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-white font-semibold">{t.hero.qualityGuaranteed}</p>
                <p className="text-gray-400 text-sm">{t.hero.isoCertified}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <Truck className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-white font-semibold">{t.hero.fastDelivery}</p>
                <p className="text-gray-400 text-sm">{t.hero.nationwide}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <Award className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-white font-semibold">{t.hero.b2bPricing}</p>
                <p className="text-gray-400 text-sm">{t.hero.wholesaleRates}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
};

export default Hero;
