import React from 'react';

export const EmptyState = ({ title, description, action }) => {
  return (
    <div className="empty-state-card">
      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem' }}>{title}</h3>
      {description && <p className="muted-text" style={{ margin: 0 }}>{description}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
};
