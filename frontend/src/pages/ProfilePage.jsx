import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserCircle, ShieldCheck, Mail, AtSign, Crown, Lock, CheckCircle, AlertTriangle, Key } from 'lucide-react';

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  if (!user) {
    return (
      <div className="text-center py-5 text-muted">
        <UserCircle size={48} className="text-secondary mb-3" />
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwdError('All fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    setPwdLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPwdSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to update password. Check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const getRoleColor = (role) => {
    if (role === 'ROLE_ADMIN') return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'rgba(239,68,68,0.25)' };
    return { bg: 'rgba(0,229,255,0.08)', color: '#00E5FF', border: 'rgba(0,229,255,0.25)' };
  };

  const getRoleLabel = (role) => {
    if (role === 'ROLE_ADMIN') return 'Administrator';
    if (role === 'ROLE_USER') return 'Analyst';
    return role;
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="font-display fw-bold text-light mb-1">Analyst Profile</h2>
        <p className="text-muted">View your credential details and platform access privileges.</p>
      </div>

      <div className="row g-4">
        {/* Profile card */}
        <div className="col-lg-4">
          <div className="card glass-card p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(15,23,42,0.9))' }}>
            {/* Avatar */}
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 pulse-glow"
              style={{ width: '90px', height: '90px', background: 'rgba(0,229,255,0.08)', border: '2px solid rgba(0,229,255,0.3)', color: '#00E5FF' }}>
              <UserCircle size={52} />
            </div>

            <h3 className="font-display fw-bold text-light fs-4 mb-1">{user.username}</h3>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem' }} className="mb-3">{user.email}</p>

            {/* Role badges */}
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {user.roles && [...user.roles].map(role => {
                const s = getRoleColor(role);
                return (
                  <span key={role} className="badge d-flex align-items-center gap-1 px-3 py-2"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '0.75rem', borderRadius: '20px' }}>
                    {role === 'ROLE_ADMIN' ? <Crown size={11} /> : <ShieldCheck size={11} />}
                    {getRoleLabel(role)}
                  </span>
                );
              })}
            </div>

            {/* Security note */}
            <div className="mt-4 p-3 rounded-3 text-start" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <div className="d-flex align-items-center gap-2" style={{ color: '#22C55E', fontSize: '0.8rem' }}>
                <ShieldCheck size={14} />
                <span>BCrypt encrypted · JWT secured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-8 d-flex flex-column gap-4">
          {/* Account Information */}
          <div className="card glass-card p-4">
            <h4 className="fs-5 fw-bold text-light font-display mb-4 d-flex align-items-center gap-2">
              <AtSign size={18} style={{ color: '#00E5FF' }} />
              Account Information
            </h4>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="small fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
                  <AtSign size={13} /> USERNAME
                </label>
                <div className="p-3 rounded-3 border text-light fw-semibold"
                  style={{ background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(255,255,255,0.07)', fontSize: '0.95rem' }}>
                  {user.username}
                </div>
              </div>

              <div className="col-md-6">
                <label className="small fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
                  <Mail size={13} /> EMAIL ADDRESS
                </label>
                <div className="p-3 rounded-3 border text-light fw-semibold"
                  style={{ background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(255,255,255,0.07)', fontSize: '0.95rem' }}>
                  {user.email}
                </div>
              </div>

              <div className="col-12">
                <label className="small fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
                  <ShieldCheck size={13} /> ASSIGNED ROLES
                </label>
                <div className="p-3 rounded-3 border" style={{ background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="d-flex gap-2 flex-wrap">
                    {user.roles && [...user.roles].map(role => {
                      const s = getRoleColor(role);
                      return (
                        <span key={role} className="badge px-3 py-2"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '0.78rem', borderRadius: '20px' }}>
                          {role}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card glass-card p-4">
            <h4 className="fs-5 fw-bold text-light font-display mb-4 d-flex align-items-center gap-2">
              <Key size={18} style={{ color: '#00E5FF' }} />
              Change Password
            </h4>

            {pwdSuccess && (
              <div className="alert d-flex align-items-center gap-2 py-2 mb-3"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', color: '#22C55E', fontSize: '0.85rem' }}>
                <CheckCircle size={16} /> {pwdSuccess}
              </div>
            )}
            {pwdError && (
              <div className="alert d-flex align-items-center gap-2 py-2 mb-3"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#EF4444', fontSize: '0.85rem' }}>
                <AlertTriangle size={16} /> {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="small fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#CBD5E1' }}>
                    <Lock size={13} /> Current Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-custom w-100"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="small fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#CBD5E1' }}>
                    <Lock size={13} /> New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-custom w-100"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="small fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#CBD5E1' }}>
                    <Lock size={13} /> Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-custom w-100"
                    placeholder="Repeat new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <button type="submit" disabled={pwdLoading} className="btn btn-cyber px-4">
                    {pwdLoading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" /> Updating...</>
                    ) : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
