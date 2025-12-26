import { Link } from 'react-router-dom';
import { DollarSign, FileClock, Car, AlertCircle } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentInvoices from '../components/dashboard/RecentInvoices';
import './Dashboard.css';

const Dashboard = () => {
  // Mock Data
  const stats = [
    {
      title: "Today's Revenue",
      value: "$1,250",
      icon: DollarSign,
      color: "green",
      trend: 12,
      subtext: "vs yesterday"
    },
    {
      title: "Pending Invoices",
      value: "5",
      icon: FileClock,
      color: "orange",
      subtext: "2 overdue"
    },
    {
      title: "Vehicles Serviced",
      value: "18",
      icon: Car,
      color: "blue",
      trend: 8,
      subtext: "this week"
    },
    {
      title: "Outstanding Amount",
      value: "$850",
      icon: AlertCircle,
      color: "purple",
      subtext: "total unpaid"
    }
  ];

  const recentInvoices = [
    { id: 'INV-001', customerName: 'John Doe', vehicle: 'Toyota Camry (XYZ-123)', date: '2025-10-24', amount: 350.00, status: 'Paid' },
    { id: 'INV-002', customerName: 'Alice Smith', vehicle: 'Honda Civic (ABC-987)', date: '2025-10-25', amount: 120.50, status: 'Pending' },
    { id: 'INV-003', customerName: 'Robert Brown', vehicle: 'Ford F-150 (TRK-555)', date: '2025-10-25', amount: 550.00, status: 'Pending' },
    { id: 'INV-004', customerName: 'Sarah Wilson', vehicle: 'BMW 320i (LUX-001)', date: '2025-10-23', amount: 890.00, status: 'Overdue' },
    { id: 'INV-005', customerName: 'Mike Johnson', vehicle: 'Mazda 3 (ZOOM-22)', date: '2025-10-26', amount: 45.00, status: 'Paid' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/invoices/new" className="primary-btn" style={{ textDecoration: 'none' }}>New Invoice</Link>
      </div>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <RecentInvoices invoices={recentInvoices} />
    </div>
  );
};

export default Dashboard;
