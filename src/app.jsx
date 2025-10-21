import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import SignupPage from './SignupPage'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'
import ProductPage from './ProductPage'
import Cart from './Cart'
import Checkout from './Checkout'
import UserProfile from './UserProfile'
import AdminDashboard from './AdminDashboard'
import OrderTracking from './OrderTracking'
import Analytics from './Analytics'
import CustomerSupport from './CustomerSupport'
import ProductManagement from './ProductManagement'
import './app.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/support" element={<CustomerSupport />} />
          <Route path="/product-management" element={<ProductManagement />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
