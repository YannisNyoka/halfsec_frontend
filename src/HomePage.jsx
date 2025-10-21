import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
import './HomePage.css';

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
    updateCartCount();
    checkUserStatus();
  }, []);

  const checkUserStatus = () => {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if admin wants to view the site (bypass admin redirect)
        const viewAsSite = sessionStorage.getItem('viewAsSite');
        
        // If user is admin and lands on homepage, redirect to admin dashboard
        // UNLESS they specifically want to view the site
        if (parsedUser.isAdmin && !viewAsSite) {
          console.log('Admin user detected on homepage, redirecting to admin dashboard');
          navigate('/admin');
        } else if (viewAsSite) {
          // Clear the flag after using it
          sessionStorage.removeItem('viewAsSite');
          console.log('Admin viewing site as regular user');
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        // Clear invalid data
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
      }
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appliances`);
      if (response.ok) {
        const data = await response.json();
        // Get first 6 products as featured
        setFeaturedProducts(data.appliances?.slice(0, 6) || []);
      }
    } catch (err) {
      console.error('Error fetching featured products:', err);
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product._id || item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    // Removed annoying popup - cart count update shows success
  };

  const addToWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const existingItem = wishlist.find(item => item.id === product._id || item.id === product.id);
    
    if (existingItem) {
      // Removed annoying popup - user can see item is already in wishlist
      return;
    }
    
    wishlist.push({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand
    });
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    // Removed annoying popup - user can navigate to wishlist to see item added
  };
  return (
    <>
      {/* Navigation Bar */}
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
            <Link to="/support" className="nav-item">Support</Link>
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
          {user ? (
            user.isAdmin ? (
              <Link to="/admin" className="nav-profile">
                <span className="profile-icon">⚙️</span>
                <span className="profile-label">Admin Panel</span>
              </Link>
            ) : (
              <Link to="/profile" className="nav-profile">
                <span className="profile-icon">&#128100;</span>
                <span className="profile-label">My Profile</span>
              </Link>
            )
          ) : (
            <Link to="/login" className="nav-profile">
              <span className="profile-icon">&#128100;</span>
              <span className="profile-label">Login</span>
            </Link>
          )}
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
          🔧 Admin Mode: Viewing site as customer | <Link to="/admin" style={{color: '#fff', textDecoration: 'underline'}}>Return to Admin Panel</Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-title">HalfSec: Fast. Flexible. Yours.</div>
          <div className="hero-desc">Experience ultimate speed and flexibility with HalfSec. Simple monthly plans, instant upgrades, and total control—tailored for you.</div>
          <div className="hero-buttons">
            {user ? (
              user.isAdmin ? (
                <Link to="/admin" className="cta-btn">Admin Dashboard</Link>
              ) : (
                <Link to="/dashboard" className="cta-btn">Shop Now</Link>
              )
            ) : (
              <>
                <Link to="/signup" className="cta-btn">Sign Up</Link>
                <Link to="/login" className="cta-btn-secondary">Login</Link>
              </>
            )}
          </div>
          <div className="hero-features">
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <div>Lightning Fast Orders</div>
            </div>
            <div className="feature">
              <div className="feature-icon">🔄</div>
              <div>Flexible Payment Plans</div>
            </div>
            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <div>Secure & Reliable</div>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/images guy fixing.jpeg" alt="HalfSec Hero" className="brand-logo" />
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured-products" className="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Discover our most popular appliances with the best deals</p>
          
          <div className="featured-grid">
            {featuredProducts.map((product) => (
              <div key={product._id} className="featured-card">
                <Link to={`/product/${product._id}`} className="featured-link">
                  <div className="featured-image">
                    <img 
                      src={product.image || '/images/default-appliance.jpg'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/images/default-appliance.jpg';
                      }}
                    />
                    {product.discount && (
                      <div className="discount-badge">-{product.discount}%</div>
                    )}
                  </div>
                  <div className="featured-info">
                    <div className="featured-brand">{product.brand}</div>
                    <h3 className="featured-name">{product.name}</h3>
                    <div className="featured-price">
                      R{product.price?.toLocaleString()}
                    </div>
                    <div className="featured-monthly">
                      From R{Math.round(product.price / 24)}/month
                    </div>
                  </div>
                </Link>
                <div className="featured-actions">
                  <button 
                    className="featured-cart-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="featured-wishlist-btn" 
                    title="Add to Wishlist"
                    onClick={(e) => {
                      e.preventDefault();
                      addToWishlist(product);
                    }}
                  >
                    ♡
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="featured-cta">
            <Link to="/dashboard" className="view-all-btn">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" style={{maxWidth:'1200px',margin:'0 auto 3rem auto'}}>
        <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:'bold',margin:'2.5rem 0 2rem 0',color:'#fff'}}>Shop by Category</h2>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'2rem'}}>
          <div className="cat-card" style={{background:'#ff8800',color:'#111',width:'180px',borderRadius:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',padding:'2rem 1rem 1.5rem 1rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>
              <img src="/images/images (4).jpeg" className="cat-card brand-logo" style={{borderRadius:'2rem'}} alt="TV"/>
            </div>
            <div style={{fontSize:'1.1rem',fontWeight:600,marginBottom:'0.5rem'}}>TVs</div>
            <div style={{fontSize:'1rem'}}>From <span style={{fontWeight:'bold'}}>R299</span>/mo</div>
          </div>
          <div className="cat-card" style={{background:'#222',color:'#fff',width:'180px',borderRadius:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',padding:'2rem 1rem 1.5rem 1rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>
              <img src="/images/download(Fridge2).jpeg" className="cat-card brand-logo" style={{borderRadius:'2rem'}} alt="Fridge"/>
            </div>
            <div style={{fontSize:'1.1rem',fontWeight:600,marginBottom:'0.5rem'}}>Fridges</div>
            <div style={{fontSize:'1rem'}}>From <span style={{fontWeight:'bold'}}>R399</span>/mo</div>
          </div>
          <div className="cat-card" style={{background:'#ff8800',color:'#111',width:'180px',borderRadius:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',padding:'2rem 1rem 1.5rem 1rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>
              <img src="/images/Washing Machine.webp" className="cat-card brand-logo" style={{borderRadius:'2rem'}} alt="Washing Machine"/>
            </div>
            <div style={{fontSize:'1.1rem',fontWeight:600,marginBottom:'0.5rem'}}>Washing Machines</div>
            <div style={{fontSize:'1rem'}}>From <span style={{fontWeight:'bold'}}>R349</span>/mo</div>
          </div>
          <div className="cat-card" style={{background:'#222',color:'#fff',width:'180px',borderRadius:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',padding:'2rem 1rem 1.5rem 1rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>
              <img src="/images/kitchenA.webp" className="cat-card brand-logo" style={{borderRadius:'2rem'}} alt="Kitchen"/>
            </div>
            <div style={{fontSize:'1.1rem',fontWeight:600,marginBottom:'0.5rem'}}>Kitchen</div>
            <div style={{fontSize:'1rem'}}>From <span style={{fontWeight:'bold'}}>R199</span>/mo</div>
          </div>
          <div className="cat-card" style={{background:'#ff8800',color:'#111',width:'180px',borderRadius:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',padding:'2rem 1rem 1.5rem 1rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>
              <img src="/images/Sm4.webp" className="cat-card brand-logo" style={{borderRadius:'2rem'}} alt="Small Appliances"/>
            </div>
            <div style={{fontSize:'1.1rem',fontWeight:600,marginBottom:'0.5rem'}}>Small Appliances</div>
            <div style={{fontSize:'1rem'}}>From <span style={{fontWeight:'bold'}}>R149</span>/mo</div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="how-title">How it Works</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-icon">🛒</div>
            <div className="how-step-title">1. SHOP OUR RANGE</div>
            <div className="how-step-desc">Choose from our fantastic range of appliances and more. Add items to your cart and check out.</div>
          </div>
          <div className="how-step">
            <div className="how-icon">📝</div>
            <div className="how-step-title">2. APPLY & GET APPROVED</div>
            <div className="how-step-desc">We keep your best interests at heart every step of the way. Quick and easy approval process.</div>
          </div>
          <div className="how-step">
            <div className="how-icon">🚚</div>
            <div className="how-step-title">3. DELIVERED & DONE</div>
            <div className="how-step-desc">Wait with excitement for us to deliver to your door!</div>
          </div>
        </div>
        <div className="how-buttons">
          <button className="how-btn how-btn-main">Watch How to HalfSec</button>
          <button className="how-btn how-btn-secondary">More Info</button>
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands" className="brands-section">
        <h2 className="brands-title">Shop By Brand</h2>
        <h3 className="HalfSecBrand brands-title">HalfSec</h3>
        <div className="brands-logos">
          <div className="brand-logo" style={{color:'#2196f3',fontWeight:'bold'}}>beko</div>
          <div className="brand-logo" style={{color:'#b71c1c',fontWeight:'bold'}}>Bennett Read</div>
          <div className="brand-logo" style={{color:'#fbc02d',fontWeight:'bold'}}>EZVIZ</div>
          <div className="brand-logo" style={{background:'#e3f2fd',color:'#0288d1',fontWeight:'bold'}}>Midea</div>
          <div className="brand-logo" style={{color:'#3949ab',fontWeight:'bold'}}>SAMSUNG</div>
          <div className="brand-logo" style={{color:'#26a69a',fontWeight:'bold'}}>Hisense</div>
          <div className="brand-logo" style={{color:'#222',fontWeight:'bold'}}>SKYWORTH</div>
          <div className="brand-logo" style={{color:'#757575',fontWeight:'bold'}}>BOSCH</div>
          <div className="brand-logo" style={{color:'#222',fontWeight:'bold'}}>dyson</div>
          <div className="brand-logo" style={{color:'#222',fontWeight:'bold'}}>smeg</div>
          <div className="brand-logo" style={{color:'#e53935',fontWeight:'bold'}}>DEFY</div>
          <div className="brand-logo" style={{color:'#1976d2',fontWeight:'bold'}}>KIC</div>
          <div className="brand-logo" style={{color:'#d32f2f',fontWeight:'bold'}}>LG</div>
          <div className="brand-logo" style={{color:'#ff3d00',fontWeight:'bold'}}>TCL</div>
          <div className="brand-logo" style={{color:'#222',fontWeight:'bold'}}>SONY</div>
          <div className="brand-logo" style={{color:'#1976d2',fontWeight:'bold'}}>PHILIPS</div>
          <div className="brand-logo" style={{background:'#ff6f00',color:'#fff',fontWeight:'bold'}}>JBL</div>
          <div className="brand-logo" style={{color:'#43a047',fontWeight:'bold'}}>XBOX</div>
        </div>
      </section>

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

export default HomePage;