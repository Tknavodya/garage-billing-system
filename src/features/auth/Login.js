import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, ShieldCheck, Wrench } from 'lucide-react';
import { Button } from '../../components/ui/button';
import BrandLogo from '../../components/shared/BrandLogo';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-shell auth-shell--login">
      <div className="auth-card">
        <aside className="auth-brand-panel">
          <BrandLogo size="auth" />
          <p className="auth-eyebrow">Garage billing platform</p>
          <h1>Garage billing with a calmer, faster financial workflow.</h1>
          <p className="auth-copy">
            Sign in to manage invoices, collectables, customers, and service activity from one premium workspace.
          </p>

          <div className="auth-pills">
            <span><ShieldCheck size={14} /> Secure access</span>
            <span><Wrench size={14} /> Service workflow</span>
            <span><Sparkles size={14} /> Financial visibility</span>
          </div>

          <div className="auth-support">
            <strong>Trusted by the front desk and finance team</strong>
            <p>Keep the garage moving without losing sight of billing, payments, or customer history.</p>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-intro">
            <span className="auth-chip">Secure sign in</span>
            <h2>Welcome back</h2>
            <p>Enter your admin email and password to continue.</p>
          </div>

          {error && <div className="error-message auth-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group auth-field">
              <label htmlFor="login-email">Email</label>
              <div className="auth-input-shell">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@garage.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group auth-field">
              <div className="auth-field-head">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
              </div>
              <div className="auth-input-shell">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-visibility-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="auth-submit">
              Sign In
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="auth-switch">
            <span>Need an account?</span>
            <Link to="/register">Create one here</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
