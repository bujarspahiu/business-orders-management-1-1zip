import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateCartQuantity, setCartQuantityWithAutoCorrect, removeFromCart, getCartTotal, getCartCount } = useAuth();
  const { t } = useLanguage();
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Check if + button should be disabled (at max stock)
  const isPlusDisabled = (productId: string, currentQty: number, maxStock: number): boolean => {
    return currentQty >= maxStock;
  };

  // Handle manual quantity input change
  const handleInputChange = (productId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [productId]: value }));
  };

  // Handle input blur - auto-correct to valid value
  const handleInputBlur = (productId: string, maxStock: number) => {
    const inputValue = inputValues[productId];
    
    if (inputValue === undefined || inputValue === '') {
      // Reset to current cart quantity
      setInputValues(prev => {
        const newValues = { ...prev };
        delete newValues[productId];
        return newValues;
      });
      return;
    }
    
    let numValue = parseInt(inputValue, 10);
    
    // If not a valid number or less than 1, set to 1
    if (isNaN(numValue) || numValue < 1) {
      numValue = 1;
    }
    
    // Auto-correct to max stock if exceeds
    if (numValue > maxStock) {
      numValue = maxStock;
    }
    
    // Update cart with corrected value
    setCartQuantityWithAutoCorrect(productId, numValue);
    
    // Clear the temporary input value
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[productId];
      return newValues;
    });
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent, productId: string, maxStock: number) => {
    if (e.key === 'Enter') {
      handleInputBlur(productId, maxStock);
    }
  };

  // Get display value for input (either temporary input or cart quantity)
  const getDisplayValue = (productId: string, cartQuantity: number): string => {
    if (inputValues[productId] !== undefined) {
      return inputValues[productId];
    }
    return cartQuantity.toString();
  };

  // Handle increment with stock check
  const handleIncrement = (productId: string, currentQty: number, maxStock: number) => {
    if (currentQty < maxStock) {
      updateCartQuantity(productId, currentQty + 1);
    }
  };

  // Handle decrement
  const handleDecrement = (productId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateCartQuantity(productId, currentQty - 1);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t.cartDrawer.cart} ({getCartCount()})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">{t.cartDrawer.emptyCart}</p>
              <p className="text-sm text-gray-400">
                {t.cartDrawer.addProductsHint}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const maxStock = item.product.stock_quantity;
                const plusDisabled = isPlusDisabled(item.product.id, item.quantity, maxStock);
                
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      <img
                        src={item.product.image_url || 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982832385_02f594f4.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-mono">
                        {item.product.product_code}
                      </p>
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.product.dimensions}
                      </p>
                      <p className="text-orange-600 font-semibold mt-1">
                        €{Number(item.product.price).toFixed(2)} {t.cartDrawer.each}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button
                          onClick={() => handleDecrement(item.product.id, item.quantity)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={getDisplayValue(item.product.id, item.quantity)}
                          onChange={(e) => handleInputChange(item.product.id, e.target.value)}
                          onBlur={() => handleInputBlur(item.product.id, maxStock)}
                          onKeyDown={(e) => handleKeyDown(e, item.product.id, maxStock)}
                          className="w-10 text-center text-sm font-medium border-0 focus:ring-0 focus:outline-none bg-transparent"
                        />
                        <button
                          onClick={() => handleIncrement(item.product.id, item.quantity, maxStock)}
                          disabled={plusDisabled}
                          className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{t.cartDrawer.subtotal} ({getCartCount()} {t.cartDrawer.items})</span>
                <span>€{Number(getCartTotal()).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{t.cartDrawer.shipping}</span>
                <span>{t.cartDrawer.calculatedAtCheckout}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>{t.cartDrawer.total}</span>
                <span>€{Number(getCartTotal()).toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
            >
              <span>{t.cartDrawer.proceedToCheckout}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {t.cartDrawer.continueShopping}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
