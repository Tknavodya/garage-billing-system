import React from 'react';

export const Input = ({ id, type = 'text', placeholder, value, onChange, className, as: Component = 'input', ...rest }) => (
  <Component
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`premium-input ${className || ''}`}
    {...rest}
  />
);

export const Textarea = ({ id, placeholder, value, onChange, className, ...rest }) => (
  <textarea
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={3}
    className={`premium-textarea ${className || ''}`}
    {...rest}
  />
);

export const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="premium-label">
    {children}
  </label>
);
