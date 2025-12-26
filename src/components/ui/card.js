import React from 'react';

export const Card = ({ className, children }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className || ''}`} style={{
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  }}>
    {children}
  </div>
);

export const CardContent = ({ className, children }) => (
  <div className={`p-6 ${className || ''}`} style={{ padding: '1.5rem' }}>
    {children}
  </div>
);

export const CardHeader = ({ className, children }) => (
  <div className={`p-6 pb-0 ${className || ''}`} style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
    {children}
  </div>
);

export const CardTitle = ({ className, children }) => (
  <h3 className={className} style={{ fontSize: '1.5rem', fontWeight: '600', lineHeight: 'none', margin: 0, color: '#0f172a' }}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children }) => (
  <p className={className} style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.375rem' }}>
    {children}
  </p>
);

