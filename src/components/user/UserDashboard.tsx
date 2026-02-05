import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Package, 
  User as UserIcon, 
  FileText, 
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  Building2,
  Download,
  Loader2
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';
import ProductGrid from './ProductGrid';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';
import OrderConfirmation from './OrderConfirmation';
import UserProfile from './UserProfile';
import { generatePDFFromOrder } from '@/lib/generatePDF';

interface UserDashboardProps {
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onLogout }) => {
  const { user, getCartCount } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      const { data, error } = await db.getOrders(user.id);

      if (error) throw new Error(error);
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderNumber: string) => {
    setCheckoutOpen(false);
    setLastOrderNumber(orderNumber);
    setConfirmationOpen(true);
    if (activeTab === 'orders') {
      fetchOrders();
    }
  };

  const handleDownloadPDF = async (order: Order) => {
    if (!user) return;
    
    setDownloadingOrderId(order.id);
    try {
      // Ensure order has items array and user data
      const orderWithData = {
        ...order,
        items: order.items || [],
        user: user
      };
      await generatePDFFromOrder(orderWithData, user);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(t.orderConfirmation.downloadFailed);
    } finally {
      setDownloadingOrderId(null);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t.orderManagement.statusPending;
      case 'confirmed':
        return t.orderManagement.statusConfirmed;
      case 'processing':
        return t.orderManagement.statusProcessing;
      case 'shipped':
        return t.orderManagement.statusShipped;
      case 'delivered':
        return t.orderManagement.statusDelivered;
      case 'cancelled':
        return t.orderManagement.statusCancelled;
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img
                src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982837014_7fe60ac7.png"
                alt="Lassa Tyres"
                className="h-8 w-auto"
              />
              <div className="hidden sm:block">
                <p className="text-sm text-gray-500">{t.userDashboard.welcome}</p>
                <p className="font-semibold text-gray-900">{user?.business_name || user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.header.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.userDashboard.products}</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t.userDashboard.orders}</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t.userDashboard.profile}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && <ProductGrid />}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{t.userDashboard.orderHistory}</h2>
              <span className="text-sm text-gray-500">{orders.length} {t.userDashboard.orders.toLowerCase()}</span>
            </div>

            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">{t.userDashboard.noOrders}</p>
                <p className="text-sm text-gray-400">{t.userDashboard.orderHistoryHint}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono font-semibold text-gray-900">
                              {order.order_number}
                            </span>
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span>{getStatusLabel(order.status)}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('sq-AL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">
                              €{Number(order.total_amount).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.items?.length || 0} {t.orderManagement.items}
                            </p>
                          </div>
                          {/* Download PO Button */}
                          <button
                            onClick={() => handleDownloadPDF(order)}
                            disabled={downloadingOrderId === order.id}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t.userDashboard.downloadPO}
                          >
                            {downloadingOrderId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">{t.userDashboard.downloadPO}</span>
                          </button>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="space-y-2">
                            {order.items.slice(0, 3).map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.product_name} ({item.product_code})
                                </span>
                                <span className="text-gray-900">
                                  {item.quantity} x €{Number(item.unit_price).toFixed(2)}
                                </span>

                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-gray-500">
                                +{order.items.length - 3} {t.userDashboard.moreItems}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && <UserProfile />}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation */}
      <OrderConfirmation
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        orderNumber={lastOrderNumber}
      />
    </div>
  );
};

export default UserDashboard;
