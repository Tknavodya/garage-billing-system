import React, { useState, useEffect } from 'react';
import {
  Banknote,
  FileClock,
  Car,
  AlertCircle,
  ShieldCheck,
  Clock3,
  ArrowUpRight,
  TriangleAlert,
} from 'lucide-react';
import { api } from '../../utils/api';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { StatusBadge } from '../../components/shared/StatusBadge';
import RevenueLineChart from '../../components/dashboard/RevenueLineChart';
import InvoiceStatusChart from '../../components/dashboard/InvoiceStatusChart';
import './Dashboard.css';

import InvoiceDetailsModal from '../../components/invoices/InvoiceDetailsModal';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatDateLabel = (dateValue) => {
  const date = dateValue instanceof Date ? dateValue : new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
};

const getActivityTone = (status) => {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'Overdue':
      return 'danger';
    default:
      return 'neutral';
  }
};

const getActivityIcon = (status) => {
  switch (status) {
    case 'Paid':
      return ShieldCheck;
    case 'Overdue':
      return TriangleAlert;
    default:
      return Clock3;
  }
};

const buildWeeklyRevenueData = (invoices) => {
  const totalsByDate = invoices.reduce((accumulator, invoice) => {
    const key = invoice.date;
    accumulator[key] = (accumulator[key] || 0) + Number(invoice.amount || 0);
    return accumulator;
  }, {});

  const weeklyData = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + offset);
    const key = date.toISOString().split('T')[0];
    weeklyData.push({
      day: formatDateLabel(date),
      revenue: totalsByDate[key] || 0,
    });
  }

  if (weeklyData.some((entry) => entry.revenue > 0)) {
    return weeklyData;
  }

  return [
    { day: 'Sun', revenue: 2000 },
    { day: 'Mon', revenue: 5000 },
    { day: 'Tue', revenue: 3000 },
    { day: 'Wed', revenue: 7000 },
    { day: 'Thu', revenue: 4000 },
    { day: 'Fri', revenue: 9000 },
    { day: 'Sat', revenue: 10500 },
  ];
};

