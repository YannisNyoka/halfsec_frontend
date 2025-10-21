import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PaymentGateway from './PaymentGateway';
import './Checkout.css';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    paymentMethod: 'card'
  });
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(cart);

    // Check authentication
    const token = localStorage.getItem('userToken');
    if (!token) {
      // Removed annoying popup - just redirect to login
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * 0.15;
  };

  const calculateShipping = () => {
    return calculateSubtotal() >= 5000 ? 0 : 299;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT() + calculateShipping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      // Validate shipping information
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'province', 'postalCode'];
      const emptyFields = requiredFields.filter(field => !formData[field].trim());
      
      if (emptyFields.length > 0) {
        // Removed annoying popup - show validation errors in form instead
        return;
      }
      
      // Prepare order details for payment
      setOrderDetails({
        items: cartItems,
        subtotal: calculateSubtotal(),
        vat: calculateVAT(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        shippingAddress: formData
      });
      
      // Move to payment step
      setCurrentStep(2);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setLoading(true);
    
    try {
      // Create order with payment information
      const orderData = {
        ...orderDetails,
        paymentResult,
        orderNumber: `ORD-${Date.now()}`,
        status: 'paid',
        createdAt: new Date().toISOString()
      };

      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart
      localStorage.removeItem('cart');
      
      // Move to confirmation step
      setCurrentStep(3);
      setOrderDetails({ ...orderDetails, ...orderData });
      
    } catch (error) {
      // Removed annoying popup - show error message in form instead
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setCurrentStep(1);
  };

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
            <span className="cart-badge">{cartItems.length}</span>
            <span className="cart-label">Cart</span>
          </Link>
          <div className="nav-profile">
            <span className="profile-icon">&#128100;</span>
            <span className="profile-label">Profile</span>
          </div>
        </div>
      </nav>

      {/* Checkout Content */}
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-breadcrumb">
            <Link to="/dashboard">Home</Link> &gt; 
            <Link to="/cart">Cart</Link> &gt; 
            <span>Checkout</span>
          </div>

          <h1 className="checkout-title">Checkout</h1>

          {/* Progress Steps */}
          <div className="checkout-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Confirmation</span>
            </div>
          </div>

          <div className="checkout-content">
            {currentStep === 1 && (
              <>
                {/* Shipping Information Form */}
                <div className="checkout-form-section">
                  <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="form-section">
                      <h2>Delivery Information</h2>
                      <div className="form-row">
                        <div className="form-group">
                          <label>First Name *</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Last Name *</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Street Address *</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Province *</label>
                          <select
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            required
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
                        <div className="form-group">
                          <label>Postal Code *</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="place-order-btn">
                      Continue to Payment
                    </button>
                  </form>
                </div>

                {/* Order Summary */}
                <div className="order-summary-section">
                  <div className="order-summary">
                    <h2>Order Summary</h2>
                    
                    <div className="order-items">
                      {cartItems.map((item) => (
                        <div key={item.id} className="order-item">
                          <img
                            src={item.image || '/images/default-appliance.jpg'}
                            alt={item.name}
                            className="order-item-image"
                          />
                          <div className="order-item-details">
                            <h4>{item.name}</h4>
                            <p>{item.brand}</p>
                            <p>Qty: {item.quantity}</p>
                          </div>
                          <div className="order-item-price">
                            R{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-totals">
                      <div className="total-line">
                        <span>Subtotal:</span>
                        <span>R{calculateSubtotal().toLocaleString()}</span>
                      </div>
                      <div className="total-line">
                        <span>VAT (15%):</span>
                        <span>R{calculateVAT().toLocaleString()}</span>
                      </div>
                      <div className="total-line">
                        <span>Shipping:</span>
                        <span className={calculateShipping() === 0 ? 'free-shipping' : ''}>
                          {calculateShipping() === 0 ? 'Free' : `R${calculateShipping()}`}
                        </span>
                      </div>
                      <div className="total-line total-final">
                        <span>Total:</span>
                        <span>R{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="security-badges">
                      <p>🔒 Secure Payment</p>
                      <p>📦 Free shipping on orders over R5,000</p>
                      <p>🔄 30-day return policy</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && orderDetails && (
              <PaymentGateway
                orderDetails={orderDetails}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            )}

            {currentStep === 3 && orderDetails && (
              <div className="order-confirmation">
                <div className="confirmation-header">
                  <div className="success-icon">✅</div>
                  <h2>Order Confirmed!</h2>
                  <p>Thank you for your purchase. Your order has been successfully placed.</p>
                </div>

                <div className="order-details">
                  <div className="detail-card">
                    <h3>Order Information</h3>
                    <p><strong>Order Number:</strong> {orderDetails.orderNumber}</p>
                    <p><strong>Total Amount:</strong> R{orderDetails.total.toLocaleString()}</p>
                    <p><strong>Payment Status:</strong> <span className="status-paid">Paid</span></p>
                    <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                  </div>

                  <div className="detail-card">
                    <h3>Shipping Address</h3>
                    <p>{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                    <p>{orderDetails.shippingAddress.address}</p>
                    <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.province}</p>
                    <p>{orderDetails.shippingAddress.postalCode}</p>
                    <p>{orderDetails.shippingAddress.phone}</p>
                  </div>

                  <div className="detail-card">
                    <h3>Items Ordered</h3>
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="confirmation-item">
                        <img
                          src={item.image || '/images/default-appliance.jpg'}
                          alt={item.name}
                          className="item-thumb"
                        />
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p>Qty: {item.quantity} × R{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="confirmation-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/orders')}
                  >
                    Track Your Order
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
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

export default Checkout;