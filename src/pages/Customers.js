import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User } from 'lucide-react';
import Modal from '../components/common/Modal';
import CustomerHistoryModal from '../components/customers/CustomerHistoryModal';
import './Customers.css';

import { api } from '../utils/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  
  // History Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query 
        ? `/customers/?search=${encodeURIComponent(query)}` 
        : '/customers/';
      
      const data = await api.get(endpoint);
      setCustomers(data);
      setError('');
    } catch (err) {
      console.error('Error fetching customers:', err);
      // Determine if it's a network error or API error
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchCustomers(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchCustomers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers/', newCustomer);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      setIsModalOpen(false);
      fetchCustomers(searchTerm); // Refresh list
    } catch (err) {
      alert('Failed to add customer: ' + err.message);
    }
  };

  const handleViewHistory = (customerId) => {
      setSelectedCustomerId(customerId);
      setIsHistoryModalOpen(true);
  };

  return (
    <div className="customers-page animate-fade-in">
      <div className="page-header">
        <h1>Customers</h1>
      </div>

      <div className="actions-bar">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Visits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="user-info">
                    <div className="avatar">
                      <User size={16} />
                    </div>
                    <span>{customer.name}</span>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <span>{customer.phone || 'N/A'}</span>
                    <span className="email">{customer.email || 'N/A'}</span>
                  </div>
                </td>
                <td>{customer.visits}</td>
                <td>
                  <button 
                    className="text-btn" 
                    onClick={() => handleViewHistory(customer.id)}
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Customer"
      >
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              required 
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              placeholder="Enter full name"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              value={newCustomer.phone}
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              value={newCustomer.email}
              onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea 
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
              placeholder="Enter address (optional)"
              rows="2"
              style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd'}}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
            <button type="submit" className="primary-btn">Save Customer</button>
          </div>
        </form>
      </Modal>

      <CustomerHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        customerId={selectedCustomerId}
      />
    </div>
  );
};

export default Customers;
