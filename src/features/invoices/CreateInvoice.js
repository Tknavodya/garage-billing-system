import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Trash2, Plus, Save } from 'lucide-react';
import './CreateInvoice.css';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { customers, vehicles, services, parts } = useData();
  
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [items, setItems] = useState([]);
  
  // Derived state
  const customerVehicles = vehicles.filter(v => v.customerId === parseInt(selectedCustomer));

  const addItem = (type, item) => {
    setItems([...items, { ...item, type, quantity: 1, total: item.price }]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateQuantity = (index, qty) => {
    const newItems = [...items];
    newItems[index].quantity = parseInt(qty);
    newItems[index].total = newItems[index].price * parseInt(qty);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSave = () => {
    // Logic to save invoice would go here
    alert('Invoice Saved!');
    navigate('/invoices');
  };

  return (
    <div className="create-invoice-page">
      <div className="page-header">
        <h1>Create New Invoice</h1>
      </div>

      <div className="invoice-container">
        {/* Step 1: Customer & Vehicle */}
        <section className="invoice-section">
          <h2>1. Customer & Vehicle</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Select Customer</label>
              <select 
                value={selectedCustomer} 
                onChange={e => {
                  setSelectedCustomer(e.target.value);
                  setSelectedVehicle('');
                }}
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Select Vehicle</label>
              <select 
                value={selectedVehicle} 
                onChange={e => setSelectedVehicle(e.target.value)}
                disabled={!selectedCustomer}
              >
                <option value="">-- Select Vehicle --</option>
                {customerVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} ({v.plate})</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Step 2: Add Services & Parts */}
        {selectedVehicle && (
          <section className="invoice-section">
            <h2>2. Services & Parts</h2>
            
            <div className="catalog-grid">
              <div className="catalog-col">
                <h3>Services</h3>
                <div className="catalog-list">
                  {services.map(s => (
                    <button key={s.id} onClick={() => addItem('service', s)} className="catalog-item">
                      <span>{s.name}</span>
                      <span>${s.price}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="catalog-col">
                <h3>Spare Parts</h3>
                <div className="catalog-list">
                  {parts.map(p => (
                    <button key={p.id} onClick={() => addItem('part', p)} className="catalog-item">
                      <span>{p.name} <small>({p.stock} in stock)</small></span>
                      <span>${p.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Review Items */}
        {items.length > 0 && (
          <section className="invoice-section">
            <h2>3. Invoice Items</h2>
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td><span className="badge">{item.type}</span></td>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(index, e.target.value)}
                          className="qty-input"
                        />
                      </td>
                      <td>${item.total.toFixed(2)}</td>
                      <td>
                        <button onClick={() => removeItem(index)} className="icon-btn text-red">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="4" className="text-right">Grand Total:</td>
                    <td className="amount">${calculateTotal().toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="actions-footer">
              <button className="primary-btn" onClick={handleSave}>
                <Save size={18} />
                Save Invoice
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CreateInvoice;
