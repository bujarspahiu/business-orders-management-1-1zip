import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
              {t.contact.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {t.contact.title}
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {t.contact.description}
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{t.contact.email}</h4>
                  <p className="text-gray-600">b2b@lassatires.com</p>
                  <p className="text-gray-600">support@lassatires.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Phone className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{t.contact.phone}</h4>
                  <p className="text-gray-600">+90 262 316 50 00</p>
                  <p className="text-gray-600">{t.contact.workingHours}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{t.contact.headquarters}</h4>
                  <p className="text-gray-600">Brisa Bridgestone Sabanci</p>
                  <p className="text-gray-600">Izmit, Kocaeli, Turkey</p>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="mt-12">
              <img
                src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982837014_7fe60ac7.png"
                alt="Lassa Tyres"
                className="h-12 w-auto"
              />
              <p className="text-gray-500 mt-2 text-sm">{t.contact.tagline}</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {t.contact.formTitle}
            </h3>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.contact.thankYou}
                </h4>
                <p className="text-gray-600">
                  {t.contact.successMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.contact.fullName}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.contact.emailAddress}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.contact.companyName}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.contact.phoneNumber}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.contact.message}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    placeholder={t.contact.messagePlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>{t.contact.submitting}</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t.contact.submit}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
