import React from 'react';

const statusMap = {
  paid: 'success',
  completed: 'success',
  active: 'success',
  pending: 'neutral',
  draft: 'neutral',
  inactive: 'neutral',
  overdue: 'danger',
  cancelled: 'danger',
  banned: 'danger',
};

const normalizeStatus = (value) => String(value || '').toLowerCase();

export const StatusBadge = ({ status, className }) => {
  const normalized = normalizeStatus(status);
  const variant = statusMap[normalized] || 'neutral';

  return (
    <span className={`status-pill ${variant} ${className || ''}`.trim()}>
      {status}
    </span>
  );
};
