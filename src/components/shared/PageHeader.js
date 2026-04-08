import React from 'react';
import { Button } from '../ui/button';

export const PageHeader = ({ title, description, subtitle, eyebrow, action, actions, children, className }) => {
  const resolvedSubtitle = description || subtitle;
  const resolvedActions = actions || (action ? [action] : []);

  return (
    <div className={`page-header ${className || ''}`}>
      <div>
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {resolvedSubtitle && <p className="page-subtitle">{resolvedSubtitle}</p>}
      </div>
      {(resolvedActions.length > 0 || children) && (
        <div className="toolbar-actions">
          {children}
          {resolvedActions.map((item, index) => (
            <Button key={index} onClick={item.onClick} variant={item.variant || 'primary'} className={item.className}>
              {item.icon && <item.icon size={16} />}
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
