import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [filteredAppliances, setFilteredAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      // User not authenticated, redirect to login
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if admin wants to view the site (bypass admin redirect)
      const viewAsSite = sessionStorage.getItem('viewAsSite');
      console.log('Dashboard: parsedUser.isAdmin =', parsedUser.isAdmin);
      console.log('Dashboard: viewAsSite flag =', viewAsSite);
      
      // If user is admin, redirect to admin dashboard
      // UNLESS they specifically want to view the site
      if (parsedUser.isAdmin && !viewAsSite) {
        console.log('Admin user detected on regular dashboard, redirecting to admin dashboard');
        navigate('/admin');
        return;
      } else if (viewAsSite) {
        // Clear the flag after using it
        sessionStorage.removeItem('viewAsSite');
        console.log('Admin viewing dashboard as regular user');
      }
      
      // Fetch appliances and cart count
      fetchAppliances();
      updateCartCount();
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  };

  const fetchAppliances = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appliances`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const appliancesData = data.appliances || [];
        setAppliances(appliancesData);
        setFilteredAppliances(appliancesData);
      } else {
        throw new Error('Failed to fetch appliances');
      }
    } catch (err) {
      setError('Failed to load appliances');
      console.error('Fetch appliances error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = appliances;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appliance =>
        appliance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appliance.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appliance.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(appliance =>
        appliance.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(appliance =>
        appliance.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(appliance => {
        const price = appliance.price;
        const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        default:
          return 0;
      }
    });

    setFilteredAppliances(filtered);
  }, [appliances, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
  };

  // Get unique categories and brands for filter options
  const categories = [...new Set(appliances.map(item => item.category))];
  const brands = [...new Set(appliances.map(item => item.brand))];

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const addToCart = (appliance) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === appliance._id || item.id === appliance.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: appliance._id || appliance.id,
        name: appliance.name,
        price: appliance.price,
        image: appliance.image,
        brand: appliance.brand,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    // Removed annoying popup - cart count update shows success
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Bar - Same as HomePage */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">HalfSec</div>
          <ul className="nav-menu">
            <select name="Shop" className="nav-item">
              <option className="nav-item">Shop</option>
              <option className="nav-item">Small Appliances</option>
              <option className="nav-item">Large Appliances</option>
            </select>
            <select name="Promotion" className="nav-item">
              <option className="nav-item">Promotions</option>
              <option className="nav-item">Samsung</option>
              <option className="nav-item">LG</option>
              <option className="nav-item">Bennett Read</option>
            </select>
            <li className="nav-item">EasyFix</li>
            <li className="nav-item">Contact Us</li>
          </ul>
        </div>
        <div className="navbar-right">
          <form className="nav-search" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" aria-label="Search">&#128269;</button>
          </form>
          <Link to="/cart" className="nav-cart">
            <span className="cart-icon">&#128722;</span>
            <span className="cart-badge">{cartCount}</span>
            <span className="cart-label">Cart</span>
          </Link>
          <Link to="/profile" className="nav-profile">
            <span className="profile-icon">&#128100;</span>
            <span className="profile-label">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Admin Viewing Indicator */}
      {user && user.isAdmin && (
        <div style={{
          background: 'linear-gradient(135deg, #ff9900, #ff6600)',
          color: '#fff',
          padding: '0.5rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          🔧 Admin Mode: Viewing dashboard as customer | <Link to="/admin" style={{color: '#fff', textDecoration: 'underline'}}>Return to Admin Panel</Link>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="dashboard">
        <main className="dashboard-main">
          <div className="dashboard-container">
            <h1>Welcome, {user?.firstName} {user?.lastName}!</h1>
            <p className="subtitle">Browse our collection of premium appliances</p>

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={fetchAppliances} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}

            {/* Filters Section */}
            <div className="filters-section">
              <div className="filters-header">
                <h3>Filter Products</h3>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All Filters
                </button>
              </div>
              
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Brand</label>
                  <select 
                    value={selectedBrand} 
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Price Range</label>
                  <div className="price-range">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                    <option value="brand">Brand</option>
                  </select>
                </div>
              </div>
              
              <div className="results-count">
                Showing {filteredAppliances.length} of {appliances.length} products
              </div>
            </div>

            {/* Appliances Grid */}
            <div className="appliances-grid">
              {filteredAppliances.length > 0 ? (
                filteredAppliances.map((appliance) => (
                  <div key={appliance._id || appliance.id} className="appliance-card">
                    <Link to={`/product/${appliance._id || appliance.id}`} className="product-link">
                      <div className="appliance-image">
                        <img 
                          src={appliance.image || '/images/default-appliance.jpg'} 
                          alt={appliance.name}
                          onError={(e) => {
                            e.target.src = '/images/default-appliance.jpg';
                          }}
                        />
                      </div>
                      
                      <div className="appliance-info">
                        <h3 className="appliance-name">{appliance.name}</h3>
                        <p className="appliance-description">{appliance.description}</p>
                        <p className="appliance-category">{appliance.category}</p>
                        
                        <div className="appliance-footer">
                          <span className="appliance-price">
                            R{appliance.price ? appliance.price.toLocaleString('en-ZA', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="card-actions">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(appliance);
                        }}
                        className="add-to-cart-btn"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-appliances">
                  <h3>{appliances.length === 0 ? 'No Appliances Available' : 'No Products Match Your Filters'}</h3>
                  <p>{appliances.length === 0 ? "We're currently updating our catalog. Please check back soon!" : 'Try adjusting your filters to see more products.'}</p>
                  {appliances.length > 0 && (
                    <button onClick={clearFilters} className="clear-filters-btn">
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Footer - Same as HomePage */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-columns">
            <div className="footer-col">
              <div className="footer-col-title">ABOUT</div>
              <a href="#">About Us</a>
              <a href="#">How it Works</a>
              <a href="#">Testimonials</a>
              <a href="#">Blog</a>
              <a href="#">Articles</a>
              <a href="#">Refer a Friend</a>
              <a href="#">EasyFix</a>
              <a href="#">HalfSec Business</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">HELP</div>
              <a href="#">FAQs</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">LEGAL</div>
              <a href="#">PAIA</a>
              <a href="#">Disclaimer</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
          <div className="footer-brand">
            <div className="footer-logo">HalfSec</div>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook" className="footer-social-icon">&#xf09a;</a>
              <a href="#" aria-label="Instagram" className="footer-social-icon">&#xf16d;</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Dashboard;