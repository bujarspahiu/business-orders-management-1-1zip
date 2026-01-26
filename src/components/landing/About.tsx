import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982835144_ec91ce07.jpg"
                alt="Lassa Tire Manufacturing"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 max-w-xs hidden md:block">
              <div className="flex items-center space-x-4">
                <img
                  src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982838635_5740439c.png"
                  alt="TUV Certified"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <p className="font-semibold text-gray-900">{t.about.tuvCertified}</p>
                  <p className="text-sm text-gray-600">{t.about.qualitySafety}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
              {t.about.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {t.about.title}
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {t.about.description1}
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {t.about.description2}
            </p>

            {/* Benefits List */}
            <div className="grid sm:grid-cols-2 gap-3">
              {t.about.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
