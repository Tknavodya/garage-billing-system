import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Mail, ShieldCheck, Sparkles, User, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import BrandLogo from '../../components/shared/BrandLogo';
import { api } from '../../utils/api';
import './Login.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setSubmitted(false);
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post(
        '/users/auth/register/',
        {
          name,
          email,
          password,
          password_confirm: confirmPassword,
        },
        { auth: false },
      );

      setError('');
      setSubmitted(true);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setSubmitted(false);
      setError(err.message || 'Failed to submit account request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--register">
      <div className="auth-card">
        <aside className="auth-brand-panel auth-brand-panel--accented">
          <BrandLogo size="auth" />
          <p className="auth-eyebrow">Team access</p>
          <h1>Invite-only onboarding for your garage team.</h1>
          <p className="auth-copy">
            Create a polished account request for new staff members while keeping control over who enters the billing workspace.
          </p>

          <div className="auth-pills">
            <span><ShieldCheck size={14} /> Team access</span>
            <span><Sparkles size={14} /> Premium setup</span>
            <span><User size={14} /> Admin approved</span>
          </div>

          <div className="auth-support">
            <strong>Need immediate access?</strong>
            <p>Ask an administrator to approve the account request before you sign in.</p>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-intro">
            <span className="auth-chip">Register</span>
            <h2>Create access request</h2>
            <p>Use a work email so your garage admin can approve the account.</p>
          </div>

          {error && <div className="error-message auth-alert">{error}</div>}
          {submitted && (
            <div className="auth-alert auth-alert-success">
              Account request prepared. An administrator can review and activate access.
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group auth-field">
              <label htmlFor="register-name">Full name</label>
              <div className="auth-input-shell">
                <User size={18} className="auth-input-icon" />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group auth-field">
              <label htmlFor="register-email">Email</label>
              <div className="auth-input-shell">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@garage.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group auth-field">
              <label htmlFor="register-password">Password</label>
              <div className="auth-input-shell">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            <div className="form-group auth-field">
              <label htmlFor="register-confirm-password">Confirm password</label>
              <div className="auth-input-shell">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat the password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-visibility-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="auth-submit">
              {loading ? 'Submitting...' : 'Request access'}
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="auth-switch">
            <span>Already approved?</span>
            <Link to="/login">Back to sign in</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;