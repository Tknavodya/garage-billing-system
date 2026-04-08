import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Trash, Edit } from 'lucide-react';
import Modal from '../../components/common/Modal';
import InvoiceDetailsModal from '../../components/invoices/InvoiceDetailsModal';
import { api } from '../../utils/api';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchActionBar } from '../../components/shared/SearchActionBar';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import './Invoices.css';

const formatMoney = (value) => Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getDefaultDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  return dueDate.toISOString().split('T')[0];
};

const createEmptyInvoice = () => ({
  customer: '',
  vehicle: '',
  date: new Date().toISOString().split('T')[0],
  due_date: getDefaultDueDate(),
  status: 'Pending',
  payment_method: 'Cash',
  tax_rate: '0',
  discount_amount: '0',
  notes: '',
  selected_services: [],
  selected_parts: [],
});

const normalizeInvoiceForForm = (invoice) => ({
  customer: invoice.customer || '',
  vehicle: invoice.vehicle || '',
  date: invoice.date || new Date().toISOString().split('T')[0],
  due_date: invoice.due_date || getDefaultDueDate(),
  status: invoice.status || 'Pending',
  payment_method: invoice.payment_method || 'Cash',
  tax_rate: String(invoice.tax_rate ?? '0'),
  discount_amount: String(invoice.discount_amount ?? '0'),
  notes: invoice.notes || '',
  selected_services: (invoice.services || []).map((service) => ({
    id: service.service,
    name: service.service_name,
    price: service.price,
  })),
  selected_parts: (invoice.parts || []).map((part) => ({
    id: part.part,
    name: part.part_name,
    price: part.price,
    quantity: part.quantity,
  })),
});

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]); // Available Services
  const [parts, setParts] = useState([]);       // Available Parts
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingInvoiceNumber, setEditingInvoiceNumber] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Invoice Details State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeView, setActiveView] = useState('invoices');

  // Form State
  const [newInvoice, setNewInvoice] = useState(createEmptyInvoice());
  const isEditing = Boolean(editingInvoiceId);

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

  const resetFormValues = () => {
    setNewInvoice(createEmptyInvoice());
    setTempService('');
    setTempPart('');
    setTempQty(1);
  };

  const resetModalState = () => {
    resetFormValues();
    setEditingInvoiceId(null);
    setEditingInvoiceNumber('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormLoading(false);
    resetModalState();
  };

  const openCreateModal = () => {
    resetModalState();
    setIsModalOpen(true);
  };

  const openEditModal = async (invoiceId) => {
    resetFormValues();
    setFormLoading(true);
    setIsModalOpen(true);
    setEditingInvoiceId(invoiceId);
    try {
      const invoice = await api.get(`/invoices/${invoiceId}/`);
      setEditingInvoiceNumber(invoice.invoice_number || '');
      setNewInvoice(normalizeInvoiceForForm(invoice));
    } catch (err) {
      console.error('Failed to load invoice', err);
      alert('Failed to load invoice for editing.');
      setIsModalOpen(false);
      setEditingInvoiceId(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newInvoice,
        tax_rate: Number(newInvoice.tax_rate || 0),
        discount_amount: Number(newInvoice.discount_amount || 0),
      };

      if (isEditing) {
        await api.put(`/invoices/${editingInvoiceId}/`, payload);
      } else {
        await api.post('/invoices/', payload);
      }

      closeModal();
      fetchData();
      // Refresh parts to show updated stock
      const partData = await api.get('/parts/');
      setParts(partData);
    } catch (err) {
        alert(`${isEditing ? 'Failed to update' : 'Failed to create'} invoice: ${err.message}`);
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

    const servicesTotal = newInvoice.selected_services.reduce((acc, s) => acc + Number(s.price || 0), 0);
    const partsTotal = newInvoice.selected_parts.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.quantity || 0)), 0);
    const subtotal = servicesTotal + partsTotal;
    const taxAmount = subtotal * (Number(newInvoice.tax_rate || 0) / 100);
    const discountAmount = Number(newInvoice.discount_amount || 0);
    const grandTotal = Math.max(subtotal + taxAmount - discountAmount, 0);
    const serviceCount = newInvoice.selected_services.length;
    const partCount = newInvoice.selected_parts.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  // Filter vehicles based on selected customer
  const customerVehicles = newInvoice.customer 
    ? vehicles.filter(v => v.customer === parseInt(newInvoice.customer))
    : [];

  const revenueTotal = invoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const paidTotal = invoices.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const outstandingTotal = invoices.filter((invoice) => invoice.status !== 'Paid').reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const paymentRows = invoices.filter((invoice) => invoice.status === 'Paid');

  const balanceRows = Object.values(
    invoices.reduce((accumulator, invoice) => {
      if (invoice.status === 'Paid') {
        return accumulator;
      }

      const key = invoice.customer_name || 'Unknown Customer';
      if (!accumulator[key]) {
        accumulator[key] = { customer: key, amount: 0, invoices: 0 };
      }

      accumulator[key].amount += Number(invoice.amount || 0);
      accumulator[key].invoices += 1;
      return accumulator;
    }, {})
  ).sort((left, right) => right.amount - left.amount);

  return (
    <div className="invoices-page page-shell">
      <PageHeader
        eyebrow="Financial hub"
        title="Invoices"
        description="A polished billing workspace for invoice tracking, payments, and customer balances."
      />

      <div className="financial-kpis">
        <div className="metric-card">
          <span>Revenue</span>
          <strong>Rs. {revenueTotal.toLocaleString()}</strong>
          <p>All invoice value generated.</p>
        </div>
        <div className="metric-card">
          <span>Collected</span>
          <strong>Rs. {paidTotal.toLocaleString()}</strong>
          <p>Invoices marked paid.</p>
        </div>
        <div className="metric-card">
          <span>Collectables</span>
          <strong>Rs. {outstandingTotal.toLocaleString()}</strong>
          <p>Open amounts still due.</p>
        </div>
        <div className="metric-card">
          <span>Invoices</span>
          <strong>{invoices.length}</strong>
          <p>Issued billing documents.</p>
        </div>
      </div>

      <div className="financial-tabs">
        {[
          { id: 'invoices', label: `Invoices (${invoices.length})` },
          { id: 'payments', label: `Payments (${paymentRows.length})` },
          { id: 'balances', label: `Customer balances (${balanceRows.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeView === tab.id ? 'active' : ''}`}
            onClick={() => setActiveView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <SearchActionBar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search invoices..."
        actions={(
          <button className="primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Invoice
          </button>
        )}
      />

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {activeView === 'invoices' && (
        <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Due</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>
                  <span className="status-pill neutral">{invoice.invoice_number}</span>
                </td>
                <td>{invoice.customer_name}</td>
                <td>{invoice.vehicle_display}</td>
                <td>{invoice.date}</td>
                <td>{invoice.due_date || '—'}</td>
                <td>{invoice.payment_method || 'Cash'}</td>
                <td style={{fontWeight: 700}}>Rs. {formatMoney(invoice.amount)}</td>
                <td>
                  <div className="status-cell">
                    <StatusBadge status={invoice.status} />
                    <select 
                      className="status-select"
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
                  </div>
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
                      className="icon-btn edit"
                      onClick={() => openEditModal(invoice.id)}
                      title="Edit Invoice"
                    >
                      <Edit size={18} />
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
          </tbody>
        </table>
      </div>
      )}

      {activeView === 'payments' && (
        <div className="customers-table">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentRows.map((invoice) => (
                <tr key={invoice.id}>
                  <td><span className="status-pill neutral">{invoice.invoice_number}</span></td>
                  <td>{invoice.customer_name}</td>
                  <td>{invoice.date}</td>
                  <td>{invoice.due_date || '—'}</td>
                  <td>{invoice.payment_method || 'Cash'}</td>
                  <td>Rs. {formatMoney(invoice.amount)}</td>
                  <td><StatusBadge status={invoice.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && paymentRows.length === 0 && (
            <EmptyState
              title="No payments recorded"
              description="Paid invoices will appear here automatically when statuses are updated."
            />
          )}
        </div>
      )}

      {activeView === 'balances' && (
        <div className="customers-table">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Open invoices</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {balanceRows.map((row) => (
                <tr key={row.customer}>
                  <td>{row.customer}</td>
                  <td>{row.invoices}</td>
                  <td>Rs. {row.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && balanceRows.length === 0 && (
            <EmptyState
              title="No balances due"
              description="All invoices are paid. Customer balances will appear when collectables exist."
            />
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Edit Invoice' : 'Create New Invoice'} className="billing-modal" maxWidth="1120px">
        {formLoading ? (
          <div className="loading">Loading invoice...</div>
        ) : (
        <form onSubmit={handleSubmit} className="customer-form invoice-form-shell">
          <div className="invoice-form-layout">
            <div className="invoice-form-main">
              <h3 className="section-title">1. Invoice essentials</h3>
              <div className="form-grid invoice-essentials-grid">
                <div className="form-group">
                  <label>Invoice #</label>
                  <input
                    disabled
                    value={isEditing ? editingInvoiceNumber : ''}
                    placeholder={isEditing ? 'Invoice number' : 'Auto-generated'}
                    className="form-control invoice-readonly"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    required
                    value={newInvoice.date}
                    onChange={(event) => setNewInvoice({ ...newInvoice, date: event.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Due date</label>
                  <input
                    type="date"
                    required
                    value={newInvoice.due_date}
                    onChange={(event) => setNewInvoice({ ...newInvoice, due_date: event.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newInvoice.status}
                    onChange={(event) => setNewInvoice({ ...newInvoice, status: event.target.value })}
                    className="form-control"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment method</label>
                  <select
                    value={newInvoice.payment_method}
                    onChange={(event) => setNewInvoice({ ...newInvoice, payment_method: event.target.value })}
                    className="form-control"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tax rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newInvoice.tax_rate}
                    onChange={(event) => setNewInvoice({ ...newInvoice, tax_rate: event.target.value })}
                    className="form-control"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Discount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newInvoice.discount_amount}
                    onChange={(event) => setNewInvoice({ ...newInvoice, discount_amount: event.target.value })}
                    className="form-control"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <h3 className="section-title">2. Customer & vehicle</h3>
              <div className="form-grid two-column-grid">
                <div className="form-group">
                  <label>Customer</label>
                  <select
                    required
                    value={newInvoice.customer}
                    onChange={(event) => setNewInvoice({ ...newInvoice, customer: event.target.value, vehicle: '' })}
                    className="form-control"
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Vehicle</label>
                  <select
                    value={newInvoice.vehicle}
                    onChange={(event) => setNewInvoice({ ...newInvoice, vehicle: event.target.value })}
                    className="form-control"
                    disabled={!newInvoice.customer}
                  >
                    <option value="">-- Select Vehicle --</option>
                    {customerVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.plate_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 className="section-title">3. Services</h3>
              <div className="add-item-row">
                <select
                  className="form-control"
                  value={tempService}
                  onChange={(event) => setTempService(event.target.value)}
                >
                  <option value="">-- Choose Service --</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name} (Rs. {service.price})</option>
                  ))}
                </select>
                <button type="button" className="secondary-btn" onClick={addService}>Add</button>
              </div>

              {newInvoice.selected_services.length > 0 && (
                <div className="item-list">
                  {newInvoice.selected_services.map((service) => (
                    <div key={service.id} className="added-item">
                      <span>{service.name}</span>
                      <span className="price">Rs. {formatMoney(service.price)}</span>
                      <button type="button" className="icon-btn" onClick={() => removeService(service.id)}>
                        <Trash size={14} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="section-title">4. Parts</h3>
              <div className="add-item-row add-item-row-parts">
                <select
                  className="form-control"
                  value={tempPart}
                  onChange={(event) => setTempPart(event.target.value)}
                >
                  <option value="">-- Choose Part --</option>
                  {parts.map((part) => (
                    <option key={part.id} value={part.id}>
                      {part.name} (Stock: {part.stock}) - Rs. {part.price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="form-control qty-input-field"
                  value={tempQty}
                  onChange={(event) => setTempQty(event.target.value)}
                />
                <button type="button" className="secondary-btn" onClick={addPart}>Add</button>
              </div>

              {newInvoice.selected_parts.length > 0 && (
                <div className="item-list">
                  {newInvoice.selected_parts.map((part) => (
                    <div key={part.id} className="added-item">
                      <span>{part.name} (x{part.quantity})</span>
                      <span className="price">Rs. {formatMoney(Number(part.price || 0) * Number(part.quantity || 0))}</span>
                      <button type="button" className="icon-btn" onClick={() => removePart(part.id)}>
                        <Trash size={14} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="section-title">5. Notes</h3>
              <div className="form-group">
                <label>Billing notes</label>
                <textarea
                  className="form-control invoice-notes"
                  rows="4"
                  placeholder="Add payment instructions, warranty notes, or follow-up reminders..."
                  value={newInvoice.notes}
                  onChange={(event) => setNewInvoice({ ...newInvoice, notes: event.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">{isEditing ? 'Update Invoice' : 'Create Invoice'}</button>
              </div>
            </div>

            <aside className="invoice-summary-sidebar">
              <div className="summary-card invoice-summary-card">
                <span>Invoice summary</span>
                <strong>Live totals</strong>
                <p>{serviceCount} services, {partCount} parts</p>
              </div>

              <div className="summary-card invoice-summary-card invoice-summary-breakdown">
                <div>
                  <span>Subtotal</span>
                  <strong>Rs. {formatMoney(subtotal)}</strong>
                </div>
                <div>
                  <span>Tax</span>
                  <strong>Rs. {formatMoney(taxAmount)}</strong>
                </div>
                <div>
                  <span>Discount</span>
                  <strong>Rs. {formatMoney(discountAmount)}</strong>
                </div>
                <div className="invoice-summary-total">
                  <span>Total</span>
                  <strong>Rs. {formatMoney(grandTotal)}</strong>
                </div>
              </div>

              <div className="summary-card invoice-summary-card">
                <span>Workflow</span>
                <strong>{newInvoice.status}</strong>
                <p>Due on {newInvoice.due_date || '—'} via {newInvoice.payment_method || 'Cash'}.</p>
              </div>
            </aside>
          </div>
        </form>
        )}
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
