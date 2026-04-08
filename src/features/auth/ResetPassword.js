import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, LifeBuoy } from 'lucide-react';
import { Button } from '../../components/ui/button';
import BrandLogo from '../../components/shared/BrandLogo';
import { api } from '../../utils/api';
import './Login.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/users/auth/password-reset/confirm/', {
        email,
        otp,
        new_password: password,
        new_password_confirm: confirmPassword,
      }, { auth: false });
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--forgot">
      <div className="auth-card">
        <aside className="auth-brand-panel auth-brand-panel--soft">
          <BrandLogo size="auth" />
          <p className="auth-eyebrow">Password recovery</p>
          <h1>Create a new secure password for your GarageCore account.</h1>
          <p className="auth-copy">
            Use the OTP sent to your email to set a new password and protect your garage data.
          </p>

          <div className="auth-pills">
            <span><ShieldCheck size={14} /> Secure reset</span>
            <span><Sparkles size={14} /> Fast recovery</span>
            <span><LifeBuoy size={14} /> Support ready</span>
          </div>

          <div className="auth-support">
            <strong>Need help?</strong>
            <p>If the OTP has expired, request a fresh code from the sign-in screen.</p>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-intro">
            <span className="auth-chip">Reset password</span>
            <h2>Set a new password</h2>
            <p>Enter the OTP from your email to finish recovery.</p>
          </div>

          {success ? (
            <div className="auth-success-card">
              <div className="auth-alert auth-alert-success">
                Your password has been updated.
              </div>
              <p className="auth-note">You can sign in with your new password now.</p>
              <Link to="/login" className="auth-submit-link primary-btn">
                Back to sign in
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message auth-alert">{error}</div>}

              <div className="form-group auth-field">
                <label htmlFor="reset-email">Email</label>
                <div className="auth-input-shell">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@garage.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group auth-field">
                <label htmlFor="reset-otp">OTP code</label>
                <div className="auth-input-shell">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="reset-otp"
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter 6-digit code"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>

              <div className="form-group auth-field">
                <label htmlFor="new-password">New password</label>
                <div className="auth-input-shell">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a new password"
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
                <label htmlFor="confirm-new-password">Confirm new password</label>
                <div className="auth-input-shell">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat the new password"
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

              <Button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update password'}
                <ArrowRight size={16} />
              </Button>
            </form>
          )}

          <div className="auth-switch">
            <span>Need another link?</span>
            <Link to="/forgot-password">Return to recovery</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResetPassword;