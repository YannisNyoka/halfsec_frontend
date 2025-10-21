import React, { useState, useEffect } from 'react';
import './PaymentGateway.css';

const PaymentGateway = ({ orderDetails, onSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolder: ''
  });
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    branchCode: ''
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // South African banks for EFT
  const southAfricanBanks = [
    { name: 'ABSA Bank', code: '632005' },
    { name: 'Standard Bank', code: '051001' },
    { name: 'First National Bank (FNB)', code: '250655' },
    { name: 'Nedbank', code: '198765' },
    { name: 'Capitec Bank', code: '470010' },
    { name: 'Discovery Bank', code: '679000' },
    { name: 'African Bank', code: '430000' },
    { name: 'Bidvest Bank', code: '462005' },
    { name: 'Investec Bank', code: '580105' },
    { name: 'TymeBank', code: '678910' }
  ];

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    } else if (name === 'expiryMonth' || name === 'expiryYear') {
      formattedValue = value.replace(/[^0-9]/g, '');
    }

    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateCardDetails = () => {
    const newErrors = {};

    if (!cardDetails.cardHolder.trim()) {
      newErrors.cardHolder = 'Cardholder name is required';
    }

    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!cardDetails.expiryMonth || cardDetails.expiryMonth.length !== 2) {
      newErrors.expiryMonth = 'Invalid month';
    } else {
      const month = parseInt(cardDetails.expiryMonth);
      if (month < 1 || month > 12) {
        newErrors.expiryMonth = 'Invalid month';
      }
    }

    if (!cardDetails.expiryYear || cardDetails.expiryYear.length !== 2) {
      newErrors.expiryYear = 'Invalid year';
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const year = parseInt(cardDetails.expiryYear);
      if (year < currentYear) {
        newErrors.expiryYear = 'Card has expired';
      }
    }

    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    return newErrors;
  };

  const validateBankDetails = () => {
    const newErrors = {};

    if (!bankDetails.accountHolder.trim()) {
      newErrors.accountHolder = 'Account holder name is required';
    }

    if (!bankDetails.bankName) {
      newErrors.bankName = 'Please select a bank';
    }

    if (!bankDetails.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (!bankDetails.branchCode.trim()) {
      newErrors.branchCode = 'Branch code is required';
    }

    return newErrors;
  };

  const handlePayment = async () => {
    setProcessing(true);
    setErrors({});

    try {
      let validationErrors = {};

      if (paymentMethod === 'card') {
        validationErrors = validateCardDetails();
      } else if (paymentMethod === 'eft') {
        validationErrors = validateBankDetails();
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setProcessing(false);
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock payment success
      const paymentResult = {
        success: true,
        transactionId: `TXN-${Date.now()}`,
        paymentMethod,
        amount: orderDetails.total,
        currency: 'ZAR',
        timestamp: new Date().toISOString()
      };

      onSuccess(paymentResult);

    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ submit: 'Payment failed. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const getCardType = (number) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      diners: /^3[0689]/,
      discover: /^6(?:011|5)/
    };

    const cleanNumber = number.replace(/\s/g, '');
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanNumber)) {
        return type;
      }
    }
    return null;
  };

  return (
    <div className="payment-gateway">
      <div className="payment-header">
        <h2>Complete Your Payment</h2>
        <div className="payment-amount">
          <span>Total: </span>
          <span className="amount">R{orderDetails.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="payment-methods">
        <div className="method-tabs">
          <button
            className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            <i className="icon-card"></i>
            Credit/Debit Card
          </button>
          <button
            className={`method-tab ${paymentMethod === 'eft' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('eft')}
          >
            <i className="icon-bank"></i>
            Bank Transfer (EFT)
          </button>
          <button
            className={`method-tab ${paymentMethod === 'payfast' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('payfast')}
          >
            <i className="icon-payfast"></i>
            PayFast
          </button>
        </div>

        <div className="payment-forms">
          {paymentMethod === 'card' && (
            <div className="card-form">
              <div className="form-group">
                <label htmlFor="cardHolder">Cardholder Name</label>
                <input
                  type="text"
                  id="cardHolder"
                  name="cardHolder"
                  value={cardDetails.cardHolder}
                  onChange={handleCardInputChange}
                  className={errors.cardHolder ? 'error' : ''}
                  placeholder="John Doe"
                />
                {errors.cardHolder && <span className="error-text">{errors.cardHolder}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <div className="card-input-wrapper">
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInputChange}
                    className={errors.cardNumber ? 'error' : ''}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                  {getCardType(cardDetails.cardNumber) && (
                    <div className={`card-type ${getCardType(cardDetails.cardNumber)}`}></div>
                  )}
                </div>
                {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryMonth">Expiry Month</label>
                  <input
                    type="text"
                    id="expiryMonth"
                    name="expiryMonth"
                    value={cardDetails.expiryMonth}
                    onChange={handleCardInputChange}
                    className={errors.expiryMonth ? 'error' : ''}
                    placeholder="MM"
                    maxLength="2"
                  />
                  {errors.expiryMonth && <span className="error-text">{errors.expiryMonth}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="expiryYear">Expiry Year</label>
                  <input
                    type="text"
                    id="expiryYear"
                    name="expiryYear"
                    value={cardDetails.expiryYear}
                    onChange={handleCardInputChange}
                    className={errors.expiryYear ? 'error' : ''}
                    placeholder="YY"
                    maxLength="2"
                  />
                  {errors.expiryYear && <span className="error-text">{errors.expiryYear}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardInputChange}
                    className={errors.cvv ? 'error' : ''}
                    placeholder="123"
                    maxLength="4"
                  />
                  {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'eft' && (
            <div className="eft-form">
              <div className="form-group">
                <label htmlFor="accountHolder">Account Holder Name</label>
                <input
                  type="text"
                  id="accountHolder"
                  name="accountHolder"
                  value={bankDetails.accountHolder}
                  onChange={handleBankInputChange}
                  className={errors.accountHolder ? 'error' : ''}
                  placeholder="John Doe"
                />
                {errors.accountHolder && <span className="error-text">{errors.accountHolder}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="bankName">Bank</label>
                <select
                  id="bankName"
                  name="bankName"
                  value={bankDetails.bankName}
                  onChange={handleBankInputChange}
                  className={errors.bankName ? 'error' : ''}
                >
                  <option value="">Select Bank</option>
                  {southAfricanBanks.map(bank => (
                    <option key={bank.code} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {errors.bankName && <span className="error-text">{errors.bankName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="accountNumber">Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={bankDetails.accountNumber}
                    onChange={handleBankInputChange}
                    className={errors.accountNumber ? 'error' : ''}
                    placeholder="1234567890"
                  />
                  {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="branchCode">Branch Code</label>
                  <input
                    type="text"
                    id="branchCode"
                    name="branchCode"
                    value={bankDetails.branchCode}
                    onChange={handleBankInputChange}
                    className={errors.branchCode ? 'error' : ''}
                    placeholder="Branch code"
                  />
                  {errors.branchCode && <span className="error-text">{errors.branchCode}</span>}
                </div>
              </div>

              <div className="eft-notice">
                <p><strong>Note:</strong> EFT transfers may take 1-3 business days to process. Your order will be shipped once payment is confirmed.</p>
              </div>
            </div>
          )}

          {paymentMethod === 'payfast' && (
            <div className="payfast-form">
              <div className="payfast-info">
                <h3>PayFast Secure Payment</h3>
                <p>You will be redirected to PayFast to complete your payment securely. PayFast supports:</p>
                <ul>
                  <li>Credit & Debit Cards</li>
                  <li>Instant EFT from major SA banks</li>
                  <li>Bitcoin payments</li>
                  <li>Zapper & SnapScan</li>
                  <li>Capitec Pay</li>
                </ul>
              </div>
              
              <div className="payfast-logo">
                <div className="logo-placeholder">PayFast</div>
                <p>Secure payment processing for South Africa</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="error-message">
          {errors.submit}
        </div>
      )}

      <div className="payment-actions">
        <button 
          className="btn-secondary" 
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </button>
        <button 
          className="btn-primary" 
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay R${orderDetails.total.toLocaleString()}`}
        </button>
      </div>

      <div className="security-badges">
        <div className="badge">
          <span>🔒</span>
          <small>SSL Encrypted</small>
        </div>
        <div className="badge">
          <span>🛡️</span>
          <small>PCI Compliant</small>
        </div>
        <div className="badge">
          <span>✅</span>
          <small>Secure Processing</small>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;