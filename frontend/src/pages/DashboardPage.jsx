import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { connectWebSocket, disconnectWebSocket } from '../services/websocketService';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  Activity, 
  History, 
  Search, 
  Radio,
  FileDown
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScans: 0,
    safeScans: 0,
    lowRiskScans: 0,
    suspiciousScans: 0,
    dangerousScans: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial counters and recent history
  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/dashboard');
      setStats(statsRes.data);

      const historyRes = await api.get('/scan/history');
      setRecentScans(historyRes.data.slice(0, 5)); // display latest 5
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Connect to WebSocket to receive real-time updates as scans occur!
    connectWebSocket(
      (newScan) => {
        // Increment total scans and the corresponding threat level counter in real-time!
        setStats(prev => {
          const updated = { ...prev, totalScans: prev.totalScans + 1 };
          if (newScan.threatLevel === 'Safe') updated.safeScans++;
          else if (newScan.threatLevel === 'Low Risk') updated.lowRiskScans++;
          else if (newScan.threatLevel === 'Suspicious') updated.suspiciousScans++;
          else if (newScan.threatLevel === 'Dangerous') updated.dangerousScans++;
          return updated;
        });

        // Add to the front of recent list, limit to 5
        setRecentScans(prev => [newScan, ...prev].slice(0, 5));
      },
      (updatedScan) => {
        // If a scan has a background VirusTotal update, update it in our recent scans table!
        setRecentScans(prev => prev.map(s => s.id === updatedScan.id ? updatedScan : s));
      }
    );

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const downloadPdf = async (scanId, e) => {
    e.stopPropagation();
    try {
      const response = await api.get(`/scan/${scanId}/report`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `trustlensx-threat-report-${scanId}.pdf`;
      link.click();
    } catch (err) {
      alert("Failed to export PDF report.");
    }
  };

  const getThreatColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'safe': return '#22C55E';
      case 'low risk': return '#EAB308';
      case 'suspicious': return '#F97316';
      case 'dangerous': return '#EF4444';
      default: return '#00E5FF';
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="font-display fw-bold text-light mb-1">Security Dashboard</h2>
          <p className="text-muted">Real-time threat feeds, risk categorizations, and audit statistics.</p>
        </div>
        <div className="d-flex align-items-center gap-2 p-2 px-3 rounded-pill bg-dark border border-secondary border-opacity-30">
          <Radio size={16} className="text-info glow-text pulse-glow" style={{ color: '#00E5FF' }} />
          <span className="font-mono text-info fw-bold small" style={{ color: '#00E5FF', fontSize: '0.78rem', letterSpacing: '0.05em' }}>LIVE FEED ACTIVE</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info mb-2" role="status" style={{ color: '#00E5FF' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted small">Loading analytical security parameters...</p>
        </div>
      ) : (
        <>
          {/* Counters Grid */}
          <div className="row g-4 mb-4">
            {/* Total Scans */}
            <div className="col-md">
              <div className="card glass-card p-3 d-flex flex-row align-items-center gap-3">
                <div className="p-3 bg-secondary bg-opacity-20 rounded-3 border border-secondary border-opacity-20 text-info" style={{ color: '#00E5FF' }}>
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="fs-3 fw-extrabold text-light mb-0 font-display">{stats.totalScans}</h3>
                  <p className="text-muted small mb-0 fw-semibold">TOTAL AUDITS</p>
                </div>
              </div>
            </div>

            {/* Safe Scans */}
            <div className="col-md">
              <div className="card glass-card p-3 d-flex flex-row align-items-center gap-3" style={{ borderLeft: '3px solid #22C55E' }}>
                <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-20 text-success">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="fs-3 fw-extrabold text-success mb-0 font-display">{stats.safeScans}</h3>
                  <p className="text-muted small mb-0 fw-semibold">SAFE DOMAINS</p>
                </div>
              </div>
            </div>

            {/* Low Risk */}
            <div className="col-md">
              <div className="card glass-card p-3 d-flex flex-row align-items-center gap-3" style={{ borderLeft: '3px solid #EAB308' }}>
                <div className="p-3 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-20 text-warning">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="fs-3 fw-extrabold text-warning mb-0 font-display">{stats.lowRiskScans}</h3>
                  <p className="text-muted small mb-0 fw-semibold">LOW RISK</p>
                </div>
              </div>
            </div>

            {/* Suspicious */}
            <div className="col-md">
              <div className="card glass-card p-3 d-flex flex-row align-items-center gap-3" style={{ borderLeft: '3px solid #F97316' }}>
                <div className="p-3 bg-opacity-10 rounded-3 border border-opacity-20" style={{ background: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.2)', color: '#F97316' }}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="fs-3 fw-extrabold mb-0 font-display" style={{ color: '#F97316' }}>{stats.suspiciousScans}</h3>
                  <p className="text-muted small mb-0 fw-semibold">SUSPICIOUS</p>
                </div>
              </div>
            </div>

            {/* Dangerous */}
            <div className="col-md">
              <div className="card glass-card p-3 d-flex flex-row align-items-center gap-3" style={{ borderLeft: '3px solid #EF4444' }}>
                <div className="p-3 bg-danger bg-opacity-10 rounded-3 border border-danger border-opacity-20 text-danger">
                  <ShieldX size={24} />
                </div>
                <div>
                  <h3 className="fs-3 fw-extrabold text-danger mb-0 font-display">{stats.dangerousScans}</h3>
                  <p className="text-muted small mb-0 fw-semibold">DANGEROUS</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Quick Scanner Action */}
            <div className="col-lg-5">
              <div className="card glass-card p-4 h-100 d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)' }}>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Activity size={18} className="text-info glow-text" style={{ color: '#00E5FF' }} />
                    <h4 className="fs-5 fw-bold text-light mb-0 font-display">Fast Threat Check</h4>
                  </div>
                  <p className="text-muted small mb-4">
                    Audit suspect domains immediately using static security rules heuristics. Enter any URL or IP address.
                  </p>
                  
                  <div className="p-3 rounded-3 bg-dark bg-opacity-30 border border-secondary border-opacity-20 mb-4">
                    <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
                      <span>Heuristics Checks:</span>
                      <span className="text-light fw-medium">10 Layers</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
                      <span>AV Database:</span>
                      <span className="text-light fw-medium">VirusTotal™ V3</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between text-muted small">
                      <span>Fingerprinting:</span>
                      <span className="text-light fw-medium">CyberDNA™ SHA-256</span>
                    </div>
                  </div>
                </div>

                <Link to="/scanner" className="btn btn-cyber w-100 d-flex align-items-center justify-content-center gap-2">
                  <Search size={16} />
                  <span>Launch Scanner Console</span>
                </Link>
              </div>
            </div>

            {/* Recent Feeds */}
            <div className="col-lg-7">
              <div className="card glass-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fs-5 fw-bold text-light mb-0 font-display d-flex align-items-center gap-2">
                    <History size={18} className="text-info" />
                    <span>Recent Security Scans</span>
                  </h4>
                  <Link to="/history" className="text-info text-decoration-none small fw-semibold" style={{ color: '#00E5FF' }}>View Logs</Link>
                </div>

                {recentScans.length === 0 ? (
                  <div className="text-center py-5 text-muted small border border-dashed rounded-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={28} className="text-secondary mb-2" />
                    <p className="mb-0">Audit history empty. Complete your first scan.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                      <thead>
                        <tr className="text-muted small border-bottom border-secondary border-opacity-20" style={{ fontSize: '0.75rem' }}>
                          <th style={{ background: 'transparent' }}>URL TARGET</th>
                          <th style={{ background: 'transparent' }}>VERDICT</th>
                          <th style={{ background: 'transparent' }}>VIRUSTOTAL</th>
                          <th style={{ background: 'transparent' }} className="text-end">REPORT</th>
                        </tr>
                      </thead>
                      <tbody className="border-0">
                        {recentScans.map((scan) => (
                          <tr key={scan.id} className="border-bottom border-secondary border-opacity-10" style={{ fontSize: '0.88rem' }}>
                            <td style={{ background: 'transparent', maxWidth: '200px' }} className="text-truncate text-light fw-medium">
                              {scan.url}
                            </td>
                            <td style={{ background: 'transparent' }}>
                              <span style={{ color: getThreatColor(scan.threatLevel), fontWeight: 600 }}>
                                {scan.threatLevel} ({scan.riskScore})
                              </span>
                            </td>
                            <td style={{ background: 'transparent' }} className="text-muted">
                              {scan.virusTotalStatus === 'Scanned' ? (
                                <span className={`badge ${scan.virusTotalPositives > 0 ? 'bg-danger' : 'bg-success'} bg-opacity-10 text-${scan.virusTotalPositives > 0 ? 'danger' : 'success'} border border-${scan.virusTotalPositives > 0 ? 'danger' : 'success'} border-opacity-20`} style={{ fontSize: '0.75rem' }}>
                                  {scan.virusTotalPositives} Malicious
                                </span>
                              ) : (
                                <span className="small text-secondary">{scan.virusTotalStatus}</span>
                              )}
                            </td>
                            <td style={{ background: 'transparent' }} className="text-end">
                              <button 
                                onClick={(e) => downloadPdf(scan.id, e)} 
                                className="btn btn-sm btn-outline-info p-1 border-opacity-20"
                                title="Download PDF Report"
                              >
                                <FileDown size={14} style={{ color: '#00E5FF' }} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
