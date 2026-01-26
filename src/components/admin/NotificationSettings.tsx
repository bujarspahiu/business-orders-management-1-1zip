import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Mail,
  Loader2,
  Bell,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { NotificationRecipient } from '@/types';
import Modal from '@/components/ui/Modal';

const NotificationSettings: React.FC = () => {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin' as 'admin' | 'warehouse' | 'finance' | 'manager',
  });

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_recipients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipients(data || []);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecipient = async () => {
    if (!formData.email) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('notification_recipients').insert({
        email: formData.email,
        name: formData.name || null,
        role: formData.role,
        is_active: true,
      });

      if (error) throw error;
      setModalOpen(false);
      setFormData({ email: '', name: '', role: 'admin' });
      fetchRecipients();
    } catch (error) {
      console.error('Error adding recipient:', error);
      alert('Failed to add recipient');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (recipient: NotificationRecipient) => {
    try {
      const { error } = await supabase
        .from('notification_recipients')
        .update({ is_active: !recipient.is_active })
        .eq('id', recipient.id);

      if (error) throw error;
      fetchRecipients();
    } catch (error) {
      console.error('Error toggling recipient:', error);
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('Are you sure you want to remove this recipient?')) return;
    try {
      const { error } = await supabase
        .from('notification_recipients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchRecipients();
    } catch (error) {
      console.error('Error deleting recipient:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'warehouse':
        return 'bg-blue-100 text-blue-700';
      case 'finance':
        return 'bg-green-100 text-green-700';
      case 'manager':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Email Notifications</h3>
            <p className="text-blue-700 text-sm">
              Configure email recipients for order notifications. Each recipient will receive 
              emails when new orders are placed based on their role.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Notification Recipients</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Recipient</span>
        </button>
      </div>

      {/* Recipients List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {recipients.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notification recipients configured</p>
            <p className="text-sm text-gray-400 mt-1">Add recipients to receive order notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{recipient.name || recipient.email}</p>
                    {recipient.name && (
                      <p className="text-sm text-gray-500">{recipient.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(recipient.role)}`}>
                    {recipient.role}
                  </span>
                  <button
                    onClick={() => handleToggleActive(recipient)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      recipient.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {recipient.is_active ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Active</span>
                      </>
                    ) : (
                      <span>Inactive</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteRecipient(recipient.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Types Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Notification Types by Role</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mb-2">
              Admin
            </span>
            <p className="text-sm text-gray-700">Receives all order notifications and system alerts</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-2">
              Warehouse
            </span>
            <p className="text-sm text-gray-700">Receives notifications for order fulfillment and shipping</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mb-2">
              Finance
            </span>
            <p className="text-sm text-gray-700">Receives order confirmations and payment notifications</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 mb-2">
              Manager
            </span>
            <p className="text-sm text-gray-700">Receives daily/weekly order summaries and reports</p>
          </div>
        </div>
      </div>

      {/* Add Recipient Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormData({ email: '', name: '', role: 'admin' });
        }}
        title="Add Notification Recipient"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="admin">Admin</option>
              <option value="warehouse">Warehouse</option>
              <option value="finance">Finance</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setModalOpen(false);
                setFormData({ email: '', name: '', role: 'admin' });
              }}
              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRecipient}
              disabled={isSaving || !formData.email}
              className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Add Recipient</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationSettings;
