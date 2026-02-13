import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX, 
  Key,
  Loader2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { db } from '@/lib/db';
import { User, UserForm } from '@/types';
import Modal from '@/components/ui/Modal';
import { useLanguage } from '@/contexts/LanguageContext';

const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<UserForm>({
    username: '',
    password: '',
    role: 'user',
    business_name: '',
    business_number: '',
    phone: '',
    whatsapp: '',
    viber: '',
    contact_person: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await db.getUsers();

      if (error) throw new Error(error);
      setUsers((data as User[]) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          u.business_name?.toLowerCase().includes(query) ||
          u.contact_person?.toLowerCase().includes(query)
      )
    );
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        role: user.role,
        business_name: user.business_name || '',
        business_number: user.business_number || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        viber: user.viber || '',
        contact_person: user.contact_person || '',
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 'user',
        business_name: '',
        business_number: '',
        phone: '',
        whatsapp: '',
        viber: '',
        contact_person: '',
        is_active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSaveUser = async () => {
    setIsSaving(true);
    try {
      if (editingUser) {
        const { error } = await db.updateUser(editingUser.id, {
          username: formData.username,
          role: formData.role,
          business_name: formData.business_name,
          business_number: formData.business_number,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          viber: formData.viber,
          contact_person: formData.contact_person,
          is_active: formData.is_active,
        });

        if (error) throw new Error(error);
      } else {
        if (!formData.password) {
          alert(t.userManagement.passwordRequired);
          setIsSaving(false);
          return;
        }
        const { error } = await db.createUser({
          username: formData.username,
          password: formData.password,
          role: formData.role,
          business_name: formData.business_name,
          business_number: formData.business_number,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          viber: formData.viber,
          contact_person: formData.contact_person,
          is_active: formData.is_active,
        });

        if (error) throw new Error(error);
      }

      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(t.userManagement.failedToSave);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const { error } = await db.updateUser(user.id, { is_active: !user.is_active });

      if (error) throw new Error(error);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t.userManagement.deleteConfirm)) return;
    try {
      const { error } = await db.deleteUser(userId);
      if (error) throw new Error(error);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword) return;
    setIsSaving(true);
    try {
      const { error } = await db.updateUser(selectedUserId, { password: newPassword });

      if (error) throw new Error(error);
      setResetPasswordModal(false);
      setNewPassword('');
      setSelectedUserId(null);
      alert(t.userManagement.passwordUpdated);
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(t.userManagement.failedToReset);
    } finally {
      setIsSaving(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.userManagement.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>{t.userManagement.addUser}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-700">{t.userManagement.user}</th>
                <th className="text-left px-6 py-4 font-medium text-gray-700">{t.userManagement.business}</th>
                <th className="text-left px-6 py-4 font-medium text-gray-700">{t.userManagement.contact}</th>
                <th className="text-center px-6 py-4 font-medium text-gray-700">{t.userManagement.role}</th>
                <th className="text-center px-6 py-4 font-medium text-gray-700">{t.userManagement.status}</th>
                <th className="text-right px-6 py-4 font-medium text-gray-700">{t.userManagement.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{user.business_name || '-'}</p>
                    <p className="text-sm text-gray-500">{user.business_number || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{user.contact_person || '-'}</p>
                    <p className="text-sm text-gray-500">{user.phone || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? t.userManagement.admin : t.userManagement.userRole}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? t.userManagement.active : t.userManagement.inactive}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.userManagement.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setResetPasswordModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title={t.userManagement.resetPassword}
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={user.is_active ? t.userManagement.disable : t.userManagement.enable}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t.userManagement.noUsersFound}</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? t.userManagement.editUser : t.userManagement.addNewUser}
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.email}</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.password}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.role}</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="user">{t.userManagement.userRole}</option>
                <option value="admin">{t.userManagement.admin}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.businessName}</label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.businessNumber}</label>
              <input
                type="text"
                value={formData.business_number}
                onChange={(e) => setFormData(prev => ({ ...prev, business_number: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.contactPerson}</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.phone}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.whatsapp}</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.viber}</label>
              <input
                type="tel"
                value={formData.viber}
                onChange={(e) => setFormData(prev => ({ ...prev, viber: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">{t.userManagement.activeAccount}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              {t.userManagement.cancel}
            </button>
            <button
              onClick={handleSaveUser}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingUser ? t.userManagement.updateUser : t.userManagement.createUser}</span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={resetPasswordModal}
        onClose={() => {
          setResetPasswordModal(false);
          setNewPassword('');
          setSelectedUserId(null);
        }}
        title={t.userManagement.resetPassword}
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            {t.userManagement.resetPasswordDescription}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.userManagement.newPassword}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setResetPasswordModal(false);
                setNewPassword('');
                setSelectedUserId(null);
              }}
              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              {t.userManagement.cancel}
            </button>
            <button
              onClick={handleResetPassword}
              disabled={isSaving || !newPassword}
              className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t.userManagement.resetPassword}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
