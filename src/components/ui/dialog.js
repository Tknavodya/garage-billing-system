import React from 'react';
import { X } from 'lucide-react';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0, 
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}
    onClick={(e) => {
        // Close if clicking overlay
        if (e.target === e.currentTarget) onOpenChange(false);
    }}
    >
      <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className }) => (
  <div className={`p-6 ${className || ''}`} style={{ padding: '1.5rem' }}>
    {children}
  </div>
);

export const DialogHeader = ({ children }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    {children}
  </div>
);

export const DialogTitle = ({ children }) => (
  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
    {children}
  </h2>
);
