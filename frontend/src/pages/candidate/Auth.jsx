import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleBackToHome = () => {
    navigate('/');
  };
  
  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    if (strength === 0) return '';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 25) return '#ef4444';
    if (strength <= 50) return '#f59e0b';
    if (strength <= 75) return '#3b82f6';
    return '#10b981';
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted:', loginForm);
    // Add login logic here
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to Terms & Conditions');
      return;
    }
    console.log('Signup form submitted:', signupForm);
    // Add signup logic here
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Add Google OAuth logic here
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo and Header */}
        <div className="auth-header">
          <div className="logo" onClick={handleBackToHome} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="url(#gradient)"/>
                <path d="M20 10L25 15L20 20L15 15L20 10Z" fill="white" opacity="0.9"/>
                <path d="M20 20L25 25L20 30L15 25L20 20Z" fill="white" opacity="0.7"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#1e40af"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="auth-title">Recruva</h1>
          </div>
          <p className="auth-tagline">Your next career move starts here.</p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                className="form-input"
                placeholder="Enter your email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="btn-primary">
              Login
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button type="button" className="btn-google" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Login with Google
            </button>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                className="form-input"
                placeholder="Enter your full name"
                value={signupForm.fullName}
                onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                type="email"
                id="signup-email"
                className="form-input"
                placeholder="Enter your email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  className="form-input"
                  placeholder="Create a password"
                  value={signupForm.password}
                  onChange={(e) => {
                    setSignupForm({...signupForm, password: e.target.value});
                    setPassword(e.target.value);
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{
                        width: `${calculatePasswordStrength(password)}%`,
                        backgroundColor: getPasswordStrengthColor(calculatePasswordStrength(password))
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{color: getPasswordStrengthColor(calculatePasswordStrength(password))}}>
                    {getPasswordStrengthText(calculatePasswordStrength(password))}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="signup-confirm-password"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => {
                    setSignupForm({...signupForm, confirmPassword: e.target.value});
                    setConfirmPassword(e.target.value);
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && signupForm.password !== confirmPassword && (
                <span className="password-error">Passwords do not match</span>
              )}
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms">
                I agree to the <a href="#" className="terms-link">Terms & Conditions</a>
              </label>
            </div>

            <button type="submit" className="btn-primary">
              Create Account
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="auth-footer">
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <span className="footer-divider">•</span>
            <a href="#" className="footer-link">Help & Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;