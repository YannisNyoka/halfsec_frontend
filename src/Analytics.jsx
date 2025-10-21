import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Analytics.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      cancelledOrders: 0
    },
    revenueData: [],
    topProducts: [],
    topCategories: [],
    customerAnalytics: {
      newVsReturning: [],
      customerLifetimeValue: 0,
      averageOrdersPerCustomer: 0
    },
    geographicData: [],
    paymentMethods: [],
    performanceMetrics: {
      pageViews: 0,
      uniqueVisitors: 0,
      bounceRate: 0,
      averageSessionDuration: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    const user = JSON.parse(userData);
    console.log('Analytics - checking user:', user);
    
    // Check if user has admin privileges (using server-provided isAdmin flag)
    if (!user.isAdmin) {
      console.log('User is not admin, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    console.log('User is admin, loading analytics');
    loadAnalytics();
  }, [timeRange, navigate]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data - replace with real API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock revenue data for charts
      const generateRevenueData = () => {
        const data = [];
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const baseAmount = 15000;
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const variation = Math.random() * 0.4 - 0.2; // ±20% variation
          const amount = baseAmount * (1 + variation);
          
          data.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.round(amount),
            orders: Math.round(amount / 800), // Average order value ~R800
            visitors: Math.round(amount / 25) // Conversion rate ~4%
          });
        }
        return data;
      };

      const mockAnalytics = {
        overview: {
          totalRevenue: 1567890,
          totalOrders: 2156,
          averageOrderValue: 727,
          conversionRate: 3.8,
          totalCustomers: 1834,
          newCustomers: 456,
          returningCustomers: 1378,
          cancelledOrders: 23
        },
        revenueData: generateRevenueData(),
        topProducts: [
          {
            id: 1,
            name: 'Samsung 8kg Front Load Washing Machine',
            revenue: 125670,
            units: 87,
            category: 'Washing Machines'
          },
          {
            id: 2,
            name: 'LG 516L Side-by-Side Refrigerator',
            revenue: 98420,
            units: 52,
            category: 'Refrigerators'
          },
          {
            id: 3,
            name: 'Bosch 12 Place Dishwasher',
            revenue: 87350,
            units: 64,
            category: 'Dishwashers'
          },
          {
            id: 4,
            name: 'Whirlpool 7kg Top Load Washing Machine',
            revenue: 76890,
            units: 95,
            category: 'Washing Machines'
          },
          {
            id: 5,
            name: 'Defy 13kg Twin Tub Washing Machine',
            revenue: 65420,
            units: 112,
            category: 'Washing Machines'
          }
        ],
        topCategories: [
          { name: 'Washing Machines', revenue: 456780, percentage: 29.1, growth: '+12.5%' },
          { name: 'Refrigerators', revenue: 387650, percentage: 24.7, growth: '+8.3%' },
          { name: 'Dishwashers', revenue: 298470, percentage: 19.0, growth: '+15.7%' },
          { name: 'Dryers', revenue: 187320, percentage: 11.9, growth: '+5.2%' },
          { name: 'Small Appliances', revenue: 237670, percentage: 15.2, growth: '+22.1%' }
        ],
        customerAnalytics: {
          newVsReturning: [
            { label: 'New Customers', value: 456, percentage: 24.9 },
            { label: 'Returning Customers', value: 1378, percentage: 75.1 }
          ],
          customerLifetimeValue: 2340,
          averageOrdersPerCustomer: 1.9
        },
        geographicData: [
          { province: 'Gauteng', orders: 623, revenue: 487650, percentage: 31.1 },
          { province: 'Western Cape', orders: 445, revenue: 356780, percentage: 22.8 },
          { province: 'KwaZulu-Natal', orders: 387, revenue: 298450, percentage: 19.0 },
          { province: 'Eastern Cape', orders: 234, revenue: 187320, percentage: 11.9 },
          { province: 'Free State', orders: 156, revenue: 125670, percentage: 8.0 },
          { province: 'Mpumalanga', users: 89, revenue: 67890, percentage: 4.3 },
          { province: 'Limpopo', orders: 67, revenue: 45670, percentage: 2.9 }
        ],
        paymentMethods: [
          { method: 'Credit Card', transactions: 1287, percentage: 59.7, revenue: 936420 },
          { method: 'EFT', transactions: 534, percentage: 24.8, revenue: 389650 },
          { method: 'PayFast', transactions: 289, percentage: 13.4, revenue: 198740 },
          { method: 'Cash on Delivery', transactions: 46, percentage: 2.1, revenue: 43080 }
        ],
        performanceMetrics: {
          pageViews: 45678,
          uniqueVisitors: 12345,
          bounceRate: 32.4,
          averageSessionDuration: 425 // seconds
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `R${amount.toLocaleString()}`;
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGrowthIcon = (growth) => {
    if (growth.startsWith('+')) {
      return <span className="growth-up">↗ {growth}</span>;
    } else {
      return <span className="growth-down">↘ {growth}</span>;
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loader"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics & Reporting</h1>
        <div className="time-range-selector">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">{formatCurrency(analytics.overview.totalRevenue)}</p>
            <span className="metric-change">+15.2% vs last period</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{analytics.overview.totalOrders.toLocaleString()}</p>
            <span className="metric-change">+8.7% vs last period</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🛒</div>
          <div className="metric-content">
            <h3>Average Order Value</h3>
            <p className="metric-value">{formatCurrency(analytics.overview.averageOrderValue)}</p>
            <span className="metric-change">+3.4% vs last period</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Conversion Rate</h3>
            <p className="metric-value">{analytics.overview.conversionRate}%</p>
            <span className="metric-change">+0.5% vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Revenue Trend</h3>
          <div className="simple-chart">
            <div className="chart-bars">
              {analytics.revenueData.slice(-14).map((data, index) => (
                <div 
                  key={index} 
                  className="chart-bar"
                  style={{ 
                    height: `${(data.revenue / Math.max(...analytics.revenueData.map(d => d.revenue))) * 100}%`,
                    background: `linear-gradient(45deg, #ff6b35 0%, #f7931e 100%)`
                  }}
                  title={`${data.date}: ${formatCurrency(data.revenue)}`}
                />
              ))}
            </div>
            <div className="chart-labels">
              {analytics.revenueData.slice(-14).map((data, index) => (
                <span key={index} className="chart-label">
                  {new Date(data.date).getDate()}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Customer Breakdown</h3>
          <div className="pie-chart">
            <div className="pie-segment new-customers" style={{ 
              '--percentage': analytics.customerAnalytics.newVsReturning[0]?.percentage || 0 
            }}>
              <span className="pie-label">
                New: {analytics.customerAnalytics.newVsReturning[0]?.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="pie-segment returning-customers" style={{ 
              '--percentage': analytics.customerAnalytics.newVsReturning[1]?.percentage || 0 
            }}>
              <span className="pie-label">
                Returning: {analytics.customerAnalytics.newVsReturning[1]?.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="data-tables">
        <div className="table-card">
          <h3>Top Selling Products</h3>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-info">
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.units}</td>
                    <td>{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <h3>Category Performance</h3>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Revenue</th>
                  <th>Share</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topCategories.map((category, index) => (
                  <tr key={index}>
                    <td><strong>{category.name}</strong></td>
                    <td>{formatCurrency(category.revenue)}</td>
                    <td>{category.percentage}%</td>
                    <td>{getGrowthIcon(category.growth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Geographic and Payment Analysis */}
      <div className="analysis-section">
        <div className="analysis-card">
          <h3>Geographic Distribution</h3>
          <div className="geographic-data">
            {analytics.geographicData.map((region, index) => (
              <div key={index} className="region-item">
                <div className="region-header">
                  <span className="region-name">{region.province}</span>
                  <span className="region-percentage">{region.percentage}%</span>
                </div>
                <div className="region-bar">
                  <div 
                    className="region-fill" 
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
                <div className="region-stats">
                  <span>{region.orders} orders</span>
                  <span>{formatCurrency(region.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card">
          <h3>Payment Methods</h3>
          <div className="payment-methods">
            {analytics.paymentMethods.map((method, index) => (
              <div key={index} className="payment-item">
                <div className="payment-header">
                  <span className="payment-name">{method.method}</span>
                  <span className="payment-percentage">{method.percentage}%</span>
                </div>
                <div className="payment-bar">
                  <div 
                    className="payment-fill" 
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
                <div className="payment-stats">
                  <span>{method.transactions} transactions</span>
                  <span>{formatCurrency(method.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-metrics">
        <h3>Website Performance</h3>
        <div className="metrics-grid">
          <div className="performance-card">
            <div className="performance-icon">👁️</div>
            <div className="performance-data">
              <h4>Page Views</h4>
              <p>{analytics.performanceMetrics.pageViews.toLocaleString()}</p>
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-icon">👥</div>
            <div className="performance-data">
              <h4>Unique Visitors</h4>
              <p>{analytics.performanceMetrics.uniqueVisitors.toLocaleString()}</p>
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-icon">⏱️</div>
            <div className="performance-data">
              <h4>Avg. Session Duration</h4>
              <p>{formatDuration(analytics.performanceMetrics.averageSessionDuration)}</p>
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-icon">📊</div>
            <div className="performance-data">
              <h4>Bounce Rate</h4>
              <p>{analytics.performanceMetrics.bounceRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;