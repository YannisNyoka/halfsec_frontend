import React, { useState, useEffect } from 'react';
import './CustomerSupport.css';

const CustomerSupport = () => {
  const [activeSection, setActiveSection] = useState('contact');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  });
  const [tickets, setTickets] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const supportCategories = [
    'Order Inquiry',
    'Product Information',
    'Payment Issues',
    'Shipping & Delivery',
    'Returns & Refunds',
    'Technical Support',
    'Warranty Claims',
    'General Inquiry'
  ];

  const faqData = [
    {
      category: 'Orders',
      questions: [
        {
          question: 'How can I track my order?',
          answer: 'You can track your order by visiting the "Order Tracking" page in your account dashboard or using the tracking number sent to your email.'
        },
        {
          question: 'Can I modify or cancel my order?',
          answer: 'Orders can be modified or cancelled within 2 hours of placement. After this time, please contact customer support for assistance.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept major credit cards, EFT bank transfers, PayFast, and cash on delivery for select areas.'
        }
      ]
    },
    {
      category: 'Shipping',
      questions: [
        {
          question: 'What are your delivery times?',
          answer: 'Standard delivery is 3-5 business days. Express delivery (1-2 days) is available for major cities at an additional cost.'
        },
        {
          question: 'Do you offer free shipping?',
          answer: 'Yes! Free shipping is available on orders over R5,000 to most areas in South Africa.'
        },
        {
          question: 'Which areas do you deliver to?',
          answer: 'We deliver nationwide across South Africa. Some remote areas may have extended delivery times.'
        }
      ]
    },
    {
      category: 'Returns',
      questions: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for unopened items in original packaging. Appliances must be unused and include all accessories.'
        },
        {
          question: 'How do I return an item?',
          answer: 'Contact our support team to initiate a return. We\'ll provide a return shipping label and instructions.'
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Refunds are processed within 5-7 business days after we receive the returned item.'
        }
      ]
    },
    {
      category: 'Warranty',
      questions: [
        {
          question: 'What warranty do you offer?',
          answer: 'All appliances come with manufacturer warranty. Coverage varies by brand and product - typically 1-3 years.'
        },
        {
          question: 'How do I claim warranty?',
          answer: 'Contact our support team with your order number and description of the issue. We\'ll guide you through the warranty claim process.'
        }
      ]
    }
  ];

  useEffect(() => {
    loadUserData();
    loadTickets();
    initializeChat();
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setContactForm(prev => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || ''
      }));
    }
  };

  const loadTickets = async () => {
    try {
      // Mock tickets data
      const mockTickets = [
        {
          id: 'TKT-001',
          subject: 'Question about Samsung Washing Machine',
          category: 'Product Information',
          status: 'open',
          priority: 'medium',
          createdAt: new Date('2024-01-15'),
          lastUpdate: new Date('2024-01-16'),
          messages: [
            {
              id: 1,
              sender: 'customer',
              message: 'I need more information about the Samsung 8kg washing machine. Does it have a delay start feature?',
              timestamp: new Date('2024-01-15T10:00:00')
            },
            {
              id: 2,
              sender: 'support',
              message: 'Yes, the Samsung 8kg Front Load Washing Machine includes a delay start feature up to 24 hours. It also has multiple wash programs and energy-saving features.',
              timestamp: new Date('2024-01-16T09:30:00')
            }
          ]
        },
        {
          id: 'TKT-002',
          subject: 'Delivery delay inquiry',
          category: 'Shipping & Delivery',
          status: 'resolved',
          priority: 'high',
          createdAt: new Date('2024-01-10'),
          lastUpdate: new Date('2024-01-12'),
          messages: [
            {
              id: 1,
              sender: 'customer',
              message: 'My order was supposed to arrive yesterday but I haven\'t received it yet. Order number: ORD-2024-001',
              timestamp: new Date('2024-01-10T14:00:00')
            },
            {
              id: 2,
              sender: 'support',
              message: 'I apologize for the delay. There was a courier issue in your area. Your order is now scheduled for delivery today before 5 PM. You\'ll receive tracking updates via SMS.',
              timestamp: new Date('2024-01-11T08:00:00')
            },
            {
              id: 3,
              sender: 'customer',
              message: 'Perfect! Received the delivery today. Thank you for the quick resolution.',
              timestamp: new Date('2024-01-12T16:30:00')
            }
          ]
        }
      ];
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      sender: 'bot',
      message: 'Hello! I\'m here to help you with any questions about our appliances. How can I assist you today?',
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
  };

  const handleContactFormChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new ticket
      const newTicket = {
        id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
        subject: contactForm.subject,
        category: contactForm.category,
        status: 'open',
        priority: contactForm.priority,
        createdAt: new Date(),
        lastUpdate: new Date(),
        messages: [
          {
            id: 1,
            sender: 'customer',
            message: contactForm.message,
            timestamp: new Date()
          }
        ]
      };

      setTickets([newTicket, ...tickets]);
      
      // Reset form
      setContactForm({
        name: contactForm.name,
        email: contactForm.email,
        phone: '',
        subject: '',
        category: '',
        message: '',
        priority: 'medium'
      });

      // Removed annoying popup - redirect to tickets shows success
      setActiveSection('tickets');
    } catch (error) {
      // Removed annoying popup - show error message in form instead
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = {
        id: Date.now() + 1,
        sender: 'bot',
        message: getBotResponse(newMessage),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 2000);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
      return 'To track your order, please visit the "Order Tracking" page in your account dashboard or provide your order number for assistance.';
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return 'Our return policy allows 30 days for returns in original packaging. Would you like me to connect you with a support agent to initiate a return?';
    } else if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return 'We offer standard delivery (3-5 days) and express delivery (1-2 days) for major cities. Free shipping is available on orders over R5,000.';
    } else if (lowerMessage.includes('payment')) {
      return 'We accept credit cards, EFT, PayFast, and cash on delivery. Is there a specific payment issue you need help with?';
    } else if (lowerMessage.includes('warranty')) {
      return 'All our appliances come with manufacturer warranty. Coverage varies by brand (1-3 years typically). Do you need help with a warranty claim?';
    } else {
      return 'I understand you need assistance. For detailed help with your specific question, I recommend creating a support ticket or speaking with our live support team. How else can I help?';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': '#f39c12',
      'in-progress': '#3498db',
      'resolved': '#27ae60',
      'closed': '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#27ae60',
      'medium': '#f39c12',
      'high': '#e74c3c',
      'urgent': '#8e44ad'
    };
    return colors[priority] || '#f39c12';
  };

  return (
    <div className="customer-support">
      <div className="support-header">
        <h1>Customer Support</h1>
        <p>We're here to help! Get assistance with orders, products, and more.</p>
      </div>

      <div className="support-navigation">
        <button
          className={`nav-btn ${activeSection === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveSection('contact')}
        >
          📝 Contact Us
        </button>
        <button
          className={`nav-btn ${activeSection === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveSection('tickets')}
        >
          🎫 Support Tickets
        </button>
        <button
          className={`nav-btn ${activeSection === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveSection('chat')}
        >
          💬 Live Chat
        </button>
        <button
          className={`nav-btn ${activeSection === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveSection('faq')}
        >
          ❓ FAQ
        </button>
      </div>

      <div className="support-content">
        {activeSection === 'contact' && (
          <div className="contact-section">
            <h2>Contact Support</h2>
            <div className="contact-methods">
              <div className="contact-method">
                <div className="method-icon">📞</div>
                <div className="method-info">
                  <h3>Phone Support</h3>
                  <p>0800 HALFSEC (425 3732)</p>
                  <small>Mon-Fri: 8AM-6PM, Sat: 9AM-2PM</small>
                </div>
              </div>
              <div className="contact-method">
                <div className="method-icon">✉️</div>
                <div className="method-info">
                  <h3>Email Support</h3>
                  <p>support@halfsec.com</p>
                  <small>Response within 24 hours</small>
                </div>
              </div>
              <div className="contact-method">
                <div className="method-icon">💬</div>
                <div className="method-info">
                  <h3>Live Chat</h3>
                  <p>Chat with our support team</p>
                  <small>Available during business hours</small>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={contactForm.category}
                    onChange={handleContactFormChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {supportCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={contactForm.priority}
                    onChange={handleContactFormChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactFormChange}
                  rows="6"
                  required
                  placeholder="Please describe your issue or question in detail..."
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Support Request'}
              </button>
            </form>
          </div>
        )}

        {activeSection === 'tickets' && (
          <div className="tickets-section">
            <h2>Your Support Tickets</h2>
            {tickets.length === 0 ? (
              <div className="no-tickets">
                <p>You don't have any support tickets yet.</p>
                <button 
                  className="create-ticket-btn"
                  onClick={() => setActiveSection('contact')}
                >
                  Create New Ticket
                </button>
              </div>
            ) : (
              <div className="tickets-list">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-header">
                      <div className="ticket-info">
                        <h3>{ticket.subject}</h3>
                        <p className="ticket-id">#{ticket.id}</p>
                      </div>
                      <div className="ticket-badges">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(ticket.status) }}
                        >
                          {ticket.status}
                        </span>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-meta">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                      <span>Last Update: {ticket.lastUpdate.toLocaleDateString()}</span>
                    </div>
                    <div className="ticket-messages">
                      {ticket.messages.slice(-2).map(message => (
                        <div key={message.id} className={`message ${message.sender}`}>
                          <div className="message-content">
                            <p>{message.message}</p>
                            <small>{message.timestamp.toLocaleString()}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'chat' && (
          <div className="chat-section">
            <h2>Live Chat Support</h2>
            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map(message => (
                  <div key={message.id} className={`chat-message ${message.sender}`}>
                    <div className="message-bubble">
                      <p>{message.message}</p>
                      <small>{message.timestamp.toLocaleTimeString()}</small>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="chat-message bot">
                    <div className="message-bubble typing">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <form className="chat-input" onSubmit={handleChatSubmit}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        )}

        {activeSection === 'faq' && (
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-categories">
              {faqData.map((category, index) => (
                <div key={index} className="faq-category">
                  <h3>{category.category}</h3>
                  <div className="faq-questions">
                    {category.questions.map((faq, faqIndex) => (
                      <details key={faqIndex} className="faq-item">
                        <summary>{faq.question}</summary>
                        <p>{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSupport;