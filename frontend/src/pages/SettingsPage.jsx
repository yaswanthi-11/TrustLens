import React from 'react';
import { Settings, Cpu, Globe, Shield, Database, Activity } from 'lucide-react';

const SettingsPage = () => {
  const config = [
    { icon: Shield, label: 'Threat Engine', value: '10-Layer Static Analysis', color: '#00E5FF' },
    { icon: Cpu, label: 'CyberDNA Algorithm', value: 'SHA-256 Fingerprinting', color: '#22C55E' },
    { icon: Globe, label: 'VirusTotal Integration', value: '70+ AV Engine Network', color: '#EAB308' },
    { icon: Database, label: 'Database', value: 'MySQL 8.x (JPA/Hibernate)', color: '#F97316' },
    { icon: Activity, label: 'Real-Time Feed', value: 'WebSocket (STOMP/SockJS)', color: '#9333EA' },
  ];

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="font-display fw-bold text-light mb-1">Platform Settings</h2>
        <p className="text-muted">System configuration, platform metadata, and operational parameters.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card glass-card p-4 mb-4">
            <h4 className="fs-5 fw-bold text-light font-display mb-4 d-flex align-items-center gap-2">
              <Settings size={18} className="text-info" />
              System Configuration
            </h4>
            <div className="d-flex flex-column gap-3">
              {config.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="d-flex align-items-center justify-content-between p-3 bg-dark bg-opacity-30 rounded-3 border border-secondary border-opacity-15">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-3 border border-opacity-20" style={{ background: `${item.color}15`, borderColor: `${item.color}30`, color: item.color }}>
                        <Icon size={16} />
                      </div>
                      <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>{item.label}</span>
                    </div>
                    <span className="text-light fw-semibold" style={{ fontSize: '0.88rem' }}>{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card glass-card p-4">
            <h4 className="fs-5 fw-bold text-light font-display mb-3">Platform Metadata</h4>
            <div className="row g-3">
              {[
                { label: 'Platform', value: 'TrustLens X v1.0.0' },
                { label: 'Backend Framework', value: 'Spring Boot 3.3.4 / Java 21' },
                { label: 'Frontend Framework', value: 'React 19 + Vite 5' },
                { label: 'Security', value: 'Spring Security + JWT (JJWT 0.11.5)' },
                { label: 'Authentication', value: 'BCrypt + Stateless JWT Tokens' },
                { label: 'PDF Reports', value: 'OpenPDF 1.3.30' },
              ].map((item, i) => (
                <div key={i} className="col-md-6">
                  <div className="p-3 bg-dark bg-opacity-20 rounded-3 border border-secondary border-opacity-10">
                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{item.label}</span>
                    <span className="text-light fw-semibold" style={{ fontSize: '0.88rem' }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card glass-card p-4" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.05), rgba(15,23,42,0.9))' }}>
            <h4 className="fs-5 fw-bold text-light font-display mb-3">Quick Credentials</h4>
            <p className="text-muted small mb-3">Default seeded accounts for immediate testing:</p>

            {[
              { label: 'Admin Account', user: 'admin', pass: 'admin123', role: 'ROLE_ADMIN + ROLE_USER', color: '#EF4444' },
              { label: 'Standard Analyst', user: 'user', pass: 'user123', role: 'ROLE_USER', color: '#00E5FF' },
            ].map((cred, i) => (
              <div key={i} className="p-3 bg-dark bg-opacity-40 rounded-3 border border-secondary border-opacity-20 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-light small">{cred.label}</span>
                  <span className="badge" style={{ background: `${cred.color}20`, color: cred.color, border: `1px solid ${cred.color}30`, fontSize: '0.68rem' }}>{cred.role.split('+')[0].trim()}</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Username: <span className="text-light fw-semibold">{cred.user}</span></div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Password: <span className="text-light fw-semibold">{cred.pass}</span></div>
              </div>
            ))}

            <div className="mt-3 p-3 bg-warning bg-opacity-10 border border-warning border-opacity-20 rounded-3">
              <p className="text-warning small mb-0">⚠ Change these credentials before deploying to production environments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
