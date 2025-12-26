import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import './CreateInvoice.css'; // Reuse invoice styles

const InvoiceDetail = () => {
  const { id } = useParams();

  // Mock Invoice Data (In a real app, fetch by ID)
  const invoice = {
    id: id || 'INV-001',
    customer: 'John Doe',
    vehicle: 'Toyota Camry (XYZ-123)',
    date: '2025-10-24',
    dueDate: '2025-10-31',
    status: 'Paid',
    items: [
      { description: 'Full Service', quantity: 1, unitPrice: 150.00, total: 150.00 },
      { description: 'Oil Filter', quantity: 1, unitPrice: 12.00, total: 12.00 },
      { description: 'Synthetic Oil (Quart)', quantity: 5, unitPrice: 8.00, total: 40.00 },
    ],
    subtotal: 202.00,
    tax: 20.20,
    total: 222.20
  };

  return (
    <div className="create-invoice-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/invoices" style={{ color: '#64748b' }}>
            <ArrowLeft size={24} />
          </Link>
          <h1>Invoice {invoice.id}</h1>
        </div>
        <button className="secondary-btn" onClick={() => window.print()}>
          <Printer size={18} />
          Print
        </button>
      </div>

      <div className="invoice-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h3>Billed To:</h3>
            <p>{invoice.customer}</p>
            <p>{invoice.vehicle}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Date:</strong> {invoice.date}</p>
            <p><strong>Due Date:</strong> {invoice.dueDate}</p>
            <div className={`badge ${invoice.status === 'Paid' ? 'bg-green-100' : 'bg-orange-100'}`} 
                 style={{ display: 'inline-block', marginTop: '8px' }}>
              {invoice.status}
            </div>
          </div>
        </div>

        <div className="items-table">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unitPrice.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right">Subtotal:</td>
                <td className="text-right">${invoice.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-right">Tax (10%):</td>
                <td className="text-right">${invoice.tax.toFixed(2)}</td>
              </tr>
              <tr className="total-row">
                <td colSpan="3" className="text-right">Total:</td>
                <td className="text-right" style={{ color: '#0ea5e9' }}>${invoice.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
