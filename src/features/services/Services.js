import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BadgeInfo,
  Clock,
  DollarSign,
  Layers3,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { api } from '../../utils/api';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchActionBar } from '../../components/shared/SearchActionBar';
import { EmptyState } from '../../components/shared/EmptyState';
import '../../styles/customer-page.css';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedServiceId, setSelectedServiceId] = useState(null);
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

  useEffect(() => {
    if (!filteredServices.length) {
      if (selectedServiceId !== null) {
        setSelectedServiceId(null);
      }
      return;
    }

    const selectedExists = filteredServices.some(service => service.id === selectedServiceId);
    if (!selectedExists) {
      setSelectedServiceId(filteredServices[0].id);
    }
  }, [filteredServices, selectedServiceId]);

  const selectedService = useMemo(() => {
    if (!filteredServices.length) {
      return null;
    }

    return filteredServices.find(service => service.id === selectedServiceId) || filteredServices[0];
  }, [filteredServices, selectedServiceId]);

  const summary = useMemo(() => {
    const totalCount = services.length;
    const visibleCount = filteredServices.length;
    const priceTotal = services.reduce((acc, service) => acc + Number(service.price || 0), 0);
    const durationTotal = services.reduce((acc, service) => acc + Number(service.duration || 0), 0);
    const uniqueCategories = new Set(services.map(service => service.category).filter(Boolean)).size;

    return {
      totalCount,
      visibleCount,
      averagePrice: totalCount ? priceTotal / totalCount : 0,
      averageDuration: totalCount ? durationTotal / totalCount : 0,
      uniqueCategories,
    };
  }, [filteredServices, services]);

  // Helper to format duration
  const formatDuration = (mins) => {
      const totalMinutes = Number(mins);

      if (!Number.isFinite(totalMinutes)) {
          return 'Not recorded';
      }

      if (totalMinutes >= 60) {
          const hrs = Math.floor(totalMinutes / 60);
          const remainingMins = totalMinutes % 60;
          return remainingMins > 0 ? `${hrs} hr ${remainingMins} min` : `${hrs} hr`;
      }

      return `${totalMinutes} min`;
  };

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

  const getTempoLabel = (mins) => {
    const totalMinutes = Number(mins);

    if (!Number.isFinite(totalMinutes)) {
      return 'Ready to quote';
    }

    if (totalMinutes <= 30) {
      return 'Quick slot';
    }

    if (totalMinutes <= 60) {
      return 'Standard slot';
    }

    return 'Extended slot';
  };

  const getTempoTone = (mins) => {
    const totalMinutes = Number(mins);

    if (!Number.isFinite(totalMinutes)) {
      return 'neutral';
    }

    if (totalMinutes <= 30) {
      return 'success';
    }

    if (totalMinutes <= 60) {
      return 'neutral';
    }

    return 'warning';
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
    <div className="customers-page services-page page-shell">
      <PageHeader
        eyebrow="Service catalog"
        title="Services"
        description="Manage workshop offerings in a premium catalog workspace with richer context and faster editing."
      />

      <section className="services-insights">
        <div className="services-insights-grid">
          <article className="insight-card">
            <span className="insight-icon accent-blue"><Layers3 size={18} /></span>
            <div>
              <span className="premium-label">Visible services</span>
              <strong>{summary.visibleCount}</strong>
              <p>{summary.visibleCount === summary.totalCount ? 'All catalog items are shown' : `Filtered from ${summary.totalCount} total services`}</p>
            </div>
          </article>

          <article className="insight-card">
            <span className="insight-icon accent-green"><DollarSign size={18} /></span>
            <div>
              <span className="premium-label">Average price</span>
              <strong>{formatCurrency(summary.averagePrice)}</strong>
              <p>Across the current service library</p>
            </div>
          </article>

          <article className="insight-card">
            <span className="insight-icon accent-gold"><Clock size={18} /></span>
            <div>
              <span className="premium-label">Average duration</span>
              <strong>{formatDuration(summary.averageDuration)}</strong>
              <p>Based on current catalog timings</p>
            </div>
          </article>

          <article className="insight-card">
            <span className="insight-icon accent-slate"><Target size={18} /></span>
            <div>
              <span className="premium-label">Categories</span>
              <strong>{summary.uniqueCategories}</strong>
              <p>Service groups in use</p>
            </div>
          </article>
        </div>
      </section>

      <SearchActionBar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search services..."
        filters={[
          {
            value: filterCategory,
            onChange: setFilterCategory,
            options: [
              { label: 'All Categories', value: 'All' },
              ...categories.map((cat) => ({ label: cat, value: cat })),
            ],
          },
        ]}
        actions={(
          <button className="primary-btn" onClick={openNewModal}>
            <Plus size={18} />
            Add Service
          </button>
        )}
      />

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="services-workspace">
        <div className="services-main-column">
          {!loading && filteredServices.length === 0 ? (
            <EmptyState title="No services found" description="Try a different category or add a new service offering." />
          ) : (
            <div className="services-grid">
              {filteredServices.map(service => (
                <article
                  key={service.id}
                  className={`service-card ${selectedServiceId === service.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedServiceId(service.id)}
                >
                  <div className="service-card-top">
                    <div className="service-badges">
                      <span className={`category-badge badge-${service.category.toLowerCase()}`}>
                        {service.category}
                      </span>
                      <span className={`service-status service-status-${getTempoTone(service.duration)}`}>
                        {getTempoLabel(service.duration)}
                      </span>
                    </div>
                    <div className="card-actions" onClick={(event) => event.stopPropagation()}>
                      <button onClick={() => handleEdit(service)} className="icon-btn edit-btn" title="Edit">
                        <span style={{fontSize: '18px'}}>✎</span>
                      </button>
                      <button onClick={() => handleDelete(service.id)} className="icon-btn delete-btn" title="Delete">
                        <span style={{fontSize: '18px', color: '#ef4444'}}>×</span>
                      </button>
                    </div>
                  </div>

                  <div className="service-card-body">
                    <div className="service-title-row">
                      <div>
                        <span className="premium-label">Service type</span>
                        <h3>{service.name}</h3>
                      </div>
                      <div className="service-price-block">
                        <span className="premium-label">Cost</span>
                        <strong>{formatCurrency(service.price)}</strong>
                      </div>
                    </div>

                    <p className="service-description">{service.description || 'No description has been added for this service yet.'}</p>

                    <div className="service-meta-grid">
                      <div className="service-meta">
                        <span className="premium-label">Duration</span>
                        <strong>{formatDuration(service.duration)}</strong>
                      </div>
                      <div className="service-meta">
                        <span className="premium-label">Status</span>
                        <strong>Live catalog</strong>
                      </div>
                      <div className="service-meta">
                        <span className="premium-label">Workflow</span>
                        <strong>Quote ready</strong>
                      </div>
                    </div>
                  </div>

                  <div className="service-footer">
                    <div className="duration">
                      <Clock size={16} />
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                    <div className="price">
                      {formatCurrency(service.price)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="services-sidebar">
          <div className="detail-panel">
            <div className="detail-panel-header">
              <div>
                <span className="premium-label">Workflow view</span>
                <h2>Service blueprint</h2>
              </div>
              <span className="detail-panel-chip">
                <Sparkles size={14} />
                Premium review
              </span>
            </div>

            {selectedService ? (
              <>
                <div className="detail-hero">
                  <div>
                    <span className={`category-badge badge-${selectedService.category.toLowerCase()}`}>
                      {selectedService.category}
                    </span>
                    <h3>{selectedService.name}</h3>
                    <p>{selectedService.description || 'No description available.'}</p>
                  </div>
                  <div className="detail-hero-price">
                    <span className="premium-label">Listed cost</span>
                    <strong>{formatCurrency(selectedService.price)}</strong>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="premium-label">Service type</span>
                    <strong>{selectedService.name}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="premium-label">Typical duration</span>
                    <strong>{formatDuration(selectedService.duration)}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="premium-label">Operational status</span>
                    <strong>Live catalog</strong>
                  </div>
                  <div className="detail-item">
                    <span className="premium-label">Technician</span>
                    <strong>Not tracked here</strong>
                  </div>
                  <div className="detail-item">
                    <span className="premium-label">Advance payment</span>
                    <strong>Captured at invoice stage</strong>
                  </div>
                  <div className="detail-item">
                    <span className="premium-label">Balance due</span>
                    <strong>Calculated in billing</strong>
                  </div>
                </div>

                <div className="workflow-timeline">
                  <div className="workflow-step is-complete">
                    <span className="workflow-step-dot" />
                    <div>
                      <strong>Cataloged</strong>
                      <p>Visible in the services library.</p>
                    </div>
                  </div>
                  <div className="workflow-step is-active">
                    <span className="workflow-step-dot" />
                    <div>
                      <strong>Quoted</strong>
                      <p>Ready to be pulled into an invoice.</p>
                    </div>
                  </div>
                  <div className="workflow-step">
                    <span className="workflow-step-dot" />
                    <div>
                      <strong>Assigned</strong>
                      <p>Technician and bay allocation live in billing.</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="sidebar-empty">
                <BadgeInfo size={22} />
                <h3>No service selected</h3>
                <p>Choose a service card to inspect its workflow summary and pricing context.</p>
              </div>
            )}
          </div>
        </aside>
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
