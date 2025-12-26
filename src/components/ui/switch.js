import React from 'react';

export const Switch = ({ checked, onCheckedChange, defaultChecked }) => {
  const isChecked = checked !== undefined ? checked : defaultChecked;
  
  return (
    <div 
      onClick={() => onCheckedChange && onCheckedChange(!isChecked)}
      style={{
        width: '44px',
        height: '24px',
        backgroundColor: isChecked ? '#0ea5e9' : '#e2e8f0',
        borderRadius: '9999px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        backgroundColor: 'white',
        borderRadius: '50%',
        position: 'absolute',
        left: '2px',
        transform: isChecked ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.2s',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }} />
    </div>
  );
};
