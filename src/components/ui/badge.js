import React from 'react';

export const Badge = ({ children, variant = 'default', className }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    lineHeight: '1',
  };

  const variants = {
    default: { backgroundColor: '#0f172a', color: 'white' }, // Primary
    secondary: { backgroundColor: '#f1f5f9', color: '#0f172a' }, // Secondary
    outline: { border: '1px solid #e2e8f0', color: '#0f172a' },
  };

  const style = { ...baseStyle, ...variants[variant] };

  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
};
