import React from 'react';
import { Eye } from 'lucide-react';
import './RecentInvoices.css';

const RecentInvoices = ({ invoices, onView }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'status-paid';
      case 'Pending': return 'status-pending';
      case 'Overdue': return 'status-overdue';
      default: return 'status-default';
    }
  };

  return (
    <div className="recent-invoices-card">
      <div className="card-header">
        <h2>Recent Invoices</h2>
        <button className="view-all-btn">View All</button>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoice_number}</td>
                <td>
                  <div className="customer-cell">
                    <span className="customer-name">{invoice.customer_name}</span>
                    <span className="customer-vehicle">{invoice.vehicle_display}</span>
                  </div>
                </td>
                <td>{invoice.date}</td>
                <td>Rs. {parseFloat(invoice.amount).toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn" onClick={() => onView(invoice.id)}>
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInvoices;
