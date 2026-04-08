import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LifeBuoy, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import BrandLogo from '../../components/shared/BrandLogo';
import { api } from '../../utils/api';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState('request');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/users/auth/password-reset/', { email }, { auth: false });
      setStep('verify');
    } catch (requestError) {
      setError(requestError.message || 'Unable to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      await api.post('/users/auth/password-reset/confirm/', {
        email,
        otp,
        new_password: password,
        new_password_confirm: confirmPassword,
      }, { auth: false });
      setStep('success');
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset password.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email to resend the OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/users/auth/password-reset/', { email }, { auth: false });
    } catch (requestError) {
      setError(requestError.message || 'Unable to resend OTP.');
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
          <h1>Reset access without losing the premium experience.</h1>
          <p className="auth-copy">
            Request a secure OTP using the email linked to your garage account and get back into the billing hub quickly.
          </p>

          <div className="auth-pills">
            <span><ShieldCheck size={14} /> Secure reset</span>
            <span><Sparkles size={14} /> Fast recovery</span>
            <span><LifeBuoy size={14} /> Support ready</span>
          </div>

          <div className="auth-support">
            <strong>Need help?</strong>
            <p>If the email is valid, a one-time code will be issued by your garage admin workflow.</p>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-intro">
            <span className="auth-chip">Forgot password</span>
            <h2>Recover account access</h2>
            <p>We’ll issue a one-time code using the email tied to your account.</p>
          </div>

          {step === 'success' ? (
            <div className="auth-success-card">
              <div className="auth-alert auth-alert-success">
                Your password has been updated successfully.
              </div>
              <p className="auth-note">
                You can now sign in using your new password.
              </p>
              <Link to="/login" className="auth-submit-link primary-btn">
                Back to sign in
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : step === 'verify' ? (
            <form onSubmit={handleVerify} className="auth-form">
              {error && <div className="error-message auth-alert">{error}</div>}
              <div className="auth-alert auth-alert-success">
                We sent a 6-digit OTP to {email}. It expires in 10 minutes.
              </div>

              <div className="form-group auth-field">
                <label htmlFor="otp-code">OTP code</label>
                <div className="auth-input-shell">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="otp-code"
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
                <label htmlFor="confirm-password">Confirm new password</label>
                <div className="auth-input-shell">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="confirm-password"
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

              <Button type="submit" className="auth-submit" disabled={verifying}>
                {verifying ? 'Updating...' : 'Update password'}
                <ArrowRight size={16} />
              </Button>

              <button
                type="button"
                className="text-btn"
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? 'Resending...' : 'Resend OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message auth-alert">{error}</div>}
              <div className="form-group auth-field">
                <label htmlFor="forgot-email">Email</label>
                <div className="auth-input-shell">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@garage.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
                <ArrowRight size={16} />
              </Button>
            </form>
          )}

          <div className="auth-switch">
            <span>Remembered it?</span>
            <Link to="/login">Return to sign in</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;