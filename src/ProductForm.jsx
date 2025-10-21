import React, { useState, useEffect } from 'react';
import './ProductForm.css';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    description: '',
    imageUrl: '',
    inStock: true,
    specifications: {
      dimensions: '',
      weight: '',
      capacity: '',
      energyRating: '',
      warranty: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Categories for appliances
  const categories = [
    'Washing Machines',
    'Refrigerators',
    'Dishwashers',
    'Dryers',
    'Ovens',
    'Air Conditioners',
    'Water Heaters',
    'Small Appliances'
  ];

  // Popular brands
  const brands = [
    'Samsung',
    'LG',
    'Whirlpool',
    'Bosch',
    'Electrolux',
    'Defy',
    'Hisense',
    'KIC',
    'Speed Queen'
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        inStock: product.inStock !== undefined ? product.inStock : true,
        specifications: {
          dimensions: product.specifications?.dimensions || '',
          weight: product.specifications?.weight || '',
          capacity: product.specifications?.capacity || '',
          energyRating: product.specifications?.energyRating || '',
          warranty: product.specifications?.warranty || ''
        }
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('spec_')) {
      const specName = name.replace('spec_', '');
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = product 
        ? `http://localhost:3000/api/admin/products/${product._id}`
        : 'http://localhost:3000/api/admin/products';
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      const data = await response.json();

      if (data.success) {
        onSave();
      } else {
        setErrors({ submit: data.error || 'Failed to save product' });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-overlay">
      <div className="product-form-container">
        <div className="product-form-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter product name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="brand">Brand *</label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={errors.brand ? 'error' : ''}
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  {errors.brand && <span className="error-text">{errors.brand}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <span className="error-text">{errors.category}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (ZAR) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={errors.price ? 'error' : ''}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.price && <span className="error-text">{errors.price}</span>}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                    />
                    In Stock
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? 'error' : ''}
                  placeholder="Enter product description"
                  rows="4"
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Specifications</h3>
              
              <div className="form-group">
                <label htmlFor="spec_dimensions">Dimensions</label>
                <input
                  type="text"
                  id="spec_dimensions"
                  name="spec_dimensions"
                  value={formData.specifications.dimensions}
                  onChange={handleInputChange}
                  placeholder="e.g., 60cm x 65cm x 85cm"
                />
              </div>

              <div className="form-group">
                <label htmlFor="spec_weight">Weight</label>
                <input
                  type="text"
                  id="spec_weight"
                  name="spec_weight"
                  value={formData.specifications.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 75kg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="spec_capacity">Capacity</label>
                <input
                  type="text"
                  id="spec_capacity"
                  name="spec_capacity"
                  value={formData.specifications.capacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 8kg, 500L"
                />
              </div>

              <div className="form-group">
                <label htmlFor="spec_energyRating">Energy Rating</label>
                <select
                  id="spec_energyRating"
                  name="spec_energyRating"
                  value={formData.specifications.energyRating}
                  onChange={handleInputChange}
                >
                  <option value="">Select Rating</option>
                  <option value="A+++">A+++</option>
                  <option value="A++">A++</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="ENERGY STAR">ENERGY STAR</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="spec_warranty">Warranty</label>
                <input
                  type="text"
                  id="spec_warranty"
                  name="spec_warranty"
                  value={formData.specifications.warranty}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 Years Parts & Labor"
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;