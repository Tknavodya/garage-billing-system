import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import { FileText, Calendar, Wrench } from 'lucide-react';
import { api } from '../../utils/api';
import '../common/SharedHistoryModal.css';

const VehicleHistoryModal = ({ vehicleId, isOpen, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get(`/vehicles/${vehicleId}/history/`, { auth: false });
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch vehicle history", err);
        } finally {
            setLoading(false);
        }
    }, [vehicleId]);

    useEffect(() => {
        if (isOpen && vehicleId) {
            fetchHistory();
        }
    }, [isOpen, vehicleId, fetchHistory]);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Vehicle Service History"
            maxWidth="800px"
        >
            <div className="history-content">
                {loading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading history...</div>
                ) : (
                    <div className="invoices-list">
                        {history.length === 0 ? (
                            <p className="empty-state">No service history found for this vehicle.</p>
                        ) : (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Date</th>
                                        <th>Services Performed</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(inv => (
                                        <tr key={inv.id}>
                                            <td className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-muted-foreground" />
                                                    {inv.invoice_number}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-muted-foreground" />
                                                    {inv.date}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="services-list">
                                                    {inv.services.length > 0 ? (
                                                        inv.services.map((svc, idx) => (
                                                            <span key={idx} className="service-tag">
                                                                <Wrench size={12} /> {svc}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">No services listed</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="font-medium">Rs. {inv.amount}</td>
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
            </div>
        </Modal>
    );
};

export default VehicleHistoryModal;
