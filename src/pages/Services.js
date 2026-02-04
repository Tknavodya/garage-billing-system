import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Clock, Wrench } from 'lucide-react';
import Modal from '../components/common/Modal';
import { api } from '../utils/api';
import './Customers.css';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [newService, setNewService] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    duration: '', 
    category: 'Maintenance' 
  });

  const categories = ['Maintenance', 'Brakes', 'Tires', 'Engine', 'Climate', 'Electrical', 'Other'];

  const [editingId, setEditingId] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/services/';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      url += `?${params.toString()}`;

      const data = await api.get(url);
      setServices(data);
      setError('');
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchServices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/services/${editingId}/`, newService);
      } else {
        await api.post('/services/', newService);
      }

      setIsModalOpen(false);
      setNewService({ 
          name: '', description: '', price: '', 
          duration: '', category: 'Maintenance' 
      });
      setEditingId(null);
      fetchServices();
    } catch (err) {
        alert('Failed to save service: ' + err.message);
    }
  };

  const handleEdit = (service) => {
      setNewService({
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          category: service.category
      });
      setEditingId(service.id);
      setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this service?')) return;
      
      try {
          await api.delete(`/services/${id}/`);
          fetchServices();
      } catch (err) {
          alert('Failed to delete service');
      }
  };

  const filteredServices = services.filter(service => {
      if (filterCategory === 'All') return true;
      return service.category === filterCategory;
  });

  // Helper to format duration
  const formatDuration = (mins) => {
      if (mins >= 60) {
          const hrs = Math.floor(mins / 60);
          const remainingMins = mins % 60;
          return remainingMins > 0 ? `${hrs} hr ${remainingMins} min` : `${hrs} hr`;
      }
      return `${mins} min`;
  };

  const openNewModal = () => {
      setEditingId(null);
      setNewService({ 
        name: '', description: '', price: '', 
        duration: '', category: 'Maintenance' 
    });
    setIsModalOpen(true);
  };

  return (
    <div className="customers-page">
      <div className="page-header" style={{ marginBottom: '0.5rem' }}>
        <div>
            <h1>Services</h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Manage your service catalog</p>
        </div>
        <button className="primary-btn" onClick={openNewModal}>
          <Plus size={18} />
          Add Service
        </button>
      </div>

      <div className="actions-bar" style={{ gap: '1rem' }}>
        <div className="search-bar" style={{width: '300px'}}>
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search services..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
            className="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
        >
            <option value="All">All Categories</option>
            {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="services-grid">
          {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                  <div className="service-header">
                      <span className={`category-badge badge-${service.category.toLowerCase()}`}>
                          {service.category}
                      </span>
                      <div className="card-actions">
                          <button onClick={() => handleEdit(service)} className="icon-btn edit-btn" title="Edit">
                            <span style={{fontSize: '18px'}}>✎</span>
                          </button>
                          <button onClick={() => handleDelete(service.id)} className="icon-btn delete-btn" title="Delete">
                            <span style={{fontSize: '18px', color: '#ef4444'}}>×</span>
                          </button>
                      </div>
                  </div>
                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-footer">
                      <div className="duration">
                          <Clock size={16} />
                          <span>{formatDuration(service.duration)}</span>
                      </div>
                      <div className="price">
                          Rs. {service.price}
                      </div>
                  </div>
              </div>
          ))}
          {!loading && filteredServices.length === 0 && (
              <div className="no-results">
                  No services found matching your criteria.
              </div>
          )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Service" : "Add New Service"}>
        <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-group">
                <label>Service Name</label>
                <input 
                    required 
                    value={newService.name}
                    onChange={e => setNewService({...newService, name: e.target.value})}
                    placeholder="e.g. Oil Change"
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea 
                    value={newService.description}
                    onChange={e => setNewService({...newService, description: e.target.value})}
                    placeholder="Brief description of the service..."
                    className="form-control"
                    rows="3"
                />
            </div>

            <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                    <label>Category</label>
                    <select 
                        value={newService.category}
                        onChange={e => setNewService({...newService, category: e.target.value})}
                        className="form-control"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group" style={{flex: 1}}>
                    <label>Price (Rs.)</label>
                    <input 
                        type="number" step="0.01"
                        required 
                        value={newService.price}
                        onChange={e => setNewService({...newService, price: e.target.value})}
                        placeholder="0.00"
                        className="form-control"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Duration (Minutes)</label>
                <input 
                    type="number"
                    required 
                    value={newService.duration}
                    onChange={e => setNewService({...newService, duration: e.target.value})}
                    placeholder="e.g. 30"
                    className="form-control"
                />
            </div>

            <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">{editingId ? 'Update Service' : 'Add Service'}</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;
