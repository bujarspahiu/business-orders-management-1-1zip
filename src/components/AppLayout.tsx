import React from 'react';

import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import ProductShowcase from '@/components/landing/ProductShowcase';
import About from '@/components/landing/About';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

const AppLayout: React.FC = () => {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <Hero onExploreClick={scrollToProducts} />
        <ProductShowcase />
        <About />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default AppLayout;
