import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  Download,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { db } from '@/lib/db';
import { Order } from '@/types';
import { generatePDFFromOrder } from '@/lib/generatePDF';
import { useLanguage } from '@/contexts/LanguageContext';

const OrderManagement: React.FC = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await db.getOrders();

      if (error) throw new Error(error);
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.order_number.toLowerCase().includes(query) ||
          (o.user as any)?.username?.toLowerCase().includes(query) ||
          (o.user as any)?.business_name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter((o) => new Date(o.created_at) >= filterDate);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await db.updateOrder(orderId, { status: newStatus });

      if (error) throw new Error(error);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrderId(orderId);
    try {
      // Note: Order deletion is handled by cascade in database
      // For now, we'll update the status to cancelled
      const { error } = await db.updateOrder(orderId, { status: 'cancelled' });

      if (error) throw new Error(error);

      // Refresh orders list
      fetchOrders();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleDownloadPDF = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding the order
    
    setDownloadingOrderId(order.id);
    try {
      // Ensure order has items array and user data properly structured
      const orderWithData = {
        ...order,
        items: Array.isArray((order as any).items) ? (order as any).items : [],
        user: (order as any).user || undefined
      };
      await generatePDFFromOrder(orderWithData);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingOrderId(null);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.orderManagement.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
        >
          <option value="all">{t.orderManagement.allStatuses}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
        >
          <option value="all">{t.orderManagement.allTime}</option>
          <option value="today">{t.orderManagement.today}</option>
          <option value="week">{t.orderManagement.last7Days}</option>
          <option value="month">{t.orderManagement.last30Days}</option>
          <option value="year">{t.orderManagement.lastYear}</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {statuses.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
              className={`p-4 rounded-xl border transition-all ${
                statusFilter === status
                  ? getStatusColor(status)
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm">{getStatusLabel(status)}</p>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t.orderManagement.noOrdersFound}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div
                className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className={`p-3 rounded-lg ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold text-gray-900">
                          {order.order_number}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {(order.user as any)?.business_name || (order.user as any)?.username}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center space-x-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(order.created_at).toLocaleDateString('sq-AL', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-600">
                        €{Number(order.total_amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(order.items as any)?.length || 0} {t.orderManagement.items}
                      </p>

                    </div>
                    {/* Download PO Button */}
                    <button
                      onClick={(e) => handleDownloadPDF(order, e)}
                      disabled={downloadingOrderId === order.id}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t.orderManagement.downloadPO}
                    >
                      {downloadingOrderId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span className="hidden md:inline">PO</span>
                    </button>
                    {/* Delete Order Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(order.id);
                      }}
                      disabled={deletingOrderId === order.id}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t.orderManagement.deleteOrder}
                    >
                      {deletingOrderId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirmId === order.id && (
                <div className="border-t border-gray-100 p-4 bg-red-50">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">{t.orderManagement.deleteConfirmTitle}</p>
                      <p className="text-sm text-red-700">{t.orderManagement.deleteConfirmMessage}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(null);
                        }}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                      >
                        {t.orderManagement.cancel}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id);
                        }}
                        disabled={deletingOrderId === order.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50 flex items-center space-x-2"
                      >
                        {deletingOrderId === order.id && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{t.orderManagement.delete}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded Content */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-100 p-4 sm:p-6 bg-gray-50">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">{t.orderManagement.customerInfo}</h4>
                      <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t.orderManagement.business}:</span>
                          <span className="text-gray-900">{(order.user as any)?.business_name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t.orderManagement.businessNumber}:</span>
                          <span className="text-gray-900">{(order.user as any)?.business_number || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t.orderManagement.contactPerson}:</span>
                          <span className="text-gray-900">{(order.user as any)?.contact_person || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t.orderManagement.email}:</span>
                          <span className="text-gray-900">{(order.user as any)?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t.orderManagement.phone}:</span>
                          <span className="text-gray-900">{(order.user as any)?.phone || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">{t.orderManagement.updateStatus}</h4>
                      <div className="bg-white rounded-lg p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {getStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">{t.orderManagement.orderItems}</h4>
                    <div className="bg-white rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-700">{t.orderManagement.product}</th>
                            <th className="text-center px-4 py-3 font-medium text-gray-700">{t.orderManagement.quantity}</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-700">{t.orderManagement.unitPrice}</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-700">{t.orderManagement.total}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(order.items as any)?.map((item: any) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                <p className="text-xs text-gray-500">{item.product_code}</p>
                              </td>
                              <td className="text-center px-4 py-3 text-gray-900">{item.quantity}</td>
                              <td className="text-right px-4 py-3 text-gray-900">€{Number(item.unit_price).toFixed(2)}</td>
                              <td className="text-right px-4 py-3 font-medium text-gray-900">€{Number(item.total_price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="text-right px-4 py-3 font-semibold text-gray-900">
                              {t.orderManagement.total}:
                            </td>
                            <td className="text-right px-4 py-3 font-bold text-orange-600">
                              €{Number(order.total_amount).toFixed(2)}
                            </td>

                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">{t.orderManagement.orderNotes}</h4>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-700">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
