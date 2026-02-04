import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User, Edit, Trash } from 'lucide-react';
import Modal from '../components/common/Modal';
import CustomerHistoryModal from '../components/customers/CustomerHistoryModal';
import './Customers.css';

import { api } from '../utils/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '',
    status: 'Active',
    notes: ''
  });
  
  // History Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async (query = '', status = 'All') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (status && status !== 'All') params.append('status', status);
      const endpoint = params.toString() ? `/customers/?${params.toString()}` : '/customers/';
      
      const data = await api.get(endpoint);
      setCustomers(data);
      setError('');
    } catch (err) {
      console.error('Error fetching customers:', err);
      if (String(err.message).includes('401') || String(err.message).includes('Authentication credentials were not provided')) {
        localStorage.removeItem('garage_token');
        localStorage.removeItem('garage_user');
        window.location.href = '/login';
        return;
      }
      setError('Failed to fetch customers: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchCustomers(searchTerm, statusFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchCustomers]);

  const resetForm = () => {
      setNewCustomer({ 
        name: '', phone: '', email: '', 
        address: '', status: 'Active', notes: '' 
      });
      setEditingId(null);
  };

  const openNewModal = () => {
      resetForm();
      setIsModalOpen(true);
  };

  const handleEdit = (customer) => {
      setNewCustomer({
          name: customer.name,
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || '',
          status: customer.status || 'Active',
        notes: customer.notes || ''
      });
      setEditingId(customer.id);
      setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this customer?')) return;
      try {
          await api.delete(`/customers/${id}/`);
          fetchCustomers(searchTerm);
      } catch (err) {
          alert('Failed to delete customer: ' + err.message);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}/`, newCustomer);
      } else {
        await api.post('/customers/', newCustomer);
      }
      
      resetForm();
      setIsModalOpen(false);
      fetchCustomers(searchTerm); 
    } catch (err) {
      alert('Failed to save customer: ' + err.message);
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
        <div className="filters">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Banned">Banned</option>
          </select>
        </div>
        <button className="primary-btn" onClick={openNewModal}>
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
              <th>Status</th>
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
                    <div>
                        <span style={{display: 'block', fontWeight: 500}}>{customer.name}</span>
                        {customer.notes && (
                            <span style={{fontSize: '0.75rem', color: '#888', fontStyle: 'italic'}}>
                                {customer.notes.length > 30 ? customer.notes.substring(0, 30) + '...' : customer.notes}
                            </span>
                        )}
                    </div>
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
                    <span className={`badge ${customer.status === 'Active' ? 'badge-success' : customer.status === 'Banned' ? 'badge-danger' : 'badge-neutral'}`}
                        style={{
                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                            backgroundColor: customer.status === 'Active' ? '#dcfce7' : customer.status === 'Banned' ? '#fee2e2' : '#f3f4f6',
                            color: customer.status === 'Active' ? '#166534' : customer.status === 'Banned' ? '#991b1b' : '#374151'
                        }}
                    >
                        {customer.status || 'Active'}
                    </span>
                </td>
                <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                        <button 
                            className="icon-btn" 
                            title="Edit"
                            onClick={() => handleEdit(customer)}
                            style={{padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            className="icon-btn" 
                            title="Delete"
                            onClick={() => handleDelete(customer.id)}
                            style={{padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}
                        >
                            <Trash size={18} />
                        </button>
                        <button 
                            className="text-btn" 
                            onClick={() => handleViewHistory(customer.id)}
                            style={{fontSize: '0.85rem'}}
                        >
                            History
                        </button>
                    </div>
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
        title={editingId ? "Edit Customer" : "Add New Customer"}
      >
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-row name-status">
            <div className="form-group">
                <label>Full Name</label>
                <input 
                required 
                className="form-control"
                value={newCustomer.name}
                onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                placeholder="Enter full name"
                />
            </div>
            <div className="form-group">
                <label>Status</label>
                <select
                    className="form-control"
                    value={newCustomer.status}
                    onChange={e => setNewCustomer({...newCustomer, status: e.target.value})}
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Banned">Banned</option>
                </select>
            </div>
          </div>
          
          <div className="form-row two-col">
            <div className="form-group">
                <label>Phone Number</label>
                <input 
                className="form-control"
                value={newCustomer.phone}
                onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                placeholder="Enter phone"
                />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input 
                type="email"
                className="form-control"
                value={newCustomer.email}
                onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                placeholder="Enter email address"
                />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea 
              className="form-control"
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
              placeholder="Enter address"
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea 
              className="form-control"
              value={newCustomer.notes}
              onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})}
              placeholder="Internal notes (optional)"
              rows="2"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
            <button type="submit" className="primary-btn">
                {editingId ? 'Update Customer' : 'Save Customer'}
            </button>
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
