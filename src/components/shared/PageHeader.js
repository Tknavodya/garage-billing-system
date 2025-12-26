import React from 'react';
import { Button } from '../ui/button';

export const PageHeader = ({ title, description, action }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', // Changed to center to match Customers.css alignment
      marginBottom: '2rem' 
    }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a' }}>{title}</h1>
        {description && <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon size={16} />}
          {action.label}
        </Button>
      )}
    </div>
  );
};
