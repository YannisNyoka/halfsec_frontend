import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProductForm from './ProductForm';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      console.log('AdminDashboard - checking user:', user);
      
      // Check if user has admin privileges (using server-provided isAdmin flag)
      if (!user.isAdmin) {
        console.log('User is not admin, redirecting to dashboard');
        navigate('/dashboard');
        return;
      }
      
      console.log('User is admin, loading admin data');
      loadAdminData();
    } catch (err) {
      console.error('Error checking admin access:', err);
      navigate('/login');
    }
  }, [navigate]);

  const loadAdminData = async () => {
    try {
      // Load products
      const productsResponse = await fetch('http://localhost:3001/api/appliances');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.appliances || []);
      }

      // Simulate loading other data (in real app, these would be API calls)
      const mockUsers = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', joinDate: '2024-01-15', status: 'Active' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', joinDate: '2024-01-18', status: 'Active' },
        { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', joinDate: '2024-01-20', status: 'Inactive' }
      ];

      const mockOrders = [
        { id: 'ORD001', customerName: 'John Doe', total: 15999, status: 'Delivered', date: '2024-01-15', items: 1 },
        { id: 'ORD002', customerName: 'Jane Smith', total: 8999, status: 'Shipping', date: '2024-01-18', items: 1 },
        { id: 'ORD003', customerName: 'Bob Johnson', total: 12999, status: 'Processing', date: '2024-01-20', items: 2 }
      ];

      const mockReviews = [
        { id: 1, productName: 'Samsung 55" Smart TV', customerName: 'John Doe', rating: 5, comment: 'Excellent TV!', status: 'Approved', date: '2024-01-16' },
        { id: 2, productName: 'LG Washing Machine', customerName: 'Jane Smith', rating: 4, comment: 'Good quality', status: 'Pending', date: '2024-01-19' }
      ];

      setUsers(mockUsers);
      setOrders(mockOrders);
      setReviews(mockReviews);

      // Calculate stats
      const totalSales = mockOrders.reduce((sum, order) => sum + order.total, 0);
      setStats({
        totalSales,
        totalOrders: mockOrders.length,
        totalUsers: mockUsers.length,
        totalProducts: productsData.appliances?.length || 0
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p._id !== productId));
      // Removed annoying popup - product will disappear from list showing success
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    // Removed annoying popup - status change will be visible in table
  };

  const moderateReview = (reviewId, action) => {
    setReviews(reviews.map(review => 
      review.id === reviewId ? { ...review, status: action } : review
    ));
    // Removed annoying popup - status change will be visible in table
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { 
        ...user, 
        status: user.status === 'Active' ? 'Inactive' : 'Active' 
      } : user
    ));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleProductFormSave = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    // Reload products data
    loadAdminData();
  };

  const handleProductFormCancel = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {/* Admin Navigation */}
      <nav className="admin-navbar">
        <div className="admin-navbar-left">
          <Link to="/dashboard" className="admin-logo">HalfSec Admin</Link>
        </div>
        <div className="admin-navbar-right">
          <Link 
            to="/dashboard"
            className="back-to-site"
            onClick={() => {
              console.log('Back to Site link clicked');
              sessionStorage.setItem('viewAsSite', 'true');
              console.log('viewAsSite flag set:', sessionStorage.getItem('viewAsSite'));
            }}
          >
            ← Back to Site
          </Link>
          <button 
            className="admin-logout"
            onClick={() => {
              localStorage.removeItem('userToken');
              localStorage.removeItem('user');
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Admin Content */}
      <div className="admin-dashboard">
        <div className="admin-container">
          <h1 className="admin-title">Admin Dashboard</h1>

          {/* Admin Navigation Tabs */}
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products ({products.length})
            </button>
            <button 
              className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              🛒 Orders ({orders.length})
            </button>
            <button 
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users ({users.length})
            </button>
            <button 
              className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              ⭐ Reviews ({reviews.length})
            </button>
            <Link to="/analytics" className="admin-tab analytics-link">
              📈 Analytics
            </Link>
            <Link to="/product-management" className="admin-tab product-management-link">
              🔧 Product Management
            </Link>
          </div>

          {/* Tab Content */}
          <div className="admin-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-details">
                      <h3>Total Sales</h3>
                      <p>R{stats.totalSales.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-details">
                      <h3>Total Orders</h3>
                      <p>{stats.totalOrders}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-details">
                      <h3>Total Users</h3>
                      <p>{stats.totalUsers}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-details">
                      <h3>Total Products</h3>
                      <p>{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="recent-activity">
                  <h2>Recent Activity</h2>
                  <div className="activity-list">
                    <div className="activity-item">
                      <span className="activity-icon">🛒</span>
                      <span>New order #ORD003 from Bob Johnson</span>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon">⭐</span>
                      <span>New review on Samsung 55" Smart TV</span>
                      <span className="activity-time">4 hours ago</span>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon">👤</span>
                      <span>New user registration: jane@example.com</span>
                      <span className="activity-time">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="products-tab">
                <div className="tab-header">
                  <h2>Product Management</h2>
                  <button className="add-btn" onClick={handleAddProduct}>+ Add New Product</button>
                </div>
                
                <div className="products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <img 
                              src={product.image || '/images/default-appliance.jpg'} 
                              alt={product.name}
                              className="product-thumb"
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>{product.brand}</td>
                          <td>{product.category}</td>
                          <td>R{product.price?.toLocaleString()}</td>
                          <td>
                            <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="edit-btn"
                                onClick={() => handleEditProduct(product)}
                              >
                                Edit
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => deleteProduct(product._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="orders-tab">
                <h2>Order Management</h2>
                
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.customerName}</td>
                          <td>{new Date(order.date).toLocaleDateString()}</td>
                          <td>{order.items}</td>
                          <td>R{order.total.toLocaleString()}</td>
                          <td>
                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={order.status} 
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="status-select"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipping">Shipping</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-tab">
                <h2>User Management</h2>
                
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Join Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${user.status.toLowerCase()}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className={user.status === 'Active' ? 'deactivate-btn' : 'activate-btn'}
                                onClick={() => toggleUserStatus(user.id)}
                              >
                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="view-btn">View Details</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <h2>Review Moderation</h2>
                
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-info">
                          <h4>{review.productName}</h4>
                          <p>by {review.customerName}</p>
                          <div className="review-rating">
                            {'⭐'.repeat(review.rating)}
                          </div>
                        </div>
                        <div className="review-meta">
                          <span className={`status-badge ${review.status.toLowerCase()}`}>
                            {review.status}
                          </span>
                          <span className="review-date">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="review-comment">
                        {review.comment}
                      </div>
                      <div className="review-actions">
                        <button 
                          className="approve-btn"
                          onClick={() => moderateReview(review.id, 'Approved')}
                          disabled={review.status === 'Approved'}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => moderateReview(review.id, 'Rejected')}
                          disabled={review.status === 'Rejected'}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleProductFormSave}
          onCancel={handleProductFormCancel}
        />
      )}
    </>
  );
}

export default AdminDashboard;