import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  History, 
  Search, 
  Trash2, 
  FileDown, 
  Eye, 
  Calendar, 
  ShieldAlert, 
  Info,
  ChevronRight,
  ExternalLink,
  ShieldAlert as ShieldIcon
} from 'lucide-react';

const HistoryPage = () => {
  const { user, isAdmin } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  
  // Selected scan for side-drawer/modal display
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/scan/history');
      setScans(res.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
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

  const handleDelete = async (scanId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this scan record? This action is irreversible.")) return;

    try {
      await api.delete(`/scan/${scanId}`);
      setScans(prev => prev.filter(s => s.id !== scanId));
      if (selectedScan && selectedScan.id === scanId) {
        setSelectedScan(null);
      }
    } catch (err) {
      alert("Error deleting scan record.");
    }
  };

  const getThreatColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'safe': return '#22C55E';
      case 'low risk': return '#EAB308';
      case 'suspicious': return '#F97316';
      case 'dangerous': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  // Filter scans based on search text and threat badges
  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scan.cyberDna.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scan.threatLevel.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterLevel === 'ALL' || scan.threatLevel.toUpperCase() === filterLevel;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container-fluid position-relative">
      <div className="mb-4">
        <h2 className="font-display fw-bold text-light mb-1">Scan History Log</h2>
        <p className="text-muted">
          {isAdmin() 
            ? "Administrative log console. Reviewing all threat scans performed on the network." 
            : "Review your past threat queries, audit CyberDNA indexes, and export reports."}
        </p>
      </div>

      <div className="row g-4">
        {/* Main Log Table */}
        <div className={selectedScan ? "col-lg-7" : "col-lg-12"}>
          <div className="card glass-card p-4">
            {/* Search and Filters */}
            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
              <div className="position-relative flex-grow-1" style={{ maxWidth: '340px' }}>
                <input
                  type="text"
                  className="form-control form-control-custom ps-5"
                  placeholder="Search URL, CyberDNA, levels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="position-absolute text-muted" size={16} style={{ left: '16px', top: '14px' }} />
              </div>

              {/* Filtering level buttons */}
              <div className="d-flex gap-1.5 flex-wrap">
                {['ALL', 'SAFE', 'LOW RISK', 'SUSPICIOUS', 'DANGEROUS'].map(level => (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className={`btn btn-xs py-1 px-3 border border-secondary border-opacity-30`}
                    style={{ 
                      borderRadius: '20px', 
                      fontSize: '0.78rem',
                      background: filterLevel === level ? getThreatColor(level === 'ALL' ? 'accent' : level) : 'transparent',
                      color: filterLevel === level ? '#0F172A' : '#94A3B8',
                      fontWeight: 600,
                      borderColor: filterLevel === level ? getThreatColor(level === 'ALL' ? 'accent' : level) : 'rgba(255,255,255,0.08)'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info mb-2" role="status" style={{ color: '#00E5FF' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted small">Accessing historical telemetry indexes...</p>
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="text-center py-5 text-muted small border border-dashed rounded-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                <History className="mb-2 text-secondary" size={32} />
                <p className="mb-0">No scan history logs match criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-muted small border-bottom border-secondary border-opacity-20" style={{ fontSize: '0.8rem' }}>
                      <th style={{ background: 'transparent' }}>TARGET URL</th>
                      <th style={{ background: 'transparent' }}>VERDICT</th>
                      <th style={{ background: 'transparent' }} className="d-none d-md-table-cell">CYBERDNA</th>
                      <th style={{ background: 'transparent' }} className="d-none d-lg-table-cell">SCAN DATE</th>
                      <th style={{ background: 'transparent' }} className="text-end">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="border-0">
                    {filteredScans.map((scan) => (
                      <tr 
                        key={scan.id} 
                        onClick={() => setSelectedScan(scan)}
                        className="cursor-pointer border-bottom border-secondary border-opacity-10"
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ background: 'transparent', maxWidth: '220px' }} className="text-truncate text-light fw-medium">
                          {scan.url}
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <span style={{ 
                            color: getThreatColor(scan.threatLevel), 
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}>
                            {scan.threatLevel} ({scan.riskScore})
                          </span>
                        </td>
                        <td style={{ background: 'transparent' }} className="text-muted font-mono d-none d-md-table-cell small">
                          {scan.cyberDna}
                        </td>
                        <td style={{ background: 'transparent' }} className="text-muted small d-none d-lg-table-cell">
                          {new Date(scan.scanDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ background: 'transparent' }} className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedScan(scan); }}
                              className="btn btn-sm btn-outline-secondary p-1 border-opacity-20 text-muted"
                              title="Inspect Details"
                            >
                              <Eye size={14} className="text-light" />
                            </button>
                            <button 
                              onClick={(e) => downloadPdf(scan.id, e)}
                              className="btn btn-sm btn-outline-info p-1 border-opacity-20"
                              title="Download Report"
                            >
                              <FileDown size={14} style={{ color: '#00E5FF' }} />
                            </button>
                            {isAdmin() && (
                              <button 
                                onClick={(e) => handleDelete(scan.id, e)}
                                className="btn btn-sm btn-outline-danger p-1 border-opacity-20"
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Selected Scan Drawer */}
        {selectedScan && (
          <div className="col-lg-5 animate-slide-in">
            <div className="card glass-card p-4 position-relative" style={{ borderTop: `4px solid ${getThreatColor(selectedScan.threatLevel)}` }}>
              <button 
                type="button" 
                className="btn-close btn-close-white position-absolute" 
                style={{ right: '16px', top: '16px', fontSize: '0.8rem' }}
                onClick={() => setSelectedScan(null)}
              ></button>
              
              <h3 className="fs-5 fw-bold text-light font-display mb-1">Threat Certificate</h3>
              <p className="text-muted small">Record Telemetry for Scan #{selectedScan.id}</p>

              <div className="mt-3 p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-20">
                <span className="text-muted small">Target URL:</span>
                <p className="text-info fw-semibold mb-2 text-break" style={{ color: '#00E5FF', fontSize: '0.9rem' }}>
                  {selectedScan.url}
                  <a href={selectedScan.url.startsWith('http') ? selectedScan.url : 'http://' + selectedScan.url} target="_blank" rel="noopener noreferrer" className="ms-1.5 text-muted hover-light">
                    <ExternalLink size={12} />
                  </a>
                </p>
                
                <div className="d-flex justify-content-between border-top border-secondary border-opacity-20 pt-2 mt-2">
                  <span className="text-muted small">Risk Verdict:</span>
                  <span className="fw-bold small" style={{ color: getThreatColor(selectedScan.threatLevel) }}>
                    {selectedScan.threatLevel.toUpperCase()} ({selectedScan.riskScore}/100)
                  </span>
                </div>
                
                <div className="d-flex justify-content-between pt-2">
                  <span className="text-muted small">CyberDNA™ ID:</span>
                  <span className="text-light font-mono small">{selectedScan.cyberDna}</span>
                </div>

                <div className="d-flex justify-content-between pt-2">
                  <span className="text-muted small">Trust Metric:</span>
                  <span className="text-light small">{selectedScan.trustScore}% Trust Score</span>
                </div>

                <div className="d-flex justify-content-between pt-2">
                  <span className="text-muted small">Phishing Probability:</span>
                  <span className="text-light small">{selectedScan.phishingProbability}%</span>
                </div>
                
                <div className="d-flex justify-content-between pt-2">
                  <span className="text-muted small">VirusTotal:</span>
                  <span className="text-light small">
                    {selectedScan.virusTotalStatus === 'Scanned' 
                      ? `${selectedScan.virusTotalPositives}/${selectedScan.virusTotalTotal} engines` 
                      : selectedScan.virusTotalStatus}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-muted small fw-semibold">Detected Heuristic Signatures</span>
                <div className="mt-2 d-flex flex-column gap-1.5">
                  {selectedScan.reasons.map((reason, i) => (
                    <div key={i} className="p-2 rounded-2 bg-dark bg-opacity-20 border border-secondary border-opacity-10 text-muted" style={{ fontSize: '0.82rem' }}>
                      • {reason}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <button 
                  onClick={(e) => downloadPdf(selectedScan.id, e)} 
                  className="btn btn-cyber w-100 d-flex align-items-center justify-content-center gap-2"
                >
                  <FileDown size={16} />
                  <span>Download Report PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
