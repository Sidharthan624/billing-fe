import React, { useState } from 'react';
import { api } from '../services/api';
import { Receipt, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';

export default function LoginView({ onLoginSuccess, onNotify, theme = 'dark', onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');


  const fillAdminCredentials = () => {
    setEmail('admin@novabill.io');
    setPassword('admin123');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login(email, password);
      onNotify({ type: 'success', message: `Welcome back, ${res.user.name}!` });
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: `
          radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
          var(--bg-primary)
        `,
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '40px 36px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(99,102,241,0.2)',
          border: '1px solid var(--border-card)',
          position: 'relative',
        }}
      >
        {/* Theme Toggle Top-Right */}
        {onToggleTheme && (
          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <button
              type="button"
              onClick={onToggleTheme}
              className="theme-toggle-btn"
              style={{ padding: '5px 10px', fontSize: 11.5 }}
              title={`Switch to ${theme === 'dark' ? 'White / Light' : 'Black / Dark'} Theme`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={13} style={{ color: '#f59e0b' }} />
                  <span>White</span>
                </>
              ) : (
                <>
                  <Moon size={13} style={{ color: '#6366f1' }} />
                  <span>Black</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              marginBottom: 14,
            }}
          >
            <Receipt size={28} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Novabill Suite
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Sign in to access your billing engine & POS
          </p>
        </div>

        {/* Demo Quick Fill Box */}
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px dashed rgba(99, 102, 241, 0.4)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.05em' }}>
              SEEDED ADMIN CREDENTIALS
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              <code>admin@novabill.io</code> • <code>admin123</code>
            </div>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 600,
              borderColor: 'rgba(99, 102, 241, 0.5)',
              color: '#c7d2fe',
            }}
            id="btn-quick-fill-admin"
          >
            <Sparkles size={13} />
            Quick Fill
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="email"
                placeholder="admin@novabill.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: 38 }}
                required
                autoFocus
                id="input-login-email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 4 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                required
                id="input-login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 10 }}
            id="btn-login-submit"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 28,
            paddingTop: 18,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 11.5,
            color: 'var(--text-muted)',
          }}
        >
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <span>Secured with JWT & bcrypt password encryption</span>
        </div>
      </div>
    </div>
  );
}
