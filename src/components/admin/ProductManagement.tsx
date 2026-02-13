import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  Package,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { db } from '@/lib/db';
import { Product, ProductForm } from '@/types';
import Modal from '@/components/ui/Modal';
import BulkProductImport from '@/components/admin/BulkProductImport';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductManagement: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ProductForm>({
    product_code: '',
    brand: 'Lassa',
    name: '',
    width: undefined,
    aspect_ratio: undefined,
    rim_diameter: undefined,
    dimensions: '',
    tire_type: 'car',
    season: 'summer',
    stock_quantity: 0,
    price: 0,
    description: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await db.getProducts();

      if (error) throw new Error(error);
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error('Gabim gjatë marrjes së produkteve:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredProducts(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.product_code.toLowerCase().includes(query) ||
          p.dimensions.toLowerCase().includes(query)
      )
    );
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_code: product.product_code,
        brand: product.brand,
        name: product.name,
        width: product.width,
        aspect_ratio: product.aspect_ratio,
        rim_diameter: product.rim_diameter,
        dimensions: product.dimensions,
        tire_type: product.tire_type,
        season: product.season,
        stock_quantity: product.stock_quantity,
        price: product.price,
        description: product.description || '',
        image_url: product.image_url || '',
        is_active: product.is_active,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_code: '',
        brand: 'Lassa',
        name: '',
        width: undefined,
        aspect_ratio: undefined,
        rim_diameter: undefined,
        dimensions: '',
        tire_type: 'car',
        season: 'summer',
        stock_quantity: 0,
        price: 0,
        description: '',
        image_url: '',
        is_active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        const { error } = await db.updateProduct(editingProduct.id, formData);

        if (error) throw new Error(error);
      } else {
        const { error } = await db.createProduct(formData);
        if (error) throw new Error(error);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Gabim gjatë ruajtjes së produktit:', error);
      alert(t.common.error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t.productManagement.deleteConfirm)) return;
    try {
      const { error } = await db.deleteProduct(productId);
      if (error) throw new Error(error);
      fetchProducts();
    } catch (error) {
      console.error('Gabim gjatë fshirjes së produktit:', error);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const { error } = await db.updateProduct(product.id, { is_active: !product.is_active });

      if (error) throw new Error(error);
      fetchProducts();
    } catch (error) {
      console.error('Gabim gjatë ndryshimit të statusit:', error);
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'winter': return 'bg-blue-100 text-blue-700';
      case 'summer': return 'bg-amber-100 text-amber-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  };

  const getSeasonLabel = (season: string) => {
    switch (season) {
      case 'winter': return t.productManagement.winter;
      case 'summer': return t.productManagement.summer;
      case 'all-season': return t.productManagement.allSeason;
      default: return season;
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
            placeholder={t.productManagement.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            <span>{t.productManagement.bulkImport}</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>{t.productManagement.addProduct}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-700">{t.productManagement.product}</th>
                <th className="text-left px-6 py-4 font-medium text-gray-700">{t.productManagement.dimensions}</th>
                <th className="text-center px-6 py-4 font-medium text-gray-700">{t.productManagement.type}</th>
                <th className="text-center px-6 py-4 font-medium text-gray-700">{t.productManagement.season}</th>
                <th className="text-center px-6 py-4 font-medium text-gray-700">{t.productManagement.stock}</th>
                <th className="text-right px-6 py-4 font-medium text-gray-700">{t.productManagement.price}</th>
                <th className="text-center px-6 py-4 font-medium text-gray-700">{t.productManagement.status}</th>
                <th className="text-right px-6 py-4 font-medium text-gray-700">{t.productManagement.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={product.image_url || 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982832385_02f594f4.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500 font-mono">{product.product_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{product.dimensions}</p>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="capitalize text-gray-700">{product.tire_type}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeasonColor(product.season)}`}>
                      {getSeasonLabel(product.season)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {product.stock_quantity < 20 && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={`font-medium ${product.stock_quantity < 20 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {product.stock_quantity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-gray-900">€{Number(product.price).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                        product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.is_active ? t.productManagement.active : t.productManagement.inactive}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.productManagement.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t.productManagement.noProductsFound}</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? t.productManagement.editProduct : t.productManagement.addNewProduct}
        size="xl"
      >
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.productCode}</label>
              <input
                type="text"
                value={formData.product_code}
                onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="LSS-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.brand}</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Lassa"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.name}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Snoways 4"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.width}</label>
              <input
                type="number"
                value={formData.width || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="205"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.aspectRatio}</label>
              <input
                type="number"
                value={formData.aspect_ratio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aspect_ratio: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="55"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.diameter}</label>
              <input
                type="number"
                value={formData.rim_diameter || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rim_diameter: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="16"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.dimensions} *</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="205/55R16"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.tireType}</label>
              <select
                value={formData.tire_type}
                onChange={(e) => setFormData(prev => ({ ...prev, tire_type: e.target.value as any }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="car">{t.productManagement.passengerCar}</option>
                <option value="suv">{t.productManagement.suv4x4}</option>
                <option value="van">{t.productManagement.vanCommercial}</option>
                <option value="truck">{t.productManagement.truck}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.season}</label>
              <select
                value={formData.season}
                onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value as any }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="summer">{t.productManagement.summer}</option>
                <option value="winter">{t.productManagement.winter}</option>
                <option value="all-season">{t.productManagement.allSeason}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.stockQuantity}</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.price} (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.imageUrl}</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.productManagement.description}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
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
              <span className="text-sm font-medium text-gray-700">{t.productManagement.activeProduct}</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              {t.productManagement.cancel}
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingProduct ? t.productManagement.updateProduct : t.productManagement.createProduct}</span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title={t.productManagement.bulkImport}
        size="xl"
      >
        <BulkProductImport
          onImportComplete={fetchProducts}
          onClose={() => setImportModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProductManagement;
