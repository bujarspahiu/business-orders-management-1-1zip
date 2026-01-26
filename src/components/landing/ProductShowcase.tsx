import React from 'react';
import { Snowflake, Sun, Cloud, Car, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductShowcaseProps {
  onLoginClick: () => void;
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onLoginClick }) => {
  const { t } = useLanguage();

  const categories = [
    {
      title: t.productShowcase.summerTires,
      description: t.productShowcase.summerDescription,
      icon: Sun,
      image: 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982835144_ec91ce07.jpg',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: t.productShowcase.winterTires,
      description: t.productShowcase.winterDescription,
      icon: Snowflake,
      image: 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982832385_02f594f4.jpg',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: t.productShowcase.allSeasonTires,
      description: t.productShowcase.allSeasonDescription,
      icon: Cloud,
      image: 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982833170_e665fe07.jpg',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  const vehicleTypes = [
    {
      title: t.productShowcase.passengerCars,
      icon: Car,
      image: 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982835144_ec91ce07.jpg',
      count: `200+ ${t.productShowcase.models}`,
    },
    {
      title: t.productShowcase.suv4x4,
      icon: Truck,
      image: 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982835901_eeb3b69b.jpg',
      count: `150+ ${t.productShowcase.models}`,
    },
    {
      title: t.productShowcase.commercialVehicles,
      icon: Truck,
      image: 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982834339_c435c362.jpg',
      count: `80+ ${t.productShowcase.models}`,
    },
  ];

  return (
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
            {t.productShowcase.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t.productShowcase.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.productShowcase.description}
          </p>
        </div>

        {/* Season Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80`} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="flex items-center space-x-3 mb-3">
                  <category.icon className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">{category.title}</h3>
                </div>
                <p className="text-white/90">{category.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle Types */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t.productShowcase.vehicleTypesTitle}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {vehicleTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={type.image}
                    alt={type.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{type.title}</h4>
                  <p className="text-orange-600 font-medium">{type.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

    </section>
  );
};

export default ProductShowcase;
