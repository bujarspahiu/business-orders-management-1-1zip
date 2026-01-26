import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, CartItem, Product } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  cart: CartItem[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addToCart: (product: Product, quantity: number) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => boolean;
  setCartQuantityWithAutoCorrect: (productId: string, quantity: number) => number;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getAvailableStock: (product: Product) => number;
  getCartQuantityForProduct: (productId: string) => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('lassa_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('lassa_user');
      }
    }
    
    // Load cart from localStorage
    const storedCart = localStorage.getItem('lassa_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        localStorage.removeItem('lassa_cart');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lassa_cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid email or password' };
      }

      if (!data.is_active) {
        return { success: false, error: 'Your account has been disabled. Please contact administrator.' };
      }

      const userData: User = data;
      setUser(userData);
      localStorage.setItem('lassa_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('lassa_user');
    localStorage.removeItem('lassa_cart');
  };

  // Get how many items of this product are already in cart
  const getCartQuantityForProduct = (productId: string): number => {
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Get available stock (total stock minus what's already in cart)
  const getAvailableStock = (product: Product): number => {
    const inCart = getCartQuantityForProduct(product.id);
    return Math.max(0, product.stock_quantity - inCart);
  };

  const addToCart = (product: Product, quantity: number): boolean => {
    // Check stock availability
    const existingItem = cart.find(item => item.product.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + quantity;

    // Auto-correct to max stock if exceeds
    const finalQty = Math.min(newQty, product.stock_quantity);
    
    if (finalQty <= currentQty) {
      return false; // Can't add more
    }

    setCart(prevCart => {
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: finalQty }
            : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(quantity, product.stock_quantity) }];
    });

    return true;
  };

  const updateCartQuantity = (productId: string, quantity: number): boolean => {
    const item = cart.find(item => item.product.id === productId);
    if (!item) return false;

    if (quantity > item.product.stock_quantity) {
      return false; // Stock exceeded
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );

    return true;
  };

  // Auto-correct quantity to max stock and return the actual quantity set
  const setCartQuantityWithAutoCorrect = (productId: string, quantity: number): number => {
    const item = cart.find(item => item.product.id === productId);
    if (!item) return 0;

    // Auto-correct to max stock
    const maxStock = item.product.stock_quantity;
    const correctedQty = Math.min(Math.max(1, quantity), maxStock);

    if (correctedQty <= 0) {
      removeFromCart(productId);
      return 0;
    }

    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.product.id === productId
          ? { ...cartItem, quantity: correctedQty }
          : cartItem
      )
    );

    return correctedQty;
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartCount = (): number => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        cart,
        login,
        logout,
        addToCart,
        updateCartQuantity,
        setCartQuantityWithAutoCorrect,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        getAvailableStock,
        getCartQuantityForProduct,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
