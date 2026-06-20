import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Search, Trash2, FileDown, AlertTriangle } from 'lucide-react';

const AdminPage = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchScans = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `/admin/scans?query=${encodeURIComponent(search)}` : '/admin/scans';
      const res = await api.get(url);
      setScans(res.data);
    } catch (err) {
      console.error('Admin fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScans(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchScans(query);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this scan record?')) return;
    try {
      await api.delete(`/admin/scan/${id}`);
      setScans(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Delete failed. Check console.');
    }
  };

  const downloadPdf = async (id) => {
    try {
      const res = await api.get(`/scan/${id}/report`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `trustlensx-report-${id}.pdf`;
      link.click();
    } catch { alert('PDF export failed.'); }
  };

  const getThreatColor = (level) => {
    const map = { safe: '#22C55E', 'low risk': '#EAB308', suspicious: '#F97316', dangerous: '#EF4444' };
    return map[level?.toLowerCase()] || '#94A3B8';
  };

  return (
    <div className="container-fluid">
      <div className="mb-4 d-flex align-items-center gap-3">
        <div className="p-2 bg-danger bg-opacity-10 rounded-3 border border-danger border-opacity-20">
          <Shield size={24} className="text-danger" />
        </div>
        <div>
          <h2 className="font-display fw-bold text-light mb-0">Admin Terminal</h2>
          <p className="text-muted small mb-0">Global scan log management console — ROLE_ADMIN access only</p>
        </div>
      </div>

      <div className="card glass-card p-4">
        <form onSubmit={handleSearch} className="d-flex gap-3 mb-4">
          <div className="position-relative flex-grow-1">
            <input
              type="text"
              className="form-control form-control-custom ps-5"
              placeholder="Search by URL, domain, threat level..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Search className="position-absolute text-muted" size={16} style={{ left: '16px', top: '14px' }} />
          </div>
          <button type="submit" className="btn btn-cyber px-4">Search</button>
          <button type="button" onClick={() => { setQuery(''); fetchScans(); }} className="btn btn-cyber-outline px-3">Reset</button>
        </form>

        <div className="d-flex align-items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-warning" />
          <span className="text-muted small">Showing <strong className="text-light">{scans.length}</strong> scan records. Delete actions are irreversible.</span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status" style={{ color: '#00E5FF' }}><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-5 text-muted small border border-dashed rounded-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
            No records match the query.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-muted" style={{ fontSize: '0.78rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ background: 'transparent' }}>ID</th>
                  <th style={{ background: 'transparent' }}>URL TARGET</th>
                  <th style={{ background: 'transparent' }}>VERDICT</th>
                  <th style={{ background: 'transparent' }}>CYBERDNA</th>
                  <th style={{ background: 'transparent' }}>VT STATUS</th>
                  <th style={{ background: 'transparent' }}>SCAN DATE</th>
                  <th style={{ background: 'transparent' }} className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {scans.map(scan => (
                  <tr key={scan.id} className="border-bottom border-secondary border-opacity-10" style={{ fontSize: '0.87rem' }}>
                    <td style={{ background: 'transparent' }} className="text-muted">#{scan.id}</td>
                    <td style={{ background: 'transparent', maxWidth: '200px' }} className="text-truncate text-light fw-medium">{scan.url}</td>
                    <td style={{ background: 'transparent' }}>
                      <span style={{ color: getThreatColor(scan.threatLevel), fontWeight: 600 }}>
                        {scan.threatLevel} ({scan.riskScore})
                      </span>
                    </td>
                    <td style={{ background: 'transparent' }} className="text-muted font-mono" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>{scan.cyberDna}</td>
                    <td style={{ background: 'transparent' }}>
                      <span className={`badge bg-opacity-10 border border-opacity-20 ${scan.virusTotalStatus === 'Scanned' ? 'bg-success text-success border-success' : scan.virusTotalStatus === 'Failed' ? 'bg-danger text-danger border-danger' : 'bg-secondary text-secondary border-secondary'}`} style={{ fontSize: '0.72rem' }}>
                        {scan.virusTotalStatus === 'Scanned' ? `${scan.virusTotalPositives}/${scan.virusTotalTotal}` : scan.virusTotalStatus}
                      </span>
                    </td>
                    <td style={{ background: 'transparent' }} className="text-muted small">
                      {new Date(scan.scanDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ background: 'transparent' }} className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button onClick={() => downloadPdf(scan.id)} className="btn btn-sm btn-outline-info p-1 border-opacity-20" title="Export PDF">
                          <FileDown size={13} style={{ color: '#00E5FF' }} />
                        </button>
                        <button onClick={() => handleDelete(scan.id)} className="btn btn-sm btn-outline-danger p-1 border-opacity-20" title="Delete Record">
                          <Trash2 size={13} />
                        </button>
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
  );
};

export default AdminPage;
