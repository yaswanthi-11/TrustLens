import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { connectWebSocket, disconnectWebSocket } from '../services/websocketService';
import { 
  ShieldAlert, 
  Search, 
  HelpCircle, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Globe, 
  CheckCircle,
  Clock,
  Compass
} from 'lucide-react';

const ScannerPage = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  
  // Real-time VT loading state
  const [vtScanning, setVtScanning] = useState(false);

  // Set up websocket subscription to listen for the VirusTotal async updates
  useEffect(() => {
    connectWebSocket(
      null, // Don't care about others' fresh scans here
      (updatedScan) => {
        // If the updated scan is the one currently displayed, update VT telemetry in real-time!
        setScanResult(prev => {
          if (prev && prev.id === updatedScan.id) {
            setVtScanning(false);
            return {
              ...prev,
              virusTotalStatus: updatedScan.virusTotalStatus,
              virusTotalPositives: updatedScan.virusTotalPositives,
              virusTotalTotal: updatedScan.virusTotalTotal
            };
          }
          return prev;
        });
      }
    );

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();

    if (!user) {
      // Redirect to login if they try to scan without an account
      navigate('/login');
      return;
    }

    if (!url.trim()) {
      setError('Please input a valid URL or Domain.');
      return;
    }

    setError('');
    setLoading(true);
    setScanResult(null);

    try {
      const res = await api.post('/scan', { url: url.trim() });
      setScanResult(res.data);
      
      // If VirusTotal is scanning in the background, show spinner
      if (res.data.virusTotalStatus === 'Not Scanned' || res.data.virusTotalStatus === 'Scanning') {
        setVtScanning(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Threat scan failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (scanId) => {
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

  const getReputationBadge = (rep) => {
    switch (rep?.toLowerCase()) {
      case 'good': return 'badge-safe';
      case 'neutral': return 'badge-low-risk';
      case 'poor': return 'badge-suspicious';
      case 'high risk': return 'badge-dangerous';
      default: return 'badge bg-secondary';
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="font-display fw-bold text-light mb-1">Threat Analyzer</h2>
        <p className="text-muted">Analyze domain structures, subdomains, SSL presence, and brand spoofs in real-time.</p>
      </div>

      {/* Input Panel */}
      <div className="card glass-card p-4 mb-4">
        <form onSubmit={handleScan}>
          <div className="row g-3">
            <div className="col-md-9 col-lg-10">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-custom w-100 ps-5"
                  style={{ height: '52px', fontSize: '1.05rem' }}
                  placeholder="Analyze URL (e.g., http://amaz0n-login-security.com or paypal-verification.net)..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
                <Search className="position-absolute text-muted" size={20} style={{ left: '18px', top: '16px' }} />
              </div>
            </div>
            <div className="col-md-3 col-lg-2">
              <button 
                type="submit" 
                className="btn btn-cyber w-100 d-flex align-items-center justify-content-center gap-2"
                style={{ height: '52px' }}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <Activity size={18} />
                    <span>Scan URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        {error && <p className="text-danger small mt-2 mb-0 fw-semibold">{error}</p>}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-info mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#00E5FF' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted font-display">Executing 10 heuristics cybersecurity threat checks...</p>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && !loading && (
        <div className="row g-4 animate-slide-in">
          {/* Main Verdict Card */}
          <div className="col-lg-8">
            <div className="card glass-card p-4 mb-4 position-relative overflow-hidden" style={{ borderLeft: `5px solid ${getThreatColor(scanResult.threatLevel)}` }}>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                <span className="text-muted small fw-semibold">DETECTION SUMMARY</span>
                <span className={`badge ${
                  scanResult.threatLevel === 'Safe' ? 'badge-safe' :
                  scanResult.threatLevel === 'Low Risk' ? 'badge-low-risk' :
                  scanResult.threatLevel === 'Suspicious' ? 'badge-suspicious' : 'badge-dangerous'
                }`}>{scanResult.threatLevel.toUpperCase()}</span>
              </div>
              
              <h3 className="text-light font-display fw-bold mb-2" style={{ wordBreak: 'break-all' }}>{scanResult.url}</h3>
              
              <div className="row mt-4 g-3">
                {/* Risk Gauge representation */}
                <div className="col-md-4 text-center d-flex flex-column align-items-center justify-content-center border-end border-secondary border-opacity-20">
                  <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                    {/* Ring background */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '8px solid rgba(255,255,255,0.03)' }}></div>
                    {/* Active Ring color */}
                    <div style={{ 
                      position: 'absolute', 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%', 
                      border: `8px solid ${getThreatColor(scanResult.threatLevel)}`,
                      clipPath: `polygon(50% 50%, -50% -50%, ${scanResult.riskScore * 3.6}% -50%)`, // Ring approximation
                      transform: 'rotate(-90deg)',
                      opacity: 0.15
                    }}></div>
                    <div className="text-center">
                      <span className="fs-1 fw-extrabold font-display" style={{ color: getThreatColor(scanResult.threatLevel) }}>
                        {scanResult.riskScore}
                      </span>
                      <p className="text-muted small mb-0">Risk Score</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-8 px-md-4">
                  <h4 className="fs-6 fw-bold text-muted mb-2">Threat Verdict Explanation</h4>
                  <div className="p-3 rounded-3 bg-dark bg-opacity-20 border border-secondary border-opacity-20">
                    <p className="text-light mb-0" style={{ fontSize: '0.92rem', lineHeight: '1.5' }}>
                      {scanResult.recommendations}
                    </p>
                  </div>
                  {user && (
                    <button 
                      onClick={() => downloadPdf(scanResult.id)} 
                      className="btn btn-cyber-outline btn-sm mt-3 d-flex align-items-center gap-2"
                    >
                      <FileText size={14} />
                      <span>Export PDF Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Heuristics Logs */}
            <div className="card glass-card p-4">
              <h4 className="fs-5 fw-bold text-light mb-3 font-display d-flex align-items-center gap-2">
                <ShieldAlert size={18} className="text-info" />
                <span>Rule Detection Logs</span>
              </h4>
              <div className="d-flex flex-column gap-2">
                {scanResult.reasons.map((reason, index) => (
                  <div key={index} className="d-flex gap-3 p-3 rounded-3 bg-dark bg-opacity-20 border border-secondary border-opacity-10">
                    <AlertTriangle size={18} className="flex-shrink-0" style={{ color: getThreatColor(scanResult.threatLevel), marginTop: '2px' }} />
                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CyberDNA Side-cards */}
          <div className="col-lg-4">
            {/* CyberDNA Passport */}
            <div className="card glass-card p-4 mb-4 position-relative overflow-hidden glow-accent" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="font-display fw-bold text-info small" style={{ color: '#00E5FF', letterSpacing: '0.05em' }}>CyberDNA™ FINGERPRINT</span>
                <Globe size={16} className="text-muted" />
              </div>

              <div className="text-center py-2 mb-3">
                <div className="font-mono text-light fw-bold fs-4 p-2 bg-dark bg-opacity-40 rounded border border-secondary border-opacity-30 d-inline-block tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                  {scanResult.cyberDna}
                </div>
                <p className="text-muted small mt-2 mb-0">Deterministic SHA-256 Vector Identity</p>
              </div>

              <hr className="border-secondary border-opacity-30" />

              <div className="row g-2">
                <div className="col-6 text-center border-end border-secondary border-opacity-20 py-2">
                  <span className="fs-4 fw-bold text-light font-display">{scanResult.trustScore}%</span>
                  <p className="text-muted small mb-0">Trust Score</p>
                </div>
                <div className="col-6 text-center py-2">
                  <span className="fs-4 fw-bold text-light font-display">{scanResult.phishingProbability}%</span>
                  <p className="text-muted small mb-0">Phishing Prob.</p>
                </div>
              </div>

              <hr className="border-secondary border-opacity-30" />

              <div className="d-flex justify-content-between align-items-center pt-2">
                <span className="text-muted small">Domain Reputation:</span>
                <span className={`badge ${getReputationBadge(scanResult.domainReputation)}`}>
                  {scanResult.domainReputation}
                </span>
              </div>
            </div>

            {/* VirusTotal Telemetry Card */}
            <div className="card glass-card p-4">
              <h4 className="fs-6 fw-bold text-light mb-3 font-display d-flex align-items-center justify-content-between">
                <span>VirusTotal™ Integration</span>
                <Compass size={16} className="text-info" />
              </h4>

              {vtScanning ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-info mb-2" role="status" style={{ color: '#00E5FF' }}>
                    <span className="visually-hidden">Scanning VT...</span>
                  </div>
                  <p className="text-muted small mb-0">Querying 70+ Antivirus AV networks...</p>
                  <p className="text-muted" style={{ fontSize: '0.7rem' }}>Real-time update will trigger automatically via WebSockets.</p>
                </div>
              ) : (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small">Scan Status:</span>
                    <span className={`badge ${scanResult.virusTotalStatus === 'Scanned' ? 'bg-success' : scanResult.virusTotalStatus === 'Failed' ? 'bg-danger' : 'bg-secondary'} bg-opacity-20 text-${scanResult.virusTotalStatus === 'Scanned' ? 'success' : scanResult.virusTotalStatus === 'Failed' ? 'danger' : 'light'} border border-${scanResult.virusTotalStatus === 'Scanned' ? 'success' : scanResult.virusTotalStatus === 'Failed' ? 'danger' : 'secondary'} border-opacity-30`}>
                      {scanResult.virusTotalStatus.toUpperCase()}
                    </span>
                  </div>

                  {scanResult.virusTotalStatus === 'Scanned' && (
                    <>
                      <div className="p-3 rounded-3 bg-dark bg-opacity-20 border border-secondary border-opacity-20 text-center">
                        <span className="fs-3 fw-bold font-display" style={{ color: scanResult.virusTotalPositives > 0 ? '#EF4444' : '#22C55E' }}>
                          {scanResult.virusTotalPositives} / {scanResult.virusTotalTotal}
                        </span>
                        <p className="text-muted small mb-0 mt-1">Detections / AV Engines</p>
                      </div>
                      
                      <div className="mt-3">
                        {scanResult.virusTotalPositives > 0 ? (
                          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger small p-2 mb-0 d-flex gap-2 align-items-center">
                            <AlertTriangle size={14} />
                            <span>Engines flagged malicious! Avoid site.</span>
                          </div>
                        ) : (
                          <div className="alert alert-success bg-success bg-opacity-10 border-success border-opacity-20 text-success small p-2 mb-0 d-flex gap-2 align-items-center">
                            <CheckCircle size={14} />
                            <span>Clean signature verification.</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {scanResult.virusTotalStatus !== 'Scanned' && (
                    <div className="p-3 text-center text-muted small border border-dashed rounded-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                      No live VirusTotal reports compiled. Run a URL scan to query AV engines.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
