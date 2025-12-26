import React from 'react';

export const Input = ({ id, type = 'text', placeholder, value, onChange, className }) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    style={{
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0',
      fontSize: '0.875rem',
      outline: 'none',
      backgroundColor: 'white',
      height: '2.5rem',
    }}
    className={className}
  />
);

export const Textarea = ({ id, placeholder, value, onChange, className }) => (
  <textarea
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={3}
    style={{
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0',
      fontSize: '0.875rem',
      outline: 'none',
      resize: 'vertical',
      minHeight: '60px'
    }}
    className={className}
  />
);

export const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} style={{
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: '0.375rem'
  }}>
    {children}
  </label>
);
