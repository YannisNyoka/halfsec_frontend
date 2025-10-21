import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ProductPage.css';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    updateCartCount();
  }, [id]);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  };

  const checkWishlistStatus = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isProductInWishlist = wishlist.some(item => item.id === id);
    setIsInWishlist(isProductInWishlist);
  };

  const toggleWishlist = () => {
    if (!product) return;

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(false);
      // Removed annoying popup - wishlist button state shows success
    } else {
      // Add to wishlist
      const wishlistItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand
      };
      wishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
      // Removed annoying popup - wishlist button state shows success
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appliances/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.appliance);
        // Load wishlist status after product loads
        setTimeout(() => checkWishlistStatus(), 100);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews?productId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const addToCart = () => {
    if (!product) return;
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex(item => item._id === product._id);
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      existingCart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        quantity: quantity
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Update cart count in navbar
    updateCartCount();
    
    // Removed annoying popup - cart count update shows success
  };

  const addToWishlist = () => {
    if (!product) return;
    
    const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isAlreadyInWishlist = existingWishlist.some(item => item._id === product._id);
    
    if (!isAlreadyInWishlist) {
      existingWishlist.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand
      });
      localStorage.setItem('wishlist', JSON.stringify(existingWishlist));
      // Removed annoying popup - user can navigate to wishlist to confirm
    } else {
      // Removed annoying popup - user can check their wishlist
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      // Removed annoying popup - redirect to login instead
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (response.ok) {
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
        // Removed annoying popup - new review will appear in list
      } else {
        // Removed annoying popup - show error message in form instead
      }
    } catch (err) {
      // Removed annoying popup - show error message in form instead
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="product-loading">
        <div className="loader"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-error">
        <h2>Product Not Found</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="back-btn">Back to Catalog</Link>
      </div>
    );
  }

  // For demo, create multiple images (in real app, product would have image array)
  const productImages = [
    product.image,
    product.image, // Duplicate for demo
    product.image
  ];

  return (
    <>
      {/* Navigation Bar - Same as Dashboard */}
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
          <Link to="/profile" className="nav-profile">
            <span className="profile-icon">&#128100;</span>
            <span className="profile-label">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Product Details */}
      <div className="product-page">
        <div className="product-container">
          <div className="product-breadcrumb">
            <Link to="/dashboard">Home</Link> &gt; 
            <Link to="/dashboard">{product.category}</Link> &gt; 
            <span>{product.name}</span>
          </div>

          <div className="product-content">
            {/* Product Images */}
            <div className="product-images">
              <div className="main-image">
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/images/default-appliance.jpg';
                  }}
                />
              </div>
              <div className="image-thumbnails">
                {productImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.target.src = '/images/default-appliance.jpg';
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-brand">{product.brand}</div>
              <h1 className="product-title">{product.name}</h1>
              <div className="product-model">Model: {product.model}</div>
              
              <div className="product-rating">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      className={star <= calculateAverageRating() ? 'star filled' : 'star'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">
                  {calculateAverageRating()} ({reviews.length} reviews)
                </span>
              </div>

              <div className="product-price">
                R {product.price ? product.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) : 'N/A'}
              </div>

              <div className="product-description">
                <p>{product.description}</p>
              </div>

              <div className="product-features">
                <h3>Key Features</h3>
                <ul>
                  {product.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="product-stock">
                {product.inStock ? (
                  <span className="in-stock">✓ In Stock</span>
                ) : (
                  <span className="out-of-stock">✗ Out of Stock</span>
                )}
              </div>

              <div className="product-actions">
                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <select 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="action-buttons">
                  <button 
                    className="add-to-cart-btn"
                    onClick={addToCart}
                    disabled={!product.inStock}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                    onClick={toggleWishlist}
                  >
                    {isInWishlist ? '❤️ In Wishlist' : '♡ Add to Wishlist'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <div className="reviews-header">
              <h2>Customer Reviews</h2>
              <button 
                className="write-review-btn"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                Write a Review
              </button>
            </div>

            {showReviewForm && (
              <form className="review-form" onSubmit={submitReview}>
                <div className="rating-input">
                  <label>Rating:</label>
                  <select 
                    value={newReview.rating}
                    onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                <div className="comment-input">
                  <label>Comment:</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Share your experience with this product..."
                    rows="4"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-review-btn">Submit Review</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-name">{review.userName || 'Anonymous'}</div>
                      <div className="review-rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={star <= review.rating ? 'star filled' : 'star'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="review-comment">{review.comment}</div>
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Same as Dashboard */}
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

export default ProductPage;