import React from 'react';
import { Area, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const defaultRevenueData = [
  { day: 'Sun', revenue: 2000 },
  { day: 'Mon', revenue: 5000 },
  { day: 'Tue', revenue: 3000 },
  { day: 'Wed', revenue: 7000 },
  { day: 'Thu', revenue: 4000 },
  { day: 'Fri', revenue: 9000 },
  { day: 'Sat', revenue: 10500 },
];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-US')}`;

const formatAxisTick = (value) => {
  const amount = Number(value || 0);

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`;
  }

  return `${amount}`;
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const revenue = payload[0]?.value || 0;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
        padding: '0.85rem 0.95rem',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          color: 'var(--muted)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: 'var(--text)',
          fontSize: '1rem',
          fontWeight: 700,
          marginTop: '0.25rem',
        }}
      >
        {formatCurrency(revenue)}
      </div>
    </div>
  );
};

const RevenueLineChart = ({ data }) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : defaultRevenueData;

  return (
    <div className="revenue-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 6, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#1d7ae2" />
              <stop offset="100%" stopColor="#114e8a" />
            </linearGradient>
            <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1d7ae2" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1d7ae2" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            dy={12}
            tick={{ fill: 'var(--muted-soft)', fontSize: 12, fontWeight: 600 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={formatAxisTick}
            tick={{ fill: 'var(--muted-soft)', fontSize: 12, fontWeight: 600 }}
          />

          <Tooltip content={<RevenueTooltip />} cursor={{ stroke: 'rgba(17, 78, 138, 0.12)', strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="none"
            fill="url(#revenueFill)"
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="url(#revenueStroke)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ r: 3, fill: '#fff', stroke: '#1d7ae2', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#fff', stroke: '#114e8a', strokeWidth: 2.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueLineChart;