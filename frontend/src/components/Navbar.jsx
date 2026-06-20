import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg border-bottom" style={{ background: '#1E293B', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/scanner" style={{ color: '#F8FAFC' }}>
          <ShieldAlert size={28} className="text-info glow-text" style={{ color: '#00E5FF' }} />
          <span className="font-display fw-bold fs-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
            TRUSTLENS<span style={{ color: '#00E5FF' }}>X</span>
          </span>
        </Link>
        
        <div className="d-flex align-items-center gap-3 ms-auto">
          {user ? (
            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-md-flex flex-column text-end">
                <span className="fw-semibold text-light" style={{ fontSize: '0.9rem' }}>{user.username}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {user.roles && user.roles.includes('ROLE_ADMIN') ? (
                    <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-30">ADMINISTRATOR</span>
                  ) : (
                    <span className="badge bg-secondary bg-opacity-20 text-secondary border border-secondary border-opacity-30">ANALYST</span>
                  )}
                </span>
              </div>
              <div className="p-2 bg-dark rounded-circle border border-secondary border-opacity-30 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <UserIcon size={18} className="text-light" />
              </div>
              <button 
                onClick={logout} 
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 px-3 py-2 border-opacity-50"
                style={{ borderRadius: '8px' }}
              >
                <LogOut size={14} />
                <span className="d-none d-sm-inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-sm btn-outline-info px-3 py-2" style={{ color: '#00E5FF', borderColor: '#00E5FF', borderRadius: '8px' }}>Login</Link>
              <Link to="/register" className="btn btn-sm btn-cyber px-3 py-2" style={{ borderRadius: '8px' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
