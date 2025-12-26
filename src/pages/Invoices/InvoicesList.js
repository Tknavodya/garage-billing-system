import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import '../Customers.css'; // Reuse table styles

const InvoicesList = () => {
  // Use mock data locally for now or move to Context later
  const [invoices] = useState([
    { id: 'INV-001', customer: 'John Doe', vehicle: 'Toyota Camry', date: '2025-10-24', amount: 350.00, status: 'Paid' },
    { id: 'INV-002', customer: 'Alice Smith', vehicle: 'Honda Civic', date: '2025-10-25', amount: 120.50, status: 'Pending' },
    { id: 'INV-003', customer: 'Robert Brown', vehicle: 'Ford F-150', date: '2025-10-25', amount: 550.00, status: 'Pending' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'status-paid'; // defined in RecentInvoices.css, might need to copy styles
      case 'Pending': return 'status-pending';
      case 'Overdue': return 'status-overdue';
      default: return '';
    }
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Invoices</h1>
        <Link to="/invoices/new" className="primary-btn" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          New Invoice
        </Link>
      </div>

      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search invoices..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.customer}</td>
                <td>{inv.vehicle}</td>
                <td>{inv.date}</td>
                <td>${inv.amount.toFixed(2)}</td>
                <td>
                  <span className={`badge ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                    inv.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <Link to={`/invoices/${inv.id}`} className="text-btn" style={{ textDecoration: 'none' }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesList;
