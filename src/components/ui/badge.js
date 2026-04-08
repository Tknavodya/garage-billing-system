import React from 'react';

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'status-pill primary',
    secondary: 'status-pill neutral',
    outline: 'status-pill neutral',
    success: 'status-pill success',
    warning: 'status-pill warning',
    danger: 'status-pill danger',
    primary: 'status-pill primary',
  };

  const classes = [variants[variant] || variants.default, className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
};
