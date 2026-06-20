import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, KeyRound, User as UserIcon, Mail } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/scanner');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLocalLoading(true);

    try {
      await register(username, email, password);
      navigate('/scanner');
    } catch (err) {
      setError(err || 'Registration failed. Try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#0F172A', fontFamily: "'Inter', sans-serif" }}>
      {/* Background glowing rings */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(0, 229, 255, 0.05)', filter: 'blur(80px)', borderRadius: '50%', top: '15%', right: '30%' }}></div>
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'rgba(239, 68, 68, 0.03)', filter: 'blur(100px)', borderRadius: '50%', bottom: '15%', left: '25%' }}></div>

      <div className="container" style={{ maxWidth: '440px', zIndex: 10 }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 bg-secondary bg-opacity-20 rounded-circle border border-info border-opacity-20 mb-3 pulse-glow">
            <ShieldAlert size={40} style={{ color: '#00E5FF' }} />
          </div>
          <h1 className="font-display fw-extrabold text-light fs-3 mb-1" style={{ letterSpacing: '-0.5px' }}>
            TRUSTLENS<span style={{ color: '#00E5FF' }}>X</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1' }}>Smart Threat Intelligence Gateway</p>
        </div>

        <div className="card glass-card p-4">
          <h2 className="fs-4 fw-bold mb-4 font-display text-center text-light">Create Account</h2>
          
          {error && (
            <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger d-flex align-items-center gap-2 py-2.5" role="alert" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <AlertTriangle size={16} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: '#CBD5E1' }} htmlFor="username">Username</label>
              <div className="position-relative">
                <input
                  type="text"
                  id="username"
                  className="form-control form-control-custom w-100 ps-5"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <UserIcon className="position-absolute text-muted" size={18} style={{ left: '16px', top: '15px' }} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: '#CBD5E1' }} htmlFor="email">Email Address</label>
              <div className="position-relative">
                <input
                  type="email"
                  id="email"
                  className="form-control form-control-custom w-100 ps-5"
                  placeholder="analyst@trustlensx.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="position-absolute text-muted" size={18} style={{ left: '16px', top: '15px' }} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: '#CBD5E1' }} htmlFor="password">Password</label>
              <div className="position-relative">
                <input
                  type="password"
                  id="password"
                  className="form-control form-control-custom w-100 ps-5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <KeyRound className="position-absolute text-muted" size={18} style={{ left: '16px', top: '15px' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: '#CBD5E1' }} htmlFor="confirmPassword">Confirm Password</label>
              <div className="position-relative">
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control form-control-custom w-100 ps-5"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <KeyRound className="position-absolute text-muted" size={18} style={{ left: '16px', top: '15px' }} />
              </div>
            </div>

            <button type="submit" disabled={localLoading} className="btn btn-cyber w-100 mb-3 d-flex align-items-center justify-content-center">
              {localLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : 'Establish Profile'}
            </button>
          </form>

          <div className="text-center">
            <p className="small mb-0" style={{ color: '#CBD5E1' }}>
              Already have credentials? <Link to="/login" className="text-info text-decoration-none fw-semibold" style={{ color: '#00E5FF' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
