import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash, History, Phone, Mail, MapPin } from 'lucide-react';
import Modal from '../../components/common/Modal';
import CustomerHistoryModal from '../../components/customers/CustomerHistoryModal';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchActionBar } from '../../components/shared/SearchActionBar';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import '../../styles/customer-page.css';

import { api } from '../../utils/api';

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

  const getInitials = (name) => {
    return String(name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'C';
  };

  const getContactLines = (customer) => {
    return [
      { icon: Phone, value: customer.phone || 'No phone recorded' },
      { icon: Mail, value: customer.email || 'No email recorded' },
      { icon: MapPin, value: customer.address || 'No address recorded' },
    ];
  };

  return (
    <div className="customers-page page-shell animate-fade-in">
      <PageHeader
        eyebrow="Customer management"
        title="Customers"
        description="Track every client, contact detail, and vehicle relationship in one premium workspace."
      />

      <SearchActionBar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search customers..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Status', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'Banned', value: 'Banned' },
            ],
          },
        ]}
        actions={(
          <button className="primary-btn" onClick={openNewModal}>
            <Plus size={18} />
            Add Customer
          </button>
        )}
      />

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="customers-table customer-table-shell">
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
                  <div className="customer-identity">
                    <div className="customer-avatar">
                      {getInitials(customer.name)}
                    </div>
                    <div className="customer-name-stack">
                      <span className="customer-name">{customer.name}</span>
                      <span className="customer-subtext">
                        {customer.notes
                          ? (customer.notes.length > 44 ? `${customer.notes.substring(0, 44)}...` : customer.notes)
                          : 'No internal notes'}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info contact-stack">
                    {getContactLines(customer).map((line) => {
                      const Icon = line.icon;
                      return (
                        <div key={line.value} className="contact-line">
                          <Icon size={14} />
                          <span>{line.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <div className="visit-cell">
                    <strong>{customer.visits}</strong>
                    <span>visits</span>
                  </div>
                </td>
                <td>
                  <StatusBadge status={customer.status || 'Active'} />
                </td>
                <td>
                    <div className="customer-actions">
                        <button 
                            className="icon-action-btn edit"
                            title="Edit"
                            onClick={() => handleEdit(customer)}
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            className="icon-action-btn delete"
                            title="Delete"
                            onClick={() => handleDelete(customer.id)}
                        >
                            <Trash size={18} />
                        </button>
                        <button 
                            className="text-btn history-btn" 
                            onClick={() => handleViewHistory(customer.id)}
                        >
                            <History size={16} />
                            History
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && customers.length === 0 && !error && (
        <EmptyState
          title="No customers found"
          description="Try a different search or add the first customer profile to the system."
          action={(
            <button className="primary-btn" onClick={openNewModal}>
              <Plus size={18} />
              Add Customer
            </button>
          )}
        />
      )}

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
