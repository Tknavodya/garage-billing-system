import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className, type = 'button', disabled = false }) => {
  const classes = [
    variant === 'outline' ? 'secondary-btn' : variant === 'ghost' ? 'ghost-btn' : 'primary-btn',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
};
