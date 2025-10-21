import React, { useState, useEffect } from 'react';
import './OrderTracking.css';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Mock data for now - replace with API call later
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          items: [
            { 
              name: 'Samsung 8kg Front Load Washing Machine', 
              price: 8999, 
              quantity: 1,
              image: '/images/washing-machine.jpg'
            }
          ],
          subtotal: 8999,
          vat: 1349.85,
          shipping: 299,
          total: 10647.85,
          status: 'processing',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          createdAt: new Date('2024-01-15'),
          estimatedDelivery: new Date('2024-01-22'),
          shippingAddress: {
            name: 'John Doe',
            street: '123 Main Street',
            suburb: 'Gardens',
            city: 'Cape Town',
            province: 'Western Cape',
            postalCode: '8001',
            phone: '+27 21 123 4567'
          },
          trackingNumber: 'TRK789123456',
          statusHistory: [
            { status: 'placed', date: new Date('2024-01-15T10:00:00'), note: 'Order placed successfully' },
            { status: 'paid', date: new Date('2024-01-15T10:05:00'), note: 'Payment confirmed' },
            { status: 'processing', date: new Date('2024-01-16T09:00:00'), note: 'Order is being prepared' }
          ]
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          items: [
            { 
              name: 'LG 516L Side-by-Side Refrigerator', 
              price: 15999, 
              quantity: 1,
              image: '/images/refrigerator.jpg'
            },
            { 
              name: 'Samsung Microwave Oven', 
              price: 2499, 
              quantity: 1,
              image: '/images/microwave.jpg'
            }
          ],
          subtotal: 18498,
          vat: 2774.70,
          shipping: 0, // Free shipping for orders over R15000
          total: 21272.70,
          status: 'shipped',
          paymentStatus: 'paid',
          paymentMethod: 'eft',
          createdAt: new Date('2024-01-14'),
          estimatedDelivery: new Date('2024-01-21'),
          shippingAddress: {
            name: 'Jane Smith',
            street: '456 Oak Avenue',
            suburb: 'Sandton',
            city: 'Johannesburg',
            province: 'Gauteng',
            postalCode: '2196',
            phone: '+27 11 987 6543'
          },
          trackingNumber: 'TRK456789123',
          statusHistory: [
            { status: 'placed', date: new Date('2024-01-14T14:30:00'), note: 'Order placed successfully' },
            { status: 'paid', date: new Date('2024-01-14T14:35:00'), note: 'EFT payment confirmed' },
            { status: 'processing', date: new Date('2024-01-15T08:00:00'), note: 'Order is being prepared' },
            { status: 'shipped', date: new Date('2024-01-17T10:00:00'), note: 'Package dispatched to courier' }
          ]
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          customerName: 'Mike Johnson',
          customerEmail: 'mike@example.com',
          items: [
            { 
              name: 'Bosch 12 Place Dishwasher', 
              price: 12999, 
              quantity: 1,
              image: '/images/dishwasher.jpg'
            }
          ],
          subtotal: 12999,
          vat: 1949.85,
          shipping: 299,
          total: 15247.85,
          status: 'delivered',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          createdAt: new Date('2024-01-10'),
          estimatedDelivery: new Date('2024-01-17'),
          actualDelivery: new Date('2024-01-16'),
          shippingAddress: {
            name: 'Mike Johnson',
            street: '789 Pine Road',
            suburb: 'Bellville',
            city: 'Cape Town',
            province: 'Western Cape',
            postalCode: '7530',
            phone: '+27 21 555 7890'
          },
          trackingNumber: 'TRK123456789',
          statusHistory: [
            { status: 'placed', date: new Date('2024-01-10T11:15:00'), note: 'Order placed successfully' },
            { status: 'paid', date: new Date('2024-01-10T11:20:00'), note: 'Payment confirmed' },
            { status: 'processing', date: new Date('2024-01-11T09:00:00'), note: 'Order is being prepared' },
            { status: 'shipped', date: new Date('2024-01-12T13:00:00'), note: 'Package dispatched to courier' },
            { status: 'out_for_delivery', date: new Date('2024-01-16T08:00:00'), note: 'Out for delivery' },
            { status: 'delivered', date: new Date('2024-01-16T15:30:00'), note: 'Package delivered successfully' }
          ]
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'placed': '#3498db',
      'paid': '#2ecc71',
      'processing': '#f39c12',
      'shipped': '#9b59b6',
      'out_for_delivery': '#e67e22',
      'delivered': '#27ae60',
      'cancelled': '#e74c3c',
      'refunded': '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'placed': 'Order Placed',
      'paid': 'Payment Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="order-tracking-loading">
        <div className="loader"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      <div className="order-header">
        <h1>Order Tracking & Management</h1>
        <p>Track and manage all customer orders</p>
      </div>

      <div className="order-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by order number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Statuses</option>
          <option value="placed">Order Placed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="orders-grid">
        {filteredOrders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div className="order-info">
                <h3>{order.orderNumber}</h3>
                <p className="customer-name">{order.customerName}</p>
                <p className="order-date">{order.createdAt.toLocaleDateString()}</p>
              </div>
              <div className="order-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img 
                    src={item.image || '/images/default-appliance.jpg'} 
                    alt={item.name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity} × R{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>R{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>VAT (15%):</span>
                <span>R{order.vat.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{order.shipping === 0 ? 'FREE' : `R${order.shipping.toLocaleString()}`}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>R{order.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="order-tracking-info">
              {order.trackingNumber && (
                <div className="tracking-number">
                  <strong>Tracking: </strong>{order.trackingNumber}
                </div>
              )}
              <div className="delivery-date">
                <strong>
                  {order.status === 'delivered' ? 'Delivered: ' : 'Estimated Delivery: '}
                </strong>
                {order.status === 'delivered' 
                  ? order.actualDelivery?.toLocaleDateString()
                  : order.estimatedDelivery?.toLocaleDateString()
                }
              </div>
            </div>

            <div className="shipping-address">
              <h4>Shipping Address:</h4>
              <p>
                {order.shippingAddress.name}<br/>
                {order.shippingAddress.street}<br/>
                {order.shippingAddress.suburb}, {order.shippingAddress.city}<br/>
                {order.shippingAddress.province} {order.shippingAddress.postalCode}<br/>
                {order.shippingAddress.phone}
              </p>
            </div>

            <div className="order-timeline">
              <h4>Order Timeline:</h4>
              <div className="timeline">
                {order.statusHistory.map((event, index) => (
                  <div key={index} className="timeline-event">
                    <div 
                      className="timeline-dot"
                      style={{ backgroundColor: getStatusColor(event.status) }}
                    ></div>
                    <div className="timeline-content">
                      <strong>{getStatusLabel(event.status)}</strong>
                      <p>{event.note}</p>
                      <small>{event.date.toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-actions">
              <button className="btn-secondary">View Details</button>
              <button className="btn-primary">Update Status</button>
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button className="btn-danger">Cancel Order</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-orders">
          <h3>No orders found</h3>
          <p>No orders match your current search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;