const buildInvoiceStatusData = (invoices) => {
  const statusCounts = invoices.reduce((accumulator, invoice) => {
    const status = String(invoice.status || '').toLowerCase();
    if (status === 'paid') {
      accumulator.Paid += 1;
    } else if (status === 'pending') {
      accumulator.Pending += 1;
    } else if (status === 'overdue') {
      accumulator.Overdue += 1;
    }
    return accumulator;
  }, {
    Paid: 0,
    Pending: 0,
    Overdue: 0,
  });

  const chartData = [
    { name: 'Paid', value: statusCounts.Paid },
    { name: 'Pending', value: statusCounts.Pending },
    { name: 'Overdue', value: statusCounts.Overdue },
  ];

  return chartData.some((item) => item.value > 0)
    ? chartData
    : [
        { name: 'Paid', value: 8 },
        { name: 'Pending', value: 3 },
        { name: 'Overdue', value: 1 },
      ];
};

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

  const recentInvoices = Array.isArray(data.recent_invoices) ? data.recent_invoices : [];

  const kpiCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(data.revenue_today),
      icon: Banknote,
      tone: 'blue',
      detail: `${recentInvoices.length} recent invoices`
    },
    {
      title: "Pending Invoices",
      value: data.pending_count,
      icon: FileClock,
      tone: 'amber',
      detail: `${data.overdue_count} overdue`
    },
    {
      title: "Vehicles Serviced",
      value: data.vehicles_serviced,
      icon: Car,
      tone: 'green',
      detail: 'Completed this week'
    },
    {
      title: "Outstanding Amount",
      value: formatCurrency(data.outstanding_amount),
      icon: AlertCircle,
      tone: 'red',
      detail: 'Open balances'
    }
  ];

  const weeklyRevenueData = buildWeeklyRevenueData(recentInvoices);
  const weeklyRevenueTotal = weeklyRevenueData.reduce((sum, entry) => sum + Number(entry.revenue || 0), 0);
  const invoiceStatusData = buildInvoiceStatusData(recentInvoices);

  const totalRevenue = recentInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const paidInvoices = recentInvoices.filter((invoice) => invoice.status === 'Paid');
  const pendingInvoices = recentInvoices.filter((invoice) => invoice.status === 'Pending');
  const overdueInvoices = recentInvoices.filter((invoice) => invoice.status === 'Overdue');
  const invoiceStatusStats = [
    {
      label: 'Paid',
      value: paidInvoices.length,
      tone: 'summary-blue',
      note: 'Collected invoices',
    },
    {
      label: 'Pending',
      value: pendingInvoices.length,
      tone: 'summary-amber',
      note: 'Waiting on payment',
    },
    {
      label: 'Overdue',
      value: overdueInvoices.length,
      tone: 'summary-red',
      note: 'Needs follow-up',
    },
  ];
  const averageInvoice = recentInvoices.length ? totalRevenue / recentInvoices.length : 0;
  const averageDailyRevenue = weeklyRevenueData.length ? Math.round(weeklyRevenueTotal / weeklyRevenueData.length) : 0;
  const chartPeakPoint = weeklyRevenueData.reduce((bestPoint, currentPoint) => (
    currentPoint.revenue >= bestPoint.revenue ? currentPoint : bestPoint
  ), weeklyRevenueData[0] || { day: '', revenue: 0 });
  const latestTrendValue = weeklyRevenueData[weeklyRevenueData.length - 1]?.revenue || 0;
  const previousTrendValue = weeklyRevenueData[weeklyRevenueData.length - 2]?.revenue || 0;
  const trendDelta = latestTrendValue - previousTrendValue;
  const trendSummary = trendDelta === 0
    ? 'Flat'
    : `${trendDelta > 0 ? 'Up' : 'Down'} ${formatCurrency(Math.abs(trendDelta))}`;

  const activityFeed = recentInvoices.slice(0, 5).map((invoice) => ({
    id: invoice.id,
    title: invoice.status === 'Paid' ? 'Payment recorded' : invoice.status === 'Overdue' ? 'Invoice follow-up needed' : 'Invoice awaiting payment',
    description: `${invoice.customer_name} • ${invoice.vehicle_display}`,
    amount: formatCurrency(invoice.amount),
    status: invoice.status,
    date: invoice.date,
    icon: getActivityIcon(invoice.status),
  }));

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="dashboard-container page-shell dashboard-page">
      <PageHeader
        eyebrow="Garage operations platform"
        title="Dashboard"
        description="Monitor revenue, outstanding work, and workshop throughput from one premium control center."
      />

      <div className="dashboard-kpi-grid">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`kpi-card kpi-${card.tone}`}>
              <CardContent className="kpi-card-content">
                <div className="kpi-head">
                  <div className="kpi-icon">
                    <Icon size={20} />
                  </div>
                  <span className="kpi-badge">
                    <ArrowUpRight size={14} />
                    Live
                  </span>
                </div>
                <div className="kpi-body">
                  <span className="kpi-label">{card.title}</span>
                  <strong className="kpi-value">{card.value}</strong>
                  <p className="kpi-detail">{card.detail}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <Card className="insight-card analytics-card">
          <CardHeader>
            <CardTitle>Revenue analytics</CardTitle>
            <CardDescription>Daily invoice values and collection rhythm from your most recent activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="analytics-layout">
              <div className="chart-panel">
                <div className="chart-header">
                  <div>
                    <span className="chart-kicker">Revenue trend</span>
                    <h3>Recent billing velocity</h3>
                  </div>
                  <div className="chart-summary-pill">
                    <span>7-day total</span>
                    <strong>{formatCurrency(weeklyRevenueTotal)}</strong>
                  </div>
                </div>

                <RevenueLineChart data={weeklyRevenueData} />

                <div className="chart-footer">
                  <div className="chart-stat">
                    <span>Peak day</span>
                    <strong>{chartPeakPoint.day}</strong>
                  </div>
                  <div className="chart-stat">
                    <span>Average / day</span>
                    <strong>{formatCurrency(averageDailyRevenue)}</strong>
                  </div>
                  <div className="chart-stat">
                    <span>Momentum</span>
                    <strong>{trendSummary}</strong>
                  </div>
                </div>
              </div>

              <div className="analytics-summary">
                <div className="summary-card summary-blue">
                  <span>Paid invoices</span>
                  <strong>{paidInvoices.length}</strong>
                  <p>Invoices marked as collected.</p>
                </div>
                <div className="summary-card summary-amber">
                  <span>Pending invoices</span>
                  <strong>{pendingInvoices.length}</strong>
                  <p>Items still waiting for payment.</p>
                </div>
                <div className="summary-card summary-red">
                  <span>Overdue invoices</span>
                  <strong>{overdueInvoices.length}</strong>
                  <p>Requires immediate attention.</p>
                </div>
                <div className="summary-card summary-green">
                  <span>Average ticket</span>
                  <strong>{formatCurrency(averageInvoice)}</strong>
                  <p>Mean value of recent invoices.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="insight-card activity-card">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest garage logs and invoice events, ordered by newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="activity-list">
              {activityFeed.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button" className="activity-row" onClick={() => handleViewInvoice(item.id)}>
                    <div className={`activity-marker ${getActivityTone(item.status)}`}>
                      <Icon size={14} />
                    </div>
                    <div className="activity-copy">
                      <div className="activity-title-row">
                        <strong>{item.title}</strong>
                        <span>{item.date}</span>
                      </div>
                      <span>{item.description}</span>
                    </div>
                    <div className="activity-meta">
                      <StatusBadge status={item.status} />
                      <span className="activity-amount">{item.amount}</span>
                    </div>
                  </button>
                );
              })}
              {activityFeed.length === 0 && (
                <div className="empty-state-card activity-empty">
                  <h3 style={{ margin: 0 }}>No recent activity</h3>
                  <p className="muted-text">New invoices and payment events will appear here automatically.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="insight-card invoice-status-card">
        <CardHeader>
          <CardTitle>Invoice Status</CardTitle>
          <CardDescription>Paid, pending, and overdue invoice mix from the current dashboard data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="invoice-status-layout">
            <div className="invoice-status-summary-panel">
              <div>
                <span className="chart-kicker">Status overview</span>
                <h3>Invoice mix at a glance</h3>
                <p>Use this breakdown to see how much of the billing flow is collected, waiting, or overdue.</p>
              </div>

              <div className="invoice-status-metrics">
                {invoiceStatusStats.map((stat) => (
                  <div key={stat.label} className={`summary-card ${stat.tone} invoice-status-metric`}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                    <p>{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="invoice-status-chart-panel">
              <InvoiceStatusChart data={invoiceStatusData} />
            </div>
          </div>
        </CardContent>
      </Card>

      <InvoiceDetailsModal 
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        invoiceId={selectedInvoiceId}
      />
    </div>
  );
};

export default Dashboard;
