import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
import './ProductManagement.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // list, add, edit, bulk, inventory
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    originalPrice: '',
    description: '',
    images: [],
    stockQuantity: 0,
    minStockLevel: 5,
    sku: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    warranty: '',
    features: [],
    tags: [],
    isActive: true,
    isFeatured: false
  });

  // Bulk operations data
  const [bulkOperation, setBulkOperation] = useState({
    type: '',
    value: '',
    category: '',
    brand: '',
    discount: 0,
    priceAdjustment: 0
  });

  // Check admin access
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (!user.isAdmin) {
      navigate('/');
      return;
    }

    loadProducts();
    loadCategories();
    loadBrands();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/appliances`);
      if (response.ok) {
        const data = await response.json();
        const formattedProducts = (data.appliances || []).map(product => ({
          ...product,
          id: product._id,
          stockQuantity: product.stockQuantity || 0,
          minStockLevel: product.minStockLevel || 5,
          sku: product.sku || `${product.brand?.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
          weight: product.weight || '',
          dimensions: product.dimensions || { length: '', width: '', height: '' },
          warranty: product.warranty || '',
          features: product.features || [],
          tags: product.tags || [],
          isActive: product.isActive !== false,
          isFeatured: product.isFeatured === true
        }));
        setProducts(formattedProducts);
      } else {
        showNotification('Failed to load products', 'error');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Fallback to mock data
        const mockCategories = [
          { name: 'Refrigerators', productCount: 12 },
          { name: 'Washing Machines', productCount: 8 },
          { name: 'Dishwashers', productCount: 6 },
          { name: 'Air Conditioners', productCount: 10 },
          { name: 'Microwaves', productCount: 15 }
        ];
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brands`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      } else {
        // Fallback to mock data
        const mockBrands = [
          { name: 'Samsung', productCount: 15 },
          { name: 'LG', productCount: 12 },
          { name: 'Whirlpool', productCount: 8 },
          { name: 'Bosch', productCount: 10 },
          { name: 'Defy', productCount: 6 }
        ];
        setBrands(mockBrands);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureAdd = (feature) => {
    if (feature && !formData.features.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const handleFeatureRemove = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      price: '',
      originalPrice: '',
      description: '',
      images: [],
      stockQuantity: 0,
      minStockLevel: 5,
      sku: '',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      warranty: '',
      features: [],
      tags: [],
      isActive: true,
      isFeatured: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the auth token
      const userData = localStorage.getItem('userData');
      if (!userData) {
        showNotification('Please log in to manage products', 'error');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      const token = user.token;

      if (!token) {
        showNotification('Authentication required', 'error');
        navigate('/login');
        return;
      }

      // Prepare the data
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 5
      };

      // Generate SKU if not provided
      if (!productData.sku) {
        const brandCode = productData.brand.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        productData.sku = `${brandCode}-${timestamp}`;
      }

      let response;
      
      if (editingProduct) {
        // Update existing product
        response = await fetch(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Add new product
        response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
      }

      if (response.ok) {
        showNotification(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        resetForm();
        setCurrentView('list');
        setEditingProduct(null);
        await loadProducts(); // Reload products from server
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to save product', 'error');
      }

    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Error saving product. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingProduct(product);
    setCurrentView('add');
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          showNotification('Please log in to manage products', 'error');
          return;
        }

        const user = JSON.parse(userData);
        const token = user.token;

        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setProducts(prev => prev.filter(p => p.id !== productId));
          showNotification('Product deleted successfully!');
        } else {
          const errorData = await response.json();
          showNotification(errorData.error || 'Failed to delete product', 'error');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
      }
    }
  };

  const handleBulkSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    const filteredProductIds = getFilteredProducts().map(p => p.id);
    setSelectedProducts(prev => 
      prev.length === filteredProductIds.length ? [] : filteredProductIds
    );
  };

  const handleBulkOperation = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        showNotification('Please log in to manage products', 'error');
        return;
      }

      const user = JSON.parse(userData);
      const token = user.token;

      // Prepare bulk operation data
      const bulkData = {
        productIds: selectedProducts,
        operation: bulkOperation.type,
        data: {}
      };

      switch (bulkOperation.type) {
        case 'updateCategory':
          bulkData.data.category = bulkOperation.category;
          break;
        case 'updateBrand':
          bulkData.data.brand = bulkOperation.brand;
          break;
        case 'applyDiscount':
          bulkData.data.discount = bulkOperation.discount;
          break;
        case 'adjustPrice':
          bulkData.data.priceAdjustment = bulkOperation.priceAdjustment;
          break;
      }

      const response = await fetch(`${API_BASE_URL}/api/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bulkData)
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedProducts([]);
        setShowBulkActions(false);
        setBulkOperation({ type: '', value: '', category: '', brand: '', discount: 0, priceAdjustment: 0 });
        showNotification(result.message);
        await loadProducts(); // Reload products from server
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Bulk operation failed', 'error');
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      showNotification('Error applying bulk operation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || product.category === filterCategory;
      const matchesBrand = !filterBrand || product.brand === filterBrand;
      
      return matchesSearch && matchesCategory && matchesBrand;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'stock':
          return a.stockQuantity - b.stockQuantity;
        case 'brand':
          return a.brand.localeCompare(b.brand);
        default:
          return 0;
      }
    });
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stockQuantity <= product.minStockLevel);
  };

  const renderProductList = () => (
    <div className="product-list-container">
      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products, brands, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.name}>{brand.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="brand">Sort by Brand</option>
          </select>
        </div>

        <div className="bulk-controls">
          <button 
            className="select-all-btn"
            onClick={handleSelectAll}
          >
            {selectedProducts.length === getFilteredProducts().length ? 'Deselect All' : 'Select All'}
          </button>
          
          {selectedProducts.length > 0 && (
            <button 
              className="bulk-actions-btn"
              onClick={() => setShowBulkActions(true)}
            >
              Bulk Actions ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="products-grid">
        {getFilteredProducts().map(product => (
          <div key={product.id} className={`product-card ${!product.isActive ? 'inactive' : ''}`}>
            <div className="product-select">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => handleBulkSelect(product.id)}
              />
            </div>

            <div className="product-image">
              {product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
              {product.isFeatured && <div className="featured-badge">Featured</div>}
            </div>

            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="brand">{product.brand}</p>
              <p className="category">{product.category}</p>
              <p className="sku">SKU: {product.sku}</p>
              
              <div className="price-info">
                <span className="current-price">R{product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="original-price">R{product.originalPrice.toLocaleString()}</span>
                )}
              </div>

              <div className={`stock-info ${product.stockQuantity <= product.minStockLevel ? 'low-stock' : ''}`}>
                Stock: {product.stockQuantity} units
                {product.stockQuantity <= product.minStockLevel && (
                  <span className="low-stock-warning">⚠️ Low Stock</span>
                )}
              </div>
            </div>

            <div className="product-actions">
              <button onClick={() => handleEdit(product)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(product.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {getFilteredProducts().length === 0 && (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );

  const renderProductForm = () => (
    <div className="product-form-container">
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Brand *</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.name}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Pricing</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Current Price (R) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Original Price (R)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Inventory</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Minimum Stock Level</label>
              <input
                type="number"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Product Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Weight</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 65kg"
              />
            </div>

            <div className="form-group">
              <label>Warranty</label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleInputChange}
                placeholder="e.g., 2 years"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dimensions</label>
            <div className="dimensions-input">
              <input
                type="text"
                name="dimensions.length"
                value={formData.dimensions.length}
                onChange={handleInputChange}
                placeholder="Length"
              />
              <span>×</span>
              <input
                type="text"
                name="dimensions.width"
                value={formData.dimensions.width}
                onChange={handleInputChange}
                placeholder="Width"
              />
              <span>×</span>
              <input
                type="text"
                name="dimensions.height"
                value={formData.dimensions.height}
                onChange={handleInputChange}
                placeholder="Height"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Images</h3>
          
          <div className="image-upload">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="upload-btn"
            >
              Upload Images
            </button>
          </div>

          <div className="image-preview">
            {formData.images.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image} alt={`Product ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Features & Tags</h3>
          
          <div className="form-group">
            <label>Features</label>
            <div className="tag-input">
              <input
                type="text"
                placeholder="Add feature and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFeatureAdd(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="tags-list">
              {formData.features.map((feature, index) => (
                <span key={index} className="tag">
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleFeatureRemove(feature)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input">
              <input
                type="text"
                placeholder="Add tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Status</h3>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Active Product
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
              />
              Featured Product
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              setCurrentView('list');
              setEditingProduct(null);
              resetForm();
            }}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );

  const renderInventoryManagement = () => {
    const [inventoryData, setInventoryData] = useState(null);
    const [loadingInventory, setLoadingInventory] = useState(true);

    useEffect(() => {
      const loadInventoryData = async () => {
        try {
          const userData = localStorage.getItem('userData');
          if (!userData) return;

          const user = JSON.parse(userData);
          const token = user.token;

          const response = await fetch(`${API_BASE_URL}/api/inventory`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setInventoryData(data);
          }
        } catch (error) {
          console.error('Error loading inventory data:', error);
        } finally {
          setLoadingInventory(false);
        }
      };

      loadInventoryData();
    }, []);

    const handleRestockProduct = async (productId, currentStock) => {
      const newQuantity = prompt('Enter new stock quantity:', currentStock);
      if (newQuantity && !isNaN(newQuantity)) {
        try {
          const userData = localStorage.getItem('userData');
          const user = JSON.parse(userData);
          const token = user.token;

          const response = await fetch(`${API_BASE_URL}/api/products/${productId}/stock`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stockQuantity: parseInt(newQuantity) })
          });

          if (response.ok) {
            showNotification('Stock updated successfully!');
            // Reload inventory data
            const inventoryResponse = await fetch(`${API_BASE_URL}/api/inventory`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (inventoryResponse.ok) {
              const data = await inventoryResponse.json();
              setInventoryData(data);
            }
            // Also reload products list
            await loadProducts();
          } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to update stock', 'error');
          }
        } catch (error) {
          console.error('Error updating stock:', error);
          showNotification('Error updating stock', 'error');
        }
      }
    };

    if (loadingInventory) {
      return (
        <div className="inventory-container">
          <h3>Inventory Management</h3>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loader"></div>
            <p>Loading inventory data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="inventory-container">
        <h3>Inventory Management</h3>
        
        <div className="inventory-stats">
          <div className="stat-card">
            <h4>Total Products</h4>
            <span className="stat-number">{inventoryData?.totalProducts || products.length}</span>
          </div>
          <div className="stat-card">
            <h4>Low Stock Alerts</h4>
            <span className="stat-number warning">{inventoryData?.lowStockCount || getLowStockProducts().length}</span>
          </div>
          <div className="stat-card">
            <h4>Total Value</h4>
            <span className="stat-number">
              R{(inventoryData?.totalValue || products.reduce((total, product) => total + (product.price * product.stockQuantity), 0)).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="low-stock-section">
          <h4>Low Stock Products</h4>
          {(inventoryData?.lowStockProducts || getLowStockProducts()).length === 0 ? (
            <p>All products are adequately stocked.</p>
          ) : (
            <div className="low-stock-list">
              {(inventoryData?.lowStockProducts || getLowStockProducts()).map(product => (
                <div key={product._id || product.id} className="low-stock-item">
                  <div className="product-info">
                    <h5>{product.name}</h5>
                    <p>{product.brand} - {product.category}</p>
                    <p>SKU: {product.sku}</p>
                  </div>
                  <div className="stock-info">
                    <span className="current-stock">{product.stockQuantity} units</span>
                    <span className="min-level">Min: {product.minStockLevel}</span>
                  </div>
                  <button 
                    className="restock-btn"
                    onClick={() => handleRestockProduct(product._id || product.id, product.stockQuantity)}
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategoryBrandManagement = () => (
    <div className="category-brand-container">
      <div className="categories-section">
        <h3>Categories</h3>
        <div className="management-grid">
          {categories.map(category => (
            <div key={category.id} className="management-card">
              <h4>{category.name}</h4>
              <p>{category.productCount} products</p>
              <div className="card-actions">
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
          <div className="add-card">
            <button 
              className="add-btn"
              onClick={() => {
                const name = prompt('Enter category name:');
                if (name) {
                  setCategories(prev => [...prev, {
                    id: Date.now(),
                    name,
                    productCount: 0
                  }]);
                  showNotification('Category added successfully!');
                }
              }}
            >
              + Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="brands-section">
        <h3>Brands</h3>
        <div className="management-grid">
          {brands.map(brand => (
            <div key={brand.id} className="management-card">
              <h4>{brand.name}</h4>
              <p>{brand.productCount} products</p>
              <div className="card-actions">
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
          <div className="add-card">
            <button 
              className="add-btn"
              onClick={() => {
                const name = prompt('Enter brand name:');
                if (name) {
                  setBrands(prev => [...prev, {
                    id: Date.now(),
                    name,
                    productCount: 0
                  }]);
                  showNotification('Brand added successfully!');
                }
              }}
            >
              + Add Brand
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="product-management">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="management-header">
        <h1>Product Management</h1>
        <div className="view-tabs">
          <button 
            className={currentView === 'list' ? 'active' : ''}
            onClick={() => setCurrentView('list')}
          >
            Product List
          </button>
          <button 
            className={currentView === 'add' ? 'active' : ''}
            onClick={() => {
              setCurrentView('add');
              setEditingProduct(null);
              resetForm();
            }}
          >
            Add Product
          </button>
          <button 
            className={currentView === 'inventory' ? 'active' : ''}
            onClick={() => setCurrentView('inventory')}
          >
            Inventory
          </button>
          <button 
            className={currentView === 'categories' ? 'active' : ''}
            onClick={() => setCurrentView('categories')}
          >
            Categories & Brands
          </button>
        </div>
      </div>

      <div className="management-content">
        {currentView === 'list' && renderProductList()}
        {currentView === 'add' && renderProductForm()}
        {currentView === 'inventory' && renderInventoryManagement()}
        {currentView === 'categories' && renderCategoryBrandManagement()}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="modal-overlay">
          <div className="bulk-actions-modal">
            <h3>Bulk Operations</h3>
            <p>Selected products: {selectedProducts.length}</p>
            
            <div className="bulk-form">
              <div className="form-group">
                <label>Operation</label>
                <select
                  value={bulkOperation.type}
                  onChange={(e) => setBulkOperation(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="">Select Operation</option>
                  <option value="updateCategory">Update Category</option>
                  <option value="updateBrand">Update Brand</option>
                  <option value="applyDiscount">Apply Discount</option>
                  <option value="adjustPrice">Adjust Price</option>
                  <option value="activate">Activate Products</option>
                  <option value="deactivate">Deactivate Products</option>
                  <option value="feature">Feature Products</option>
                  <option value="unfeature">Unfeature Products</option>
                </select>
              </div>

              {bulkOperation.type === 'updateCategory' && (
                <div className="form-group">
                  <label>New Category</label>
                  <select
                    value={bulkOperation.category}
                    onChange={(e) => setBulkOperation(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {bulkOperation.type === 'updateBrand' && (
                <div className="form-group">
                  <label>New Brand</label>
                  <select
                    value={bulkOperation.brand}
                    onChange={(e) => setBulkOperation(prev => ({ ...prev, brand: e.target.value }))}
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.name}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {bulkOperation.type === 'applyDiscount' && (
                <div className="form-group">
                  <label>Discount Percentage</label>
                  <input
                    type="number"
                    value={bulkOperation.discount}
                    onChange={(e) => setBulkOperation(prev => ({ ...prev, discount: parseFloat(e.target.value) }))}
                    placeholder="Enter discount %"
                    min="0"
                    max="100"
                  />
                </div>
              )}

              {bulkOperation.type === 'adjustPrice' && (
                <div className="form-group">
                  <label>Price Adjustment (R)</label>
                  <input
                    type="number"
                    value={bulkOperation.priceAdjustment}
                    onChange={(e) => setBulkOperation(prev => ({ ...prev, priceAdjustment: parseFloat(e.target.value) }))}
                    placeholder="Enter amount (+/-)"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowBulkActions(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkOperation}
                disabled={!bulkOperation.type || loading}
                className="apply-btn"
              >
                {loading ? 'Applying...' : 'Apply Operation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;