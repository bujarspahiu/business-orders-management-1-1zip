import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { label: t.footer.summerTires, href: '#products' },
      { label: t.footer.winterTires, href: '#products' },
      { label: t.footer.allSeasonTires, href: '#products' },
      { label: t.footer.suvTires, href: '#products' },
      { label: t.footer.commercialTires, href: '#products' },
    ],
    company: [
      { label: t.footer.aboutUs, href: '#about' },
      { label: t.footer.ourTechnology, href: '#about' },
      { label: t.footer.qualityStandards, href: '#about' },
      { label: t.footer.sustainability, href: '#about' },
      { label: t.footer.careers, href: '#contact' },
    ],
    support: [
      { label: t.footer.contactUs, href: '#contact' },
      { label: t.footer.b2bPortal, href: '#' },
      { label: t.footer.tireGuide, href: '#products' },
      { label: t.footer.faq, href: '#about' },
      { label: t.footer.warranty, href: '#about' },
    ],
    legal: [
      { label: t.footer.privacyPolicy, href: '#' },
      { label: t.footer.termsOfService, href: '#' },
      { label: t.footer.cookiePolicy, href: '#' },
      { label: t.footer.gdpr, href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#') && href.length > 1) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982837836_78284b5f.png"
              alt="Lassa Tyres"
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm mb-6">
              {t.footer.tagline}
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 bg-slate-800 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t.footer.products}</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t.footer.company}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t.footer.support}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <img
                src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982838635_5740439c.png"
                alt="TUV Certified"
                className="h-12 w-auto opacity-80"
              />
              <div className="text-sm text-gray-400">
                <p className="font-medium text-gray-300">{t.footer.certifiedIso}</p>
                <p>{t.footer.qualityManagement}</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <p>{t.footer.etrma}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Lassa Tyres. {t.footer.allRightsReserved}
            </p>
            <p className="text-gray-500 text-sm">
              {t.footer.brand}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
