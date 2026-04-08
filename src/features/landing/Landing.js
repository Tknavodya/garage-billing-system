import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Car,
  FileText,
  Package,
  Sparkles,
  Users2,
  Wrench
} from 'lucide-react';
import BrandLogo from '../../components/shared/BrandLogo';
import heroWorkshop from '../../assets/landing/hero-workshop.png';
import heroInvoice from '../../assets/landing/hero-invoice.png';
import heroService from '../../assets/landing/hero-service.png';
import heroDashboard from '../../assets/landing/hero-dashboard.png';
import aboutWorkshop from '../../assets/landing/mechanic-hand-checking-fixing-broken-car-car-service-garage.jpg';
import './Landing.css';

const features = [
  {
    icon: FileText,
    title: 'Billing automation',
    description: 'Generate professional invoices in seconds with instant totals and payment status.'
  },
  {
    icon: Users2,
    title: 'Customer management',
    description: 'Store contact history, visit counts, and status updates in a clean timeline.'
  },
  {
    icon: Car,
    title: 'Vehicle registry',
    description: 'Track plates, mileage, and ownership while linking every service touchpoint.'
  },
  {
    icon: Wrench,
    title: 'Service workflows',
    description: 'Bundle jobs, labor, and parts into a single view for faster approvals.'
  },
  {
    icon: Package,
    title: 'Inventory control',
    description: 'Monitor part stock, reorder signals, and usage across invoices.'
  },
  {
    icon: BarChart3,
    title: 'Analytics insights',
    description: 'See revenue, collectables, and performance trends in real time.'
  }
];

const Landing = () => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-brand">
          <BrandLogo size="sidebar" />
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Support</a>
        </div>
        <div className="landing-nav-cta">
          <Link to="/login" className="landing-btn landing-btn--nav">Sign In</Link>
        </div>
      </nav>

      <header className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-pill">Modern garage platform</span>
          <h1>Garage billing that feels premium, fast, and effortless.</h1>
          <p>
            GarageCore unifies billing, vehicle history, service workflows, and inventory in one clean
            SaaS workspace. Keep the front desk calm and the finance team confident.
          </p>
          <div className="landing-cta">
            <Link to="/register" className="landing-btn primary">Get Started</Link>
            <Link to="/login" className="landing-btn ghost">Sign In</Link>
          </div>
          <div className="landing-hero-metrics">
            <div>
              <strong>60k+</strong>
              <span>Monthly revenue tracked</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Workflow visibility</span>
            </div>
            <div>
              <strong>1 hub</strong>
              <span>For all operations</span>
            </div>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-hero-card">
            <img className="landing-hero-photo" src={heroWorkshop} alt="Garage service bay overview" />
          </div>
          <div className="landing-floating-card">
            <Sparkles size={18} />
            <div>
              <strong>Premium invoices</strong>
              <span>Shareable in one click</span>
            </div>
          </div>
        </div>
      </header>

      <section className="landing-visuals" aria-label="Product previews">
        <article className="landing-visual-card">
          <img src={heroInvoice} alt="Invoice layout with totals and line items" />
          <div>
            <h3>Invoice clarity</h3>
            <p>Readable billing layouts with instant totals and payment cues.</p>
          </div>
        </article>
        <article className="landing-visual-card">
          <img src={heroService} alt="Service workflow board and parts tracker" />
          <div>
            <h3>Service workflow</h3>
            <p>Track labor, approvals, and stock without switching views.</p>
          </div>
        </article>
        <article className="landing-visual-card">
          <img src={heroDashboard} alt="GarageCore dashboard preview" />
          <div>
            <h3>Executive snapshot</h3>
            <p>One glance for revenue, jobs in progress, and team focus.</p>
          </div>
        </article>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <span>Features</span>
          <h2>Everything you need to run a modern garage.</h2>
          <p>Purpose-built tools for the front desk, workshop, and finance team.</p>
        </div>
        <div className="landing-feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="landing-feature-card">
                <div className="landing-feature-icon">
                  <Icon size={18} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="about" className="landing-about">
        <div className="landing-about-content">
          <span>About GarageCore</span>
          <h2>One platform for every service decision.</h2>
          <p>
            GarageCore helps service centers manage billing, customers, vehicles, services, and inventory
            without juggling spreadsheets. Designed for clarity and speed, it gives every team member
            a premium experience from check-in to payment.
          </p>
        </div>
        <div className="landing-about-media">
          <img src={aboutWorkshop} alt="Mechanic checking a vehicle in the workshop" />
        </div>
        <div className="landing-about-card">
          <h3>Built for growing garages</h3>
          <p>
            Keep the workshop moving with real-time visibility, instant approvals, and smart insights
            across every invoice and customer journey.
          </p>
        </div>
      </section>

      <footer id="contact" className="landing-footer">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <BrandLogo size="sidebar" />
            <p>GarageCore helps you deliver a modern billing experience.</p>
            <div className="landing-footer-meta">
              <span>Operations HQ: Colombo, LK</span>
              <span>Mon-Sat, 8:00 - 20:00</span>
            </div>
          </div>

          <div className="landing-footer-panel">
            <h4>Stay ahead of workshop ops</h4>
            <p>Monthly playbooks on billing, inventory health, and customer retention.</p>
            <form className="landing-footer-form">
              <input className="landing-footer-input" type="email" placeholder="you@garage.com" />
              <button className="landing-footer-submit" type="button">Subscribe</button>
            </form>
            <span className="landing-footer-hint">No spam. Unsubscribe any time.</span>
          </div>
        </div>

        <div className="landing-footer-divider" />

        <div className="landing-footer-links">
          <div className="landing-footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#">Roadmap</a>
          </div>
          <div className="landing-footer-col">
            <h4>Company</h4>
            <a href="#">Careers</a>
            <a href="#">Press kit</a>
            <a href="#">Partners</a>
          </div>
          <div className="landing-footer-col">
            <h4>Support</h4>
            <span>support@garagecore.io</span>
            <span>+94 2266545</span>
            <span>Help center</span>
          </div>
          <div className="landing-footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>GarageCore Workspace Suite</span>
          <div className="landing-footer-badges">
            <span className="landing-footer-badge">Realtime dashboards</span>
            <span className="landing-footer-badge">Unified billing</span>
            <span className="landing-footer-badge">Inventory sync</span>
          </div>
          <span>Copyright 2026 GarageCore. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
