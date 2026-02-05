import React, { useState } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/db';
import { Product } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, cart, getCartTotal, clearCart } = useAuth();
  const { t } = useLanguage();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PO-${year}${month}${day}-${random}`;
  };

  const validateStock = async (): Promise<{ valid: boolean; message?: string }> => {
    const { data: products, error } = await db.getProducts();
    if (error || !products) {
      return { valid: false, message: 'Could not validate stock' };
    }
    
    for (const item of cart) {
      const product = (products as Product[]).find(p => p.id === item.product.id);
      
      if (!product) {
        return { valid: false, message: `${t.checkoutModal.stockError} ${item.product.name}` };
      }

      if (product.stock_quantity < item.quantity) {
        return {
          valid: false,
          message: `${t.checkoutModal.insufficientStock} ${item.product.name}. ${t.checkoutModal.available}: ${product.stock_quantity}`,
        };
      }
    }
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Validate stock
      const stockCheck = await validateStock();
      if (!stockCheck.valid) {
        setError(stockCheck.message || t.checkoutModal.orderFailed);
        setIsSubmitting(false);
        return;
      }

      const orderNumber = generateOrderNumber();
      const totalAmount = getCartTotal();

      // Create order with items
      const orderItems = cart.map((item) => ({
        product_id: item.product.id,
        product_code: item.product.product_code,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { data: orderData, error: orderError } = await db.createOrder({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        total_amount: totalAmount,
        notes: notes || null,
        items: orderItems,
      });

      if (orderError) throw new Error(orderError);

      // Clear cart and close modal
      clearCart();
      onSuccess(orderNumber);
    } catch (error) {
      console.error('Error submitting order:', error);
      setError(t.checkoutModal.orderFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.checkoutModal.title} size="lg">
      <div className="p-6">
        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Business Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t.checkoutModal.businessInfo}</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">{t.checkoutModal.businessName}</p>
                <p className="font-medium text-gray-900">{user?.business_name || t.common.na}</p>
              </div>
              <div>
                <p className="text-gray-500">{t.checkoutModal.businessNumber}</p>
                <p className="font-medium text-gray-900">{user?.business_number || t.common.na}</p>
              </div>
              <div>
                <p className="text-gray-500">{t.checkoutModal.contactPerson}</p>
                <p className="font-medium text-gray-900">{user?.contact_person || t.common.na}</p>
              </div>
              <div>
                <p className="text-gray-500">{t.checkoutModal.phone}</p>
                <p className="font-medium text-gray-900">{user?.phone || t.common.na}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t.checkoutModal.orderSummary}</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">{t.checkoutModal.product}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-700">{t.checkoutModal.quantity}</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">{t.checkoutModal.price}</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">{t.checkoutModal.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <tr key={item.product.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.product.product_code} • {item.product.dimensions}</p>
                      </td>
                      <td className="text-center px-4 py-3 text-gray-900">{item.quantity}</td>
                      <td className="text-right px-4 py-3 text-gray-900">€{Number(item.product.price).toFixed(2)}</td>
                      <td className="text-right px-4 py-3 font-medium text-gray-900">
                        €{(Number(item.product.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="text-right px-4 py-3 font-semibold text-gray-900">
                      {t.checkoutModal.grandTotal}
                    </td>
                    <td className="text-right px-4 py-3 font-bold text-orange-600 text-lg">
                      €{Number(getCartTotal()).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.checkoutModal.orderNotes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              placeholder={t.checkoutModal.orderNotesPlaceholder}
            />
          </div>

          {/* Info Notice */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg mb-6">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">{t.checkoutModal.purchaseOrder}</p>
              <p>{t.checkoutModal.purchaseOrderHint}</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.checkoutModal.processing}</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>{t.checkoutModal.placeOrder}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default CheckoutModal;
