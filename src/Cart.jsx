import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
    setLoading(false);
  }, []);

  const loadCartItems = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  };

  const updateCartItem = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeCartItem(productId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeCartItem = (productId) => {
    const updatedCart = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', '[]');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.15; // 15% VAT in South Africa
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 5000 ? 0 : 299; // Free shipping over R5000
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      // Removed annoying popup - user can see cart is empty
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      // Removed annoying popup - just redirect to login
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loader"></div>
        <p>Loading cart...</p>
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
          <div className="nav-cart active">
            <span className="cart-icon">&#128722;</span>
            <span className="cart-badge">{cartItems.length}</span>
            <span className="cart-label">Cart</span>
          </div>
          <div className="nav-profile">
            <span className="profile-icon">&#128100;</span>
            <span className="profile-label">Profile</span>
          </div>
        </div>
      </nav>

      {/* Cart Content */}
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-breadcrumb">
            <Link to="/dashboard">Home</Link> &gt; 
            <span>Shopping Cart</span>
          </div>

          <h1 className="cart-title">Your Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Browse our amazing collection of appliances and add items to your cart.</p>
              <Link to="/dashboard" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-content">
              {/* Cart Items */}
              <div className="cart-items">
                <div className="cart-header">
                  <div className="item-col">Product</div>
                  <div className="price-col">Price</div>
                  <div className="quantity-col">Quantity</div>
                  <div className="total-col">Total</div>
                  <div className="action-col">Action</div>
                </div>

                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="item-info">
                      <Link to={`/product/${item._id}`} className="item-image-link">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = '/images/default-appliance.jpg';
                          }}
                        />
                      </Link>
                      <div className="item-details">
                        <Link to={`/product/${item._id}`} className="item-name">
                          {item.name}
                        </Link>
                        <div className="item-brand">{item.brand}</div>
                        <div className="item-availability">✓ In Stock</div>
                      </div>
                    </div>

                    <div className="item-price">
                      R{item.price.toLocaleString('en-ZA', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </div>

                    <div className="item-quantity">
                      <button 
                        className="quantity-btn"
                        onClick={() => updateCartItem(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => updateCartItem(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      R{(item.price * item.quantity).toLocaleString('en-ZA', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </div>

                    <div className="item-actions">
                      <button 
                        className="remove-btn"
                        onClick={() => removeCartItem(item._id)}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}

                <div className="cart-actions">
                  <Link to="/dashboard" className="continue-shopping">
                    ← Continue Shopping
                  </Link>
                  <button onClick={clearCart} className="clear-cart-btn">
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <h2>Order Summary</h2>
                
                <div className="summary-line">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span>R{calculateSubtotal().toLocaleString('en-ZA', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}</span>
                </div>

                <div className="summary-line">
                  <span>VAT (15%):</span>
                  <span>R{calculateTax().toLocaleString('en-ZA', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}</span>
                </div>

                <div className="summary-line">
                  <span>Shipping:</span>
                  <span>
                    {calculateShipping() === 0 ? (
                      <span className="free-shipping">FREE</span>
                    ) : (
                      `R${calculateShipping().toLocaleString('en-ZA', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}`
                    )}
                  </span>
                </div>

                {calculateShipping() > 0 && (
                  <div className="shipping-notice">
                    Free shipping on orders over R5,000
                  </div>
                )}

                <div className="summary-total">
                  <span>Total:</span>
                  <span>R{calculateTotal().toLocaleString('en-ZA', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}</span>
                </div>

                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>

                <div className="payment-options">
                  <p>We accept:</p>
                  <div className="payment-icons">
                    <span className="payment-icon">💳</span>
                    <span className="payment-icon">🏦</span>
                    <span className="payment-icon">📱</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
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

export default Cart;