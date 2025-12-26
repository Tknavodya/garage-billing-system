import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className }) => {
  const baseStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  };

  const variants = {
    primary: { backgroundColor: '#0ea5e9', color: 'white' },
    outline: { backgroundColor: 'transparent', border: '1px solid #e2e8f0', color: '#0f172a' },
    ghost: { backgroundColor: 'transparent', color: '#0f172a' },
  };

  const style = { ...baseStyle, ...variants[variant] };

  return (
    <button onClick={onClick} style={style} className={className}>
      {children}
    </button>
  );
};
