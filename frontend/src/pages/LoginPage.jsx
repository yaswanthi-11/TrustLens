import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, KeyRound, User as UserIcon } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/scanner');
    }
  }, [isAuthenticated, navigate]);

  // Handle session expired indicator
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setError('Your session has expired. Please log in again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLocalLoading(true);

    try {
      await login(username, password);
      navigate('/scanner');
    } catch (err) {
      setError(err || 'Authentication failed. Please verify credentials.');
    } finally {
      setLocalLoading(false);
    }
  };

  const fillCredentials = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('user');
      setPassword('user123');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#0F172A', fontFamily: "'Inter', sans-serif" }}>
      {/* Background glowing rings */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(0, 229, 255, 0.05)', filter: 'blur(80px)', borderRadius: '50%', top: '20%', left: '30%' }}></div>
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'rgba(239, 68, 68, 0.03)', filter: 'blur(100px)', borderRadius: '50%', bottom: '20%', right: '25%' }}></div>

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
          <h2 className="fs-4 fw-bold mb-4 font-display text-center text-light">Sign In</h2>
          
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
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <UserIcon className="position-absolute text-muted" size={18} style={{ left: '16px', top: '15px' }} />
              </div>
            </div>

            <div className="mb-4">
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

            <button type="submit" disabled={localLoading} className="btn btn-cyber w-100 mb-3 d-flex align-items-center justify-content-center">
              {localLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : 'Access Terminal'}
            </button>
          </form>

          {/* Quick-fill helper credentials panel (very helpful for testing!) */}
          <div className="mt-2 mb-3 p-3 rounded-3 border border-secondary border-opacity-20 bg-dark bg-opacity-30">
            <p className="small fw-semibold text-center mb-2" style={{ color: '#CBD5E1' }}>Simulated Test Accounts</p>
            <div className="d-flex justify-content-center gap-2">
              <button onClick={() => fillCredentials('user')} className="btn btn-xs btn-outline-secondary py-1 px-2.5 text-light" style={{ fontSize: '0.75rem', borderRadius: '6px' }}>
                Quick User
              </button>
              <button onClick={() => fillCredentials('admin')} className="btn btn-xs btn-outline-info py-1 px-2.5" style={{ fontSize: '0.75rem', borderRadius: '6px', color: '#00E5FF', borderColor: '#00E5FF' }}>
                Quick Admin
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="small mb-0" style={{ color: '#CBD5E1' }}>
              New analyst? <Link to="/register" className="text-info text-decoration-none fw-semibold" style={{ color: '#00E5FF' }}>Establish Profile</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
