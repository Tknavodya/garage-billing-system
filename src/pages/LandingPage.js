import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, CreditCard, ShieldCheck } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="top-nav" style={{ padding: '20px 10%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Wrench color="#2b6cb0" size={32} />
             <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a365d' }}>GaragePro</span>
        </div>
        <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '10px 24px' }}>Sign In</button>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <span className="badge">Streamline Your Garage</span>
          <h1>Garage Billing, Payments & Service Invoice Management System</h1>
          <p>
            The all-in-one platform to manage customers, track inventory, and generate professional invoices for your automotive business.
          </p>
        </div>
        <div className="hero-illustration">
          <div className="hero-image-placeholder">
             <img 
               src="https://media.craiyon.com/2025-08-16/2z3JAZMDSAigc1JPq5TZjA.webp" 
               alt="Modern Garage" 
             />
          </div>
        </div>
      </section>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <FileText size={24} />
          </div>
          <h3>Easy Invoicing</h3>
          <p>Generate professional digital invoices in seconds. Include specific services, parts, and labor costs with ease.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <CreditCard size={24} />
          </div>
          <h3>Payment Tracking</h3>
          <p>Keep track of all payments, outstanding balances, and financial health of your garage with detailed reports.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <ShieldCheck size={24} />
          </div>
          <h3>Service History</h3>
          <p>Maintain complete service records for every vehicle. Never lose track of what work was done and when.</p>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '40px', color: '#718096', borderTop: '1px solid #edf2f7' }}>
        <p>&copy; 2026 GaragePro Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
