import React, { useState } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { useData } from '../context/DataContext';
import Modal from '../components/common/Modal';
import './Customers.css';

const Customers = () => {
  const { customers, addCustomer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addCustomer(newCustomer);
    setNewCustomer({ name: '', phone: '', email: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search customers by name, phone, or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
            {filteredCustomers.map(customer => (
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
                    <span>{customer.phone}</span>
                    <span className="email">{customer.email}</span>
                  </div>
                </td>
                <td>{customer.visits}</td>
                <td>
                  <button className="text-btn">View History</button>
                </td>
              </tr>
            ))}
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
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              required 
              value={newCustomer.phone}
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              value={newCustomer.email}
              onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
            <button type="submit" className="primary-btn">Save Customer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
