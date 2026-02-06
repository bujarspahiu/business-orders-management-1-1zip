import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import ProductShowcase from '@/components/landing/ProductShowcase';
import About from '@/components/landing/About';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';
import LoginModal from '@/components/auth/LoginModal';
import MobileLoginScreen from '@/components/auth/MobileLoginScreen';

import UserDashboard from '@/components/user/UserDashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import CartDrawer from '@/components/user/CartDrawer';

const isNativeApp = typeof (window as any)?.Capacitor !== 'undefined' && (window as any)?.Capacitor?.isNativePlatform?.();

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout, getCartCount } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(isNativeApp);

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    logout();
    setShowDashboard(isNativeApp);
  };

  const handleDashboardClick = () => {
    setShowDashboard(true);
  };

  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isNativeApp) {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        return <AdminDashboard onLogout={handleLogout} />;
      }
      return <UserDashboard onLogout={handleLogout} />;
    }
    return <MobileLoginScreen onSuccess={handleLoginSuccess} />;
  }

  if (isAuthenticated && showDashboard) {
    if (user?.role === 'admin') {
      return <AdminDashboard onLogout={handleLogout} />;
    }
    return <UserDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setLoginModalOpen(true)}
        onCartClick={() => setCartOpen(true)}
        cartCount={getCartCount()}
        isAuthenticated={isAuthenticated}
        userRole={user?.role}
        onDashboardClick={handleDashboardClick}
        onLogout={handleLogout}
      />

      <main>
        <Hero
          onLoginClick={() => setLoginModalOpen(true)}
          onExploreClick={scrollToProducts}
        />
        <ProductShowcase onLoginClick={() => setLoginModalOpen(true)} />
        <About />
        <Contact />
      </main>

      <Footer />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {isAuthenticated && user?.role === 'user' && (
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            setShowDashboard(true);
          }}
        />
      )}
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default AppLayout;
