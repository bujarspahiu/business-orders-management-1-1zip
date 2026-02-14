import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import NotificationSettings from './NotificationSettings';
import Reports from './Reports';
import AdminSettings from './AdminSettings';
import NotificationBell from './NotificationBell';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'products' | 'orders' | 'reports' | 'notifications' | 'settings'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users
      const { data: usersData } = await db.getUsers();
      const users = (usersData as any[]) || [];
      const usersCount = users.filter(u => u.role === 'user').length;

      // Fetch products
      const { data: productsData } = await db.getProducts();
      const products = (productsData as any[]) || [];
      const productsCount = products.length;
      const lowStockCount = products.filter(p => p.stock_quantity < 20).length;

      // Fetch orders
      const { data: ordersData } = await db.getOrders();
      const orders = (ordersData as any[]) || [];

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

      setStats({
        totalUsers: usersCount,
        totalProducts: productsCount,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts: lowStockCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t.adminDashboard.mainPanel, icon: LayoutDashboard },
    { id: 'users', label: t.adminDashboard.users, icon: Users },
    { id: 'products', label: t.adminDashboard.products, icon: Package },
    { id: 'orders', label: t.adminDashboard.orders, icon: FileText },
    { id: 'reports', label: t.reports.title, icon: BarChart3 },
    { id: 'notifications', label: t.adminDashboard.notifications, icon: Bell },
    { id: 'settings', label: t.adminSettings.settings, icon: Settings },
  ];

  const statCards = [
    { label: t.adminDashboard.totalUsers, value: stats.totalUsers, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: t.adminDashboard.totalProducts, value: stats.totalProducts, icon: Package, color: 'bg-green-500', change: '+5%' },
    { label: t.adminDashboard.totalOrders, value: stats.totalOrders, icon: ShoppingCart, color: 'bg-purple-500', change: '+18%' },
    { label: t.adminDashboard.totalRevenue, value: `€${Number(stats.totalRevenue).toFixed(2)}`, icon: DollarSign, color: 'bg-orange-500', change: '+23%' },

  ];

  return (
    <div className="min-h-screen bg-gray-100 flex native-viewport">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform lg:transform-none safe-area-left ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full safe-area-top safe-area-bottom">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982837836_78284b5f.png"
              alt="Lassa Tyres"
              className="h-8 w-auto"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="px-4 py-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t.header.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30 safe-area-top safe-area-right">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === 'dashboard' ? t.adminDashboard.adminPanel : 
                 activeTab === 'users' ? t.adminDashboard.users :
                 activeTab === 'products' ? t.adminDashboard.products :
                 activeTab === 'orders' ? t.adminDashboard.orders :
                 activeTab === 'reports' ? t.reports.title :
                 activeTab === 'settings' ? t.adminSettings.settings : t.adminDashboard.notifications}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {stats.pendingOrders > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  <Bell className="w-4 h-4" />
                  <span>{stats.pendingOrders} {t.adminDashboard.pending}</span>
                </div>
              )}
              <NotificationBell onNavigateToOrders={() => setActiveTab('orders')} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto safe-area-bottom safe-area-right">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.adminDashboard.quickActions}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
                    >
                      <Users className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="font-medium text-gray-900">{t.adminDashboard.manageUsers}</p>
                      <p className="text-sm text-gray-500">{t.adminDashboard.addEditUsers}</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
                    >
                      <Package className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium text-gray-900">{t.adminDashboard.manageProducts}</p>
                      <p className="text-sm text-gray-500">{t.adminDashboard.updateInventory}</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
                    >
                      <FileText className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-medium text-gray-900">{t.adminDashboard.viewOrders}</p>
                      <p className="text-sm text-gray-500">{t.adminDashboard.processOrders}</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className="p-4 bg-orange-50 rounded-lg text-left hover:bg-orange-100 transition-colors"
                    >
                      <Bell className="w-6 h-6 text-orange-600 mb-2" />
                      <p className="font-medium text-gray-900">{t.adminDashboard.notificationSettings}</p>
                      <p className="text-sm text-gray-500">{t.adminDashboard.emailSettings}</p>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.adminDashboard.alerts}</h3>
                  <div className="space-y-4">
                    {stats.pendingOrders > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <ShoppingCart className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{stats.pendingOrders} {t.adminDashboard.pendingOrders}</p>
                          <p className="text-sm text-gray-500">{t.adminDashboard.requireAttention}</p>
                        </div>
                      </div>
                    )}
                    {stats.lowStockProducts > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Package className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{stats.lowStockProducts} {t.adminDashboard.lowStockItems}</p>
                          <p className="text-sm text-gray-500">{t.adminDashboard.stockBelow}</p>
                        </div>
                      </div>
                    )}
                    {stats.pendingOrders === 0 && stats.lowStockProducts === 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t.adminDashboard.allSystemsNormal}</p>
                          <p className="text-sm text-gray-500">{t.adminDashboard.noAlerts}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
