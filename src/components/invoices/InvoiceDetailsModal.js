import React, { useEffect, useState, useCallback } from 'react';
import { X, Download } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import './InvoiceDetailsModal.css';

const formatMoney = (value) => Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

// Assuming we want reuse the existing Modal or create a specific one. 
// Since we have 'components/common/Modal', let's use it but customized.
// Actually, the existing Modal might be simple. Let's make this a dedicated component that uses the Modal.

const InvoiceDetailsModal = ({ isOpen, onClose, invoiceId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

    const fetchInvoiceDetails = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('garage_token');
            const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setInvoice(await res.json());
            }
        } catch (err) {
            console.error("Failed to fetch invoice details", err);
        } finally {
            setLoading(false);
        }
    }, [invoiceId]);

    useEffect(() => {
        if (isOpen && invoiceId) {
            fetchInvoiceDetails();
        }
    }, [isOpen, invoiceId, fetchInvoiceDetails]);

  const handleDownloadPDF = async () => {
      try {
          const token = localStorage.getItem('garage_token');
          const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/download_pdf/`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          if (res.ok) {
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Invoice_${invoice.invoice_number}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
          } else {
              alert("Failed to download PDF");
          }
      } catch (err) {
          console.error("Error downloading PDF", err);
          alert("Error downloading PDF");
      }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="invoice-modal-content" onClick={e => e.stopPropagation()}>
        <div className="invoice-modal-header">
            <h2>Invoice Details</h2>
            <button className="close-btn" onClick={onClose}><X size={20}/></button>
        </div>
        
        <div className="invoice-modal-body">
            {loading ? (
                <div className="loading-state">Loading...</div>
            ) : invoice ? (
                <>
                    <div className="invoice-info-header">
                        <div>
                            <h3>{invoice.invoice_number}</h3>
                            <span className={`status-badge status-${invoice.status.toLowerCase()}`}>
                                {invoice.status}
                            </span>
                        </div>
                        <div className="invoice-date">
                            <label>Date:</label> {invoice.date}
                            <label>Due:</label> {invoice.due_date || '—'}
                        </div>
                    </div>

                    <div className="customer-vehicle-section invoice-meta-grid">
                        <div className="info-block">
                            <label>Customer</label>
                            <p>{invoice.customer_name}</p>
                        </div>
                        <div className="info-block">
                            <label>Vehicle</label>
                            <p>{invoice.vehicle_display || 'N/A'}</p>
                        </div>
                        <div className="info-block">
                            <label>Payment method</label>
                            <p>{invoice.payment_method || 'Cash'}</p>
                        </div>
                        <div className="info-block">
                            <label>Subtotal</label>
                            <p>Rs. {formatMoney(invoice.subtotal ?? invoice.amount)}</p>
                        </div>
                    </div>

                    <div className="items-section">
                        <h4>Services</h4>
                        {invoice.services && invoice.services.length > 0 ? (
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th className="text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.services.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.service_name}</td>
                                            <td className="text-right">Rs. {s.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="no-items">No services</p>}
                    </div>

                    <div className="items-section">
                        <h4>Parts</h4>
                        {invoice.parts && invoice.parts.length > 0 ? (
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Part</th>
                                        <th>Qty</th>
                                        <th className="text-right">Price</th>
                                        <th className="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.parts.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="part-info">
                                                    <span>{p.part_name}</span>
                                                    <span className="part-num">{p.part_number}</span>
                                                </div>
                                            </td>
                                            <td>{p.quantity}</td>
                                            <td className="text-right">Rs. {p.price}</td>
                                            <td className="text-right">Rs. {(p.price * p.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="no-items">No parts</p>}
                    </div>

                    <div className="invoice-footer">
                        <div className="invoice-totals-grid">
                            <div className="total-line">
                                <span>Subtotal</span>
                                <strong>Rs. {formatMoney(invoice.subtotal ?? invoice.amount)}</strong>
                            </div>
                            <div className="total-line">
                                <span>Tax</span>
                                <strong>Rs. {formatMoney(invoice.tax_amount)}</strong>
                            </div>
                            <div className="total-line">
                                <span>Discount</span>
                                <strong>Rs. {formatMoney(invoice.discount_amount)}</strong>
                            </div>
                            <div className="total-line total-line-strong">
                                <span>Total Amount</span>
                                <strong>Rs. {formatMoney(invoice.amount)}</strong>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="invoice-notes-block">
                                <label>Notes</label>
                                <p>{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="invoice-actions">

                        <button className="secondary-btn" onClick={handleDownloadPDF}>
                            <Download size={16} /> Download Invoice
                        </button>
                    </div>
                </>
            ) : (
                <p className="error-text">Failed to load invoice details.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
