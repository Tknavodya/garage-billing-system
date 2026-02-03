import React, { useState, useEffect } from 'react';
import { DollarSign, FileClock, Car, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import StatsCard from '../components/dashboard/StatsCard';
import RecentInvoices from '../components/dashboard/RecentInvoices';
import './Dashboard.css';

import InvoiceDetailsModal from '../components/invoices/InvoiceDetailsModal';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
      revenue_today: 0,
      pending_count: 0,
      overdue_count: 0,
      vehicles_serviced: 0,
      outstanding_amount: 0,
      recent_invoices: []
  });
  
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
      const fetchDashboardData = async () => {
          try {
              const data = await api.get('/dashboard/');
              setData(data);
          } catch (error) {
              console.error("Failed to fetch dashboard data", error);
          } finally {
              setLoading(false);
          }
      };

      fetchDashboardData();
  }, []);

  const handleViewInvoice = (id) => {
      setSelectedInvoiceId(id);
      setIsDetailsOpen(true);
  };

  const closeDetails = () => {
      setIsDetailsOpen(false);
      setSelectedInvoiceId(null);
  };

  const stats = [
    {
      title: "Today's Revenue",
      value: `$${data.revenue_today.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      subtext: "vs yesterday" // You could implement trend logic if needed
    },
    {
      title: "Pending Invoices",
      value: data.pending_count,
      icon: FileClock,
      color: "orange",
      subtext: `${data.overdue_count} overdue`
    },
    {
      title: "Vehicles Serviced",
      value: data.vehicles_serviced,
      icon: Car,
      color: "blue",
      subtext: "this week"
    },
    {
      title: "Outstanding Amount",
      value: `$${data.outstanding_amount.toLocaleString()}`,
      icon: AlertCircle,
      color: "purple",
      subtext: "total unpaid"
    }
  ];

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <RecentInvoices 
        invoices={data.recent_invoices} 
        onView={handleViewInvoice}
      />

      <InvoiceDetailsModal 
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        invoiceId={selectedInvoiceId}
      />
    </div>
  );
};

export default Dashboard;
