import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Trash } from 'lucide-react';
import Modal from '../components/common/Modal';
import InvoiceDetailsModal from '../components/invoices/InvoiceDetailsModal';
import { api } from '../utils/api';
import './Invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]); // Available Services
  const [parts, setParts] = useState([]);       // Available Parts
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Invoice Details State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form State
  const [newInvoice, setNewInvoice] = useState({ 
    customer: '', 
    vehicle: '', 
    // invoice_number handled by backend
    date: new Date().toISOString().split('T')[0], 
    status: 'Pending',
    selected_services: [], // List of {id, name, price}
    selected_parts: []     // List of {id, name, price, quantity}
  });

  // State for currently adding item
  const [tempService, setTempService] = useState('');
  const [tempPart, setTempPart] = useState('');
  const [tempQty, setTempQty] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/invoices/';
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      const data = await api.get(url);
      setInvoices(data);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchDependencies = useCallback(async () => {
      try {
          const [custData, vehData, srvData, partData] = await Promise.all([
              api.get('/customers/'),
              api.get('/vehicles/'),
              api.get('/services/'),
              api.get('/parts/')
          ]);

          setCustomers(custData);
          setVehicles(vehData);
          setServices(srvData);
          setParts(partData);
      } catch(err) {
          console.error("Error fetching dependencies", err);
      }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchData]);

  useEffect(() => {
      fetchDependencies();
  }, [fetchDependencies]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices/', newInvoice);

      setIsModalOpen(false);
      setNewInvoice({ 
          customer: '', vehicle: '', 
          date: new Date().toISOString().split('T')[0], 
          status: 'Pending',
          selected_services: [],
          selected_parts: []
      });
      fetchData();
      // Refresh parts to show updated stock
      const partData = await api.get('/parts/');
      setParts(partData);
    } catch (err) {
        alert('Failed to create invoice: ' + err.message);
    }
  };

  const handleViewInvoice = (id) => {
      setSelectedInvoiceId(id);
      setIsDetailsOpen(true);
  };

  const closeDetails = () => {
      setIsDetailsOpen(false);
      setSelectedInvoiceId(null);
  };

  // --- Add Item Handlers ---
  const addService = () => {
      if(!tempService) return;
      const serviceObj = services.find(s => s.id === parseInt(tempService));
      if(!serviceObj) return;

      // Prevent duplicates
      if(newInvoice.selected_services.find(s => s.id === serviceObj.id)) {
          alert("Service already added");
          return;
      }

      setNewInvoice(prev => ({
          ...prev,
          selected_services: [...prev.selected_services, {
              id: serviceObj.id,
              name: serviceObj.name,
              price: serviceObj.price
          }]
      }));
      setTempService('');
  };

  const addPart = () => {
      if(!tempPart) return;
      const partObj = parts.find(p => p.id === parseInt(tempPart));
      if(!partObj) return;

      if(partObj.stock < tempQty) {
          alert(`Insufficient stock! Only ${partObj.stock} available.`);
          return;
      }

      // Check if already exists, then update quantity
      const existing = newInvoice.selected_parts.find(p => p.id === partObj.id);
      if(existing) {
          const newQty = existing.quantity + parseInt(tempQty);
          if(partObj.stock < newQty) {
             alert(`Cannot add more. Total stock: ${partObj.stock}`);
             return;
          }
          setNewInvoice(prev => ({
              ...prev,
              selected_parts: prev.selected_parts.map(p => 
                  p.id === partObj.id ? {...p, quantity: newQty} : p
              )
          }));
      } else {
          setNewInvoice(prev => ({
              ...prev,
              selected_parts: [...prev.selected_parts, {
                  id: partObj.id,
                  name: partObj.name,
                  price: partObj.price,
                  quantity: parseInt(tempQty)
              }]
          }));
      }
      setTempPart('');
      setTempQty(1);
  };

  const removeService = (id) => {
      setNewInvoice(prev => ({
          ...prev,
          selected_services: prev.selected_services.filter(s => s.id !== id)
      }));
  };

  const removePart = (id) => {
      setNewInvoice(prev => ({
          ...prev,
          selected_parts: prev.selected_parts.filter(p => p.id !== id)
      }));
  };

  // Calculate Total
  const calculateTotal = () => {
      const servicesTotal = newInvoice.selected_services.reduce((acc, s) => acc + parseFloat(s.price), 0);
      const partsTotal = newInvoice.selected_parts.reduce((acc, p) => acc + (parseFloat(p.price) * p.quantity), 0);
      return (servicesTotal + partsTotal).toFixed(2);
  };

  // Filter vehicles based on selected customer
  const customerVehicles = newInvoice.customer 
    ? vehicles.filter(v => v.customer === parseInt(newInvoice.customer))
    : [];

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1>Invoices</h1>
      </div>

      <div className="actions-bar">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search invoices..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>
                    <span className="badge" style={{background: '#e0f2fe', color: '#0369a1'}}>
                        {invoice.invoice_number}
                    </span>
                </td>
                <td>{invoice.customer_name}</td>
                <td>{invoice.vehicle_display}</td>
                <td>{invoice.date}</td>
                <td style={{fontWeight: 'bold'}}>Rs. {invoice.amount}</td>
                <td>
                    <select 
                        className={`badge ${invoice.status === 'Paid' ? 'status-paid' : 'status-pending'}`}
                        style={{
                            background: invoice.status === 'Paid' ? '#dcfce7' : 
                                        invoice.status === 'Overdue' ? '#fee2e2' : '#fef9c3',
                            color: invoice.status === 'Paid' ? '#166534' : 
                                    invoice.status === 'Overdue' ? '#991b1b' : '#854d0e',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px 8px',
                            fontWeight: 500
                        }}
                        value={invoice.status}
                        onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                                await api.put(`/invoices/${invoice.id}/`, { ...invoice, status: newStatus });
                                // Optimistic update or refresh
                                setInvoices(prev => prev.map(inv => 
                                    inv.id === invoice.id ? { ...inv, status: newStatus } : inv
                                ));
                            } catch (err) {
                                alert("Failed to update status");
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </td>
                <td>
                  <div className="actions-cell">
                    <button 
                      className="icon-btn view" 
                      onClick={() => handleViewInvoice(invoice.id)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="icon-btn delete" 
                      onClick={() => {
                        if(window.confirm('Are you sure you want to delete this invoice?')) {
                             api.delete(`/invoices/${invoice.id}/`).then(fetchData);
                        }
                      }}
                      title="Delete Invoice"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
             {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Invoice">
        <form onSubmit={handleSubmit} className="customer-form" style={{maxWidth: '800px'}}>
            {/* --- SECTION 1: Details --- */}
            <h3 className="section-title">1. Invoice Details</h3>
            <div className="form-row">
                <div className="form-group">
                    <label style={{color: '#94a3b8', fontStyle: 'italic'}}>IN (Auto)</label>
                    <input 
                        disabled
                        placeholder="Auto-generated"
                        className="form-control"
                        style={{background: '#f1f5f9'}}
                    />
                </div>
                 <div className="form-group" style={{flex: 1}}>
                    <label>Date</label>
                    <input 
                        type="date"
                        required 
                        value={newInvoice.date}
                        onChange={e => setNewInvoice({...newInvoice, date: e.target.value})}
                        className="form-control"
                    />
                </div>
                 <div className="form-group" style={{flex: 1}}>
                    <label>Status</label>
                    <select 
                        value={newInvoice.status}
                        onChange={e => setNewInvoice({...newInvoice, status: e.target.value})}
                        className="form-control"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                 <div className="form-group" style={{flex: 1}}>
                    <label>Customer</label>
                    <select 
                    required 
                    value={newInvoice.customer}
                    onChange={e => setNewInvoice({...newInvoice, customer: e.target.value, vehicle: ''})}
                    className="form-control"
                    >
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    </select>
                </div>
                <div className="form-group" style={{flex: 1}}>
                    <label>Vehicle</label>
                    <select 
                    value={newInvoice.vehicle}
                    onChange={e => setNewInvoice({...newInvoice, vehicle: e.target.value})}
                    className="form-control"
                    disabled={!newInvoice.customer}
                    >
                    <option value="">-- Select Vehicle --</option>
                    {customerVehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} ({v.plate_number})</option>
                    ))}
                    </select>
                </div>
            </div>

            {/* --- SECTION 2: Services --- */}
            <h3 className="section-title">2. Add Services</h3>
            <div className="add-item-row">
                <select 
                    className="form-control" 
                    value={tempService}
                    onChange={e => setTempService(e.target.value)}
                    style={{flex: 1}}
                >
                    <option value="">-- Choose Service --</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Rs. {s.price})</option>
                    ))}
                </select>
                <button type="button" className="secondary-btn" onClick={addService}>Add</button>
            </div>
            
            {newInvoice.selected_services.length > 0 && (
                <div className="item-list">
                    {newInvoice.selected_services.map(s => (
                        <div key={s.id} className="added-item">
                            <span>{s.name}</span>
                            <span className="price">Rs. {s.price}</span>
                            <button type="button" className="icon-btn" onClick={() => removeService(s.id)}>
                                <Trash size={14} color="#ef4444"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- SECTION 3: Parts --- */}
            <h3 className="section-title">3. Add Parts (Inventory)</h3>
            <div className="add-item-row">
                <select 
                    className="form-control" 
                    value={tempPart}
                    onChange={e => setTempPart(e.target.value)}
                    style={{flex: 2}}
                >
                    <option value="">-- Choose Part --</option>
                    {parts.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stock}) - Rs. {p.price}
                        </option>
                    ))}
                </select>
                <input 
                    type="number" 
                    min="1"
                    className="form-control"
                    style={{width: '80px'}}
                    value={tempQty}
                    onChange={e => setTempQty(e.target.value)}
                />
                <button type="button" className="secondary-btn" onClick={addPart}>Add</button>
            </div>

            {newInvoice.selected_parts.length > 0 && (
                <div className="item-list">
                    {newInvoice.selected_parts.map(p => (
                        <div key={p.id} className="added-item">
                            <span>{p.name} (x{p.quantity})</span>
                            <span className="price">Rs. {(p.price * p.quantity).toFixed(2)}</span>
                            <button type="button" className="icon-btn" onClick={() => removePart(p.id)}>
                                <Trash size={14} color="#ef4444"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- Total --- */}
            <div className="invoice-total">
                <span>Total Amount:</span>
                <span className="amount">Rs. {calculateTotal()}</span>
            </div>

            <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">Create Invoice</button>
            </div>
        </form>
      </Modal>
      
      <InvoiceDetailsModal 
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        invoiceId={selectedInvoiceId}
      />
    </div>
  );
};

export default Invoices;
