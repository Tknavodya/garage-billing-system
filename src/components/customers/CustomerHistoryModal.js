import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import { FileText, Car } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import '../common/SharedHistoryModal.css';

const CustomerHistoryModal = ({ customerId, isOpen, onClose }) => {
    const [history, setHistory] = useState({ invoices: [], vehicles: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('invoices');

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('garage_token');
            const res = await fetch(`${API_BASE_URL}/customers/${customerId}/history/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to fetch customer history", err);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        if (isOpen && customerId) {
            fetchHistory();
        }
    }, [isOpen, customerId, fetchHistory]);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Customer History"
            maxWidth="800px"
        >
            <div className="history-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoices')}
                >
                    <FileText size={18} /> Invoices ({history.invoices.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vehicles')}
                >
                    <Car size={18} /> Vehicles ({history.vehicles.length})
                </button>
            </div>

            <div className="history-content">
                {loading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading history...</div>
                ) : (
                    <>
                        {activeTab === 'invoices' && (
                            <div className="invoices-list">
                                {history.invoices.length === 0 ? (
                                    <p className="empty-state">No invoices found for this customer.</p>
                                ) : (
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Invoice #</th>
                                                <th>Date</th>
                                                <th>Vehicle</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.invoices.map(inv => (
                                                <tr key={inv.id}>
                                                    <td className="font-medium">{inv.invoice_number}</td>
                                                    <td>{inv.date}</td>
                                                    <td>{inv.vehicle_str}</td>
                                                    <td>Rs. {inv.amount}</td>
                                                    <td>
                                                        <span className={`status-badge ${inv.status.toLowerCase()}`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'vehicles' && (
                            <div className="vehicles-grid">
                                {history.vehicles.length === 0 ? (
                                    <p className="empty-state">No vehicles associated with this customer.</p>
                                ) : (
                                    history.vehicles.map((v, idx) => (
                                        <div key={idx} className="vehicle-card-mini">
                                            <div className="vehicle-icon">
                                                <Car size={24} />
                                            </div>
                                            <div className="vehicle-info">
                                                <h4>{v.vehicle__make} {v.vehicle__model}</h4>
                                                <p>{v.vehicle__plate_number}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default CustomerHistoryModal;
