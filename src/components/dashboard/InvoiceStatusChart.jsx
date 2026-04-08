import React, { useEffect, useMemo, useState } from 'react';
import './InvoiceStatusChart.css';

const DEFAULT_DATA = [
  { name: 'Paid', value: 8 },
  { name: 'Pending', value: 3 },
  { name: 'Overdue', value: 2 },
];

const STATUS_COLORS = {
  Paid: '#2f8f68',
  Pending: '#d18a1f',
  Overdue: '#c95a5a',
};

const normalizeStatusData = (data) => {
  const source = Array.isArray(data) ? data : [];
  const statuses = ['Paid', 'Pending', 'Overdue'];

  const normalized = statuses.map((status) => {
    const match = source.find((item) => String(item?.name || '').toLowerCase() === status.toLowerCase());
    return {
      name: status,
      value: Number(match?.value || 0),
    };
  });

  return normalized.some((item) => item.value > 0) ? normalized : DEFAULT_DATA;
};

const formatValue = (value) => Number(value || 0).toLocaleString('en-US');

const InvoiceStatusChart = ({ data }) => {
  const chartData = useMemo(() => normalizeStatusData(data), [data]);
  const total = chartData.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const [animationProgress, setAnimationProgress] = useState(0);

  const segments = useMemo(() => {
    let cursor = 0;

    return chartData.map((item) => {
      const percentage = total > 0 ? (Number(item.value || 0) / total) * 100 : 0;
      const start = cursor;
      const end = cursor + percentage;
      cursor = end;

      return {
        ...item,
        percentage,
        start,
        end,
      };
    });
  }, [chartData, total]);

  useEffect(() => {
    let frameId = 0;
    const duration = 1400;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - (1 - rawProgress) ** 3;
      setAnimationProgress(easedProgress);

      if (rawProgress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    setAnimationProgress(0);
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [total, chartData]);

  const animatedSegments = segments.map((segment) => ({
    ...segment,
    start: segment.start * animationProgress,
    end: segment.end * animationProgress,
  }));

  const lastEnd = animatedSegments[animatedSegments.length - 1]?.end || 0;

  const gradient = [
    ...animatedSegments.map((segment) => `${STATUS_COLORS[segment.name]} ${segment.start}% ${segment.end}%`),
    `transparent ${lastEnd}% 100%`,
  ].join(', ');

  return (
    <div className="invoice-status-chart-shell">
      <div className="invoice-status-chart-visual" aria-label="Invoice status pie chart">
        <div
          className="invoice-status-chart-ring"
          style={{ backgroundImage: `conic-gradient(from -90deg, ${gradient})` }}
        />
        <div className="invoice-status-chart-hole" />
        <div className="invoice-status-chart-center">
          <span>Total invoices</span>
          <strong>{formatValue(total)}</strong>
          <p>Paid, pending, overdue</p>
        </div>
      </div>

      <div className="invoice-status-legend">
        {segments.map((segment, index) => (
          <div
            key={segment.name}
            className="invoice-status-legend-item"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="invoice-status-legend-header">
              <span className="invoice-status-swatch" style={{ backgroundColor: STATUS_COLORS[segment.name] }} />
              <span className="invoice-status-legend-name">{segment.name}</span>
            </div>
            <div className="invoice-status-legend-meta">
              <strong className="invoice-status-legend-value">{formatValue(segment.value)}</strong>
              <span className="invoice-status-legend-percentage">{Math.round(segment.percentage)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceStatusChart;