import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, KeyRound, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

import CyberShield3D from '../components/3d/CyberShield3D';
import CyberParticles from '../components/3d/CyberParticles';
import './LoginPage.css';

const Loader = () => (
  <div className="d-flex justify-content-center align-items-center h-100">
    <div className="spinner-border text-info" role="status">
      <span className="visually-hidden">Loading 3D Engine...</span>
    </div>
  </div>
);

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mousePosition = useRef({ x: 0, y: 0 });

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

  const handleMouseMove = (event) => {
    // Normalize mouse coordinates to -1 to +1 range
    mousePosition.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };
  };

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
    <div className="login-container" onMouseMove={handleMouseMove}>
      {/* LEFT SIDE: 3D Experience */}
      <div className="login-left-panel">
        <div className="canvas-container">
          <Suspense fallback={<Loader />}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <color attach="background" args={['#0F172A']} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} color="#00E5FF" />
              <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#0F172A" />
              <Environment preset="city" />
              
              <CyberParticles count={800} />
              <CyberShield3D mousePosition={mousePosition} />
            </Canvas>
          </Suspense>
        </div>

        {/* Brand Overlay */}
        <motion.div 
          className="brand-overlay floating-element"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="d-inline-flex p-3 bg-secondary bg-opacity-20 rounded-circle border border-info border-opacity-20 mb-3 pulse-glow">
            <ShieldAlert size={48} style={{ color: '#00E5FF' }} />
          </div>
          <h1 className="font-display fw-extrabold text-light display-5 mb-2" style={{ letterSpacing: '-1px' }}>
            TRUSTLENS<span style={{ color: '#00E5FF' }}>X</span>
          </h1>
          <p className="lead mb-0 text-info fw-semibold" style={{ textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
            Smart Threat Intelligence Platform
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <motion.div 
        className="login-right-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        <div className="glass-form-card">
          <h2 className="fs-3 fw-bold mb-4 font-display text-center text-light">Sign In</h2>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger d-flex align-items-center gap-2 py-2.5" 
              role="alert" 
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <AlertTriangle size={16} />
              <div>{error}</div>
            </motion.div>
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

            <div className="mb-4 form-check">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label small text-muted" htmlFor="rememberMe">Remember me</label>
            </div>

            <button type="submit" disabled={localLoading} className="btn btn-cyber w-100 mb-4 d-flex align-items-center justify-content-center py-2.5">
              {localLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : 'Access Terminal'}
            </button>
          </form>

          {/* Quick-fill helper credentials panel */}
          <div className="mb-4 p-3 rounded-3 border border-secondary border-opacity-20 bg-dark bg-opacity-30">
            <p className="small fw-semibold text-center mb-2" style={{ color: '#CBD5E1' }}>Simulated Test Accounts</p>
            <div className="d-flex justify-content-center gap-2">
              <button onClick={() => fillCredentials('user')} type="button" className="btn btn-xs btn-outline-secondary py-1 px-2.5 text-light" style={{ fontSize: '0.75rem', borderRadius: '6px' }}>
                Quick User
              </button>
              <button onClick={() => fillCredentials('admin')} type="button" className="btn btn-xs btn-outline-info py-1 px-2.5" style={{ fontSize: '0.75rem', borderRadius: '6px', color: '#00E5FF', borderColor: '#00E5FF' }}>
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
      </motion.div>
    </div>
  );
};

export default LoginPage;
