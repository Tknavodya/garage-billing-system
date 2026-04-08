import React from 'react';
import './BrandLogo.css';

const BrandLogo = ({ size = 'sidebar', className = '' }) => {
  const logoSrc = `${process.env.PUBLIC_URL}/garagecore-symbol.png`;

  return (
    <div className={`brand-logo brand-logo--${size} ${className}`.trim()}>
      <div className="brand-logo-mark" aria-hidden="true">
        <img src={logoSrc} alt="" className="brand-logo-image" />
      </div>
      <div className="brand-logo-copy" aria-label="GarageCore">
        <span className="brand-logo-name-main">Garage</span>
        <span className="brand-logo-name-accent">Core</span>
      </div>
    </div>
  );
};

export default BrandLogo;