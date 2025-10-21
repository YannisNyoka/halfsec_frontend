import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserProfile.css';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if admin wants to view the site (bypass admin redirect)
      const viewAsSite = sessionStorage.getItem('viewAsSite');
      
      // If user is admin, redirect to admin dashboard
      // UNLESS they specifically want to view the site
      if (parsedUser.isAdmin && !viewAsSite) {
        console.log('Admin user detected on user profile, redirecting to admin dashboard');
        navigate('/admin');
        return;
      } else if (viewAsSite) {
        // Clear the flag after using it
        sessionStorage.removeItem('viewAsSite');
        console.log('Admin viewing profile as regular user');
      }
      
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || '',
        city: parsedUser.city || '',
        province: parsedUser.province || ''
      });
      
      loadUserData();
      updateCartCount();
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate]);

  const loadUserData = async () => {
    try {
      // Load wishlist from localStorage
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(savedWishlist);
      
      // Simulate loading orders (in real app, this would be an API call)
      const mockOrders = [
        {
          id: 'ORD001',
          date: '2024-01-15',
          total: 15999,
          status: 'Delivered',
          items: [
            { name: 'Samsung 55" Smart TV', price: 15999, quantity: 1 }
          ]
        },
        {
          id: 'ORD002',
          date: '2024-01-20',
          total: 8999,
          status: 'Shipping',
          items: [
            { name: 'LG Washing Machine', price: 8999, quantity: 1 }
          ]
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Update user in localStorage (in real app, this would be an API call)
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      // Removed annoying popup - form exits edit mode showing success
    } catch (error) {
      // Removed annoying popup - show error message in form instead
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const addToCartFromWishlist = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    // Removed annoying popup - cart count update shows success
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/dashboard" className="logo">HalfSec</Link>
          <ul className="nav-menu">
            <select name="Shop" className="nav-item">
              <option>Shop</option>
              <option>Small Appliances</option>
              <option>Large Appliances</option>
            </select>
            <select name="Promotion" className="nav-item">
              <option>Promotions</option>
              <option>Samsung</option>
              <option>LG</option>
              <option>Bennett Read</option>
            </select>
            <li className="nav-item">EasyFix</li>
            <li className="nav-item">Contact Us</li>
          </ul>
        </div>
        <div className="navbar-right">
          <form className="nav-search">
            <input type="text" placeholder="What are you looking for?" />
            <button type="submit" aria-label="Search">&#128269;</button>
          </form>
          <Link to="/cart" className="nav-cart">
            <span className="cart-icon">&#128722;</span>
            <span className="cart-badge">{cartCount}</span>
            <span className="cart-label">Cart</span>
          </Link>
          <div className="nav-profile active">
            <span className="profile-icon">&#128100;</span>
            <span className="profile-label">Profile</span>
          </div>
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
          🔧 Admin Mode: Viewing profile as customer | <Link to="/admin" style={{color: '#fff', textDecoration: 'underline'}}>Return to Admin Panel</Link>
        </div>
      )}

      {/* Profile Content */}
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-breadcrumb">
            <Link to="/dashboard">Home</Link> &gt; 
            <span>My Profile</span>
          </div>

          <h1 className="profile-title">My Account</h1>

          <div className="profile-content">
            {/* Profile Sidebar */}
            <div className="profile-sidebar">
              <div className="profile-info">
                <div className="profile-avatar">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="profile-name">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="profile-email">{user?.email}</div>
              </div>

              <nav className="profile-nav">
                <button 
                  className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  👤 Profile Information
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  📦 Order History
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => setActiveTab('wishlist')}
                >
                  ❤️ Wishlist ({wishlist.length})
                </button>
                <button 
                  className="profile-nav-item logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </nav>
            </div>

            {/* Profile Main Content */}
            <div className="profile-main">
              {activeTab === 'profile' && (
                <div className="profile-tab">
                  <div className="tab-header">
                    <h2>Profile Information</h2>
                    <button 
                      className="edit-btn"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!editMode}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={!editMode}
                        />
                      </div>
                      <div className="form-group">
                        <label>Province</label>
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          disabled={!editMode}
                        >
                          <option value="">Select Province</option>
                          <option value="Eastern Cape">Eastern Cape</option>
                          <option value="Free State">Free State</option>
                          <option value="Gauteng">Gauteng</option>
                          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                          <option value="Limpopo">Limpopo</option>
                          <option value="Mpumalanga">Mpumalanga</option>
                          <option value="North West">North West</option>
                          <option value="Northern Cape">Northern Cape</option>
                          <option value="Western Cape">Western Cape</option>
                        </select>
                      </div>
                    </div>

                    {editMode && (
                      <button type="submit" className="save-btn">
                        Save Changes
                      </button>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="profile-tab">
                  <h2>Order History</h2>
                  <div className="orders-list">
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <div key={order.id} className="order-card">
                          <div className="order-header">
                            <div className="order-info">
                              <h3>Order #{order.id}</h3>
                              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <div className="order-status">
                              <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="order-items">
                            {order.items.map((item, index) => (
                              <div key={index} className="order-item">
                                <span>{item.name}</span>
                                <span>Qty: {item.quantity}</span>
                                <span>R{item.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="order-total">
                            Total: R{order.total.toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No orders found</p>
                        <Link to="/dashboard" className="shop-btn">Start Shopping</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="profile-tab">
                  <h2>My Wishlist</h2>
                  <div className="wishlist-grid">
                    {wishlist.length > 0 ? (
                      wishlist.map((item) => (
                        <div key={item.id} className="wishlist-card">
                          <Link to={`/product/${item.id}`} className="wishlist-link">
                            <img
                              src={item.image || '/images/default-appliance.jpg'}
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = '/images/default-appliance.jpg';
                              }}
                            />
                            <div className="wishlist-info">
                              <div className="wishlist-brand">{item.brand}</div>
                              <h3>{item.name}</h3>
                              <div className="wishlist-price">R{item.price?.toLocaleString()}</div>
                            </div>
                          </Link>
                          <div className="wishlist-actions">
                            <button 
                              className="add-to-cart-btn"
                              onClick={() => addToCartFromWishlist(item)}
                            >
                              Add to Cart
                            </button>
                            <button 
                              className="remove-btn"
                              onClick={() => removeFromWishlist(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>Your wishlist is empty</p>
                        <Link to="/dashboard" className="shop-btn">Browse Products</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-columns">
            <div className="footer-col">
              <div className="footer-col-title">ABOUT</div>
              <a href="#">About HalfSec</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
              <a href="#">Investor Relations</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">CUSTOMER SERVICE</div>
              <a href="#">Contact Us</a>
              <a href="#">Help Center</a>
              <a href="#">Returns</a>
              <a href="#">Track Your Order</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">LEGAL</div>
              <a href="#">Terms of Service</a>
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

export default UserProfile;