import React from 'react';
import { 
  ShoppingCart, 
  FileText, 
  Bell, 
  BarChart3, 
  Users, 
  Lock,
  Zap,
  Clock
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: 'Easy Online Ordering',
      description: 'Browse our complete catalog, add products to cart, and place orders in minutes with our intuitive interface.',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: FileText,
      title: 'Automatic Purchase Orders',
      description: 'Every order generates a professional purchase order document for your records and accounting.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Receive instant email notifications when orders are placed, confirmed, or shipped.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: BarChart3,
      title: 'Order History & Reports',
      description: 'Access your complete order history and generate reports for better business planning.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Users,
      title: 'Dedicated Account',
      description: 'Your own business account with saved company details, contact info, and order preferences.',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: Lock,
      title: 'Secure Platform',
      description: 'Enterprise-grade security protects your business data and transaction information.',
      color: 'bg-slate-100 text-slate-600',
    },
    {
      icon: Zap,
      title: 'Real-time Stock',
      description: 'Always know product availability with live stock updates preventing order issues.',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Place orders anytime, anywhere. Our platform is available around the clock.',
      color: 'bg-cyan-100 text-cyan-600',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything Your Business Needs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our B2B platform is designed to streamline your tire procurement process 
            with powerful features built for automotive businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">500+</p>
              <p className="text-gray-300">Tire Models</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">1000+</p>
              <p className="text-gray-300">B2B Partners</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">50+</p>
              <p className="text-gray-300">Countries</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">24/7</p>
              <p className="text-gray-300">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
