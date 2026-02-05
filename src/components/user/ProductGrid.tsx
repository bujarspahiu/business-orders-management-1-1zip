import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Plus, Minus, Snowflake, Sun, Cloud, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductGrid: React.FC = () => {
  const { addToCart, cart, getAvailableStock, getCartQuantityForProduct } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedSeason, selectedType, sortBy]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await db.getProducts(true);

      if (error) throw new Error(error);
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.product_code.toLowerCase().includes(query) ||
          p.dimensions.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    if (selectedSeason !== 'all') {
      filtered = filtered.filter((p) => p.season === selectedSeason);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((p) => p.tire_type === selectedType);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const getQuantity = (productId: string) => quantities[productId] || 1;

  // Get available stock for a product (considering what's already in cart)
  const getProductAvailableStock = (product: Product): number => {
    return getAvailableStock(product);
  };

  // Check if + button should be disabled
  const isPlusDisabled = (product: Product): boolean => {
    const currentQty = getQuantity(product.id);
    const availableStock = getProductAvailableStock(product);
    return currentQty >= availableStock || availableStock <= 0;
  };

  // Check if add to cart should be disabled
  const isAddToCartDisabled = (product: Product): boolean => {
    const availableStock = getProductAvailableStock(product);
    return availableStock <= 0;
  };

  const updateQuantity = (productId: string, delta: number, product: Product) => {
    const availableStock = getProductAvailableStock(product);
    
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      let newQty = currentQty + delta;
      
      // Ensure minimum of 1
      newQty = Math.max(1, newQty);
      
      // Auto-correct to max available stock
      newQty = Math.min(newQty, availableStock);
      
      // If no stock available, keep at 1 (button will be disabled anyway)
      if (availableStock <= 0) {
        newQty = 1;
      }
      
      return {
        ...prev,
        [productId]: newQty,
      };
    });
  };

  // Handle manual quantity input
  const handleQuantityInput = (productId: string, value: string, product: Product) => {
    const availableStock = getProductAvailableStock(product);
    let numValue = parseInt(value, 10);
    
    // If not a valid number, default to 1
    if (isNaN(numValue) || numValue < 1) {
      numValue = 1;
    }
    
    // Auto-correct to max available stock
    if (numValue > availableStock) {
      numValue = Math.max(1, availableStock);
    }
    
    setQuantities((prev) => ({
      ...prev,
      [productId]: numValue,
    }));
  };

  const handleAddToCart = (product: Product) => {
    const availableStock = getProductAvailableStock(product);
    
    // Don't allow adding if no stock available
    if (availableStock <= 0) {
      return;
    }
    
    let qty = getQuantity(product.id);
    
    // Auto-correct quantity to available stock
    if (qty > availableStock) {
      qty = availableStock;
      setQuantities((prev) => ({ ...prev, [product.id]: qty }));
    }
    
    const success = addToCart(product, qty);
    
    if (success) {
      setAddedToCart((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedToCart((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
      setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'winter':
        return <Snowflake className="w-4 h-4" />;
      case 'summer':
        return <Sun className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'winter':
        return 'bg-blue-100 text-blue-700';
      case 'summer':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  };

  const getSeasonLabel = (season: string) => {
    switch (season) {
      case 'winter':
        return t.productGrid.winter;
      case 'summer':
        return t.productGrid.summer;
      case 'all-season':
        return t.productGrid.allSeason;
      default:
        return season;
    }
  };

  const getCartQuantity = (productId: string) => {
    return getCartQuantityForProduct(productId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.productGrid.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
          >
            <option value="all">{t.productGrid.allSeasons}</option>
            <option value="summer">{t.productGrid.summer}</option>
            <option value="winter">{t.productGrid.winter}</option>
            <option value="all-season">{t.productGrid.allSeason}</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
          >
            <option value="all">{t.productGrid.allTypes}</option>
            <option value="car">{t.productGrid.passengerCar}</option>
            <option value="suv">{t.productGrid.suv4x4}</option>
            <option value="van">{t.productGrid.vanCommercial}</option>
            <option value="truck">{t.productGrid.truck}</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
          >
            <option value="name">{t.productGrid.sortByName}</option>
            <option value="price-low">{t.productGrid.priceLowHigh}</option>
            <option value="price-high">{t.productGrid.priceHighLow}</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>{filteredProducts.length} {t.productGrid.productsFound}</span>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>{t.productGrid.filtersApplied} {[selectedSeason !== 'all', selectedType !== 'all', searchQuery].filter(Boolean).length}</span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const availableStock = getProductAvailableStock(product);
          const currentQty = getQuantity(product.id);
          const plusDisabled = isPlusDisabled(product);
          const addDisabled = isAddToCartDisabled(product);
          
          return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={product.image_url || 'https://d64gsuwffb70l.cloudfront.net/6970831999a5dc17b3f2cb41_1768982832385_02f594f4.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className={`absolute top-3 left-3 flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getSeasonColor(product.season)}`}>
                  {getSeasonIcon(product.season)}
                  <span>{getSeasonLabel(product.season)}</span>
                </div>
                {getCartQuantity(product.id) > 0 && (
                  <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {getCartQuantity(product.id)}
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-500 font-mono mb-1">{product.product_code}</p>
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.dimensions}</p>
                <p className="text-xs text-gray-500 capitalize mb-3">
                  {product.tire_type} • {product.brand}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-orange-600">
                    €{Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">{t.productGrid.perTire}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(product.id, -1, product)}
                      disabled={currentQty <= 1}
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={availableStock > 0 ? availableStock : 1}
                      value={currentQty}
                      onChange={(e) => handleQuantityInput(product.id, e.target.value, product)}
                      onBlur={(e) => {
                        // Ensure valid value on blur
                        if (!e.target.value || parseInt(e.target.value) < 1) {
                          handleQuantityInput(product.id, '1', product);
                        }
                      }}
                      className="w-12 text-center font-medium border-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => updateQuantity(product.id, 1, product)}
                      disabled={plusDisabled}
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addDisabled}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg font-medium transition-all ${
                      addedToCart[product.id]
                        ? 'bg-green-600 text-white'
                        : addDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {addedToCart[product.id] ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t.productGrid.added}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>{t.productGrid.add}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">{t.productGrid.noProductsFound}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSeason('all');
              setSelectedType('all');
            }}
            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            {t.productGrid.clearFilters}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
