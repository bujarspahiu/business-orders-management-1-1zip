import React, { useState } from 'react';
import { CheckCircle, FileText, Mail, ArrowRight, Download, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { generatePDFFromOrder } from '@/lib/generatePDF';

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ isOpen, onClose, orderNumber }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!orderNumber || !user) return;
    
    setIsDownloading(true);
    try {
      // Fetch the order with items
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;

      // Generate and download PDF
      await generatePDFFromOrder(order, user);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(t.orderConfirmation.downloadFailed);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t.orderConfirmation.success}
        </h2>
        <p className="text-gray-600 mb-6">
          {t.orderConfirmation.thankYou}
        </p>

        {/* Order Number */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">{t.orderConfirmation.orderNumber}</p>
          <p className="text-2xl font-bold text-orange-600 font-mono">{orderNumber}</p>
        </div>

        {/* Download PO Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t.orderConfirmation.generatingPDF}</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>{t.orderConfirmation.downloadPO}</span>
            </>
          )}
        </button>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">{t.orderConfirmation.purchaseOrder}</span>
            </div>
            <p className="text-sm text-blue-700">
              {t.orderConfirmation.purchaseOrderHint}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-left">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">{t.orderConfirmation.emailConfirmation}</span>
            </div>
            <p className="text-sm text-green-700">
              {t.orderConfirmation.emailConfirmationHint}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">{t.orderConfirmation.nextSteps}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <span>{t.orderConfirmation.step1}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <span>{t.orderConfirmation.step2}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <span>{t.orderConfirmation.step3}</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
        >
          <span>{t.orderConfirmation.continueShopping}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </Modal>
  );
};

export default OrderConfirmation;
