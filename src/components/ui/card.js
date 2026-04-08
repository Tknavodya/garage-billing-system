import React from 'react';

export const Card = ({ className, children }) => (
  <div className={`card-surface ${className || ''}`}>
    {children}
  </div>
);

export const CardContent = ({ className, children }) => (
  <div className={`card-content ${className || ''}`}>
    {children}
  </div>
);

export const CardHeader = ({ className, children }) => (
  <div className={`card-header ${className || ''}`}>
    {children}
  </div>
);

export const CardTitle = ({ className, children }) => (
  <h3 className={`card-title ${className || ''}`}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children }) => (
  <p className={`card-description ${className || ''}`}>
    {children}
  </p>
);

