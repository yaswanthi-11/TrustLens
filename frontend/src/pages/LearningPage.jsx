import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';

const TOPICS = ['All', 'Phishing Attacks', 'Social Engineering', 'Safe Browsing', 'Password Security', 'Scam Detection'];

const LearningPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get('/learning');
        setArticles(res.data);
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filtered = articles.filter(a => {
    const matchesTopic = selectedTopic === 'All' || a.topic === selectedTopic;
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const topicColors = {
    'Phishing Attacks': '#EF4444',
    'Social Engineering': '#F97316',
    'Safe Browsing': '#22C55E',
    'Password Security': '#00E5FF',
    'Scam Detection': '#EAB308',
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="font-display fw-bold text-light mb-1">Learning Center</h2>
        <p className="text-muted">Sharpen your cybersecurity posture with expert-authored intelligence articles.</p>
      </div>

      <div className="row g-3 mb-4 align-items-center">
        <div className="col-md-5">
          <div className="position-relative">
            <input
              type="text"
              className="form-control form-control-custom ps-5"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="position-absolute text-muted" size={16} style={{ left: '16px', top: '14px' }} />
          </div>
        </div>
        <div className="col-md-7 d-flex flex-wrap gap-2">
          {TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className="btn btn-sm"
              style={{
                borderRadius: '20px',
                border: `1px solid ${selectedTopic === topic ? (topicColors[topic] || '#00E5FF') : 'rgba(255,255,255,0.1)'}`,
                background: selectedTopic === topic ? `${topicColors[topic] || '#00E5FF'}20` : 'transparent',
                color: selectedTopic === topic ? (topicColors[topic] || '#00E5FF') : '#94A3B8',
                fontWeight: 600, fontSize: '0.78rem'
              }}
            >{topic}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info mb-2" role="status" style={{ color: '#00E5FF' }}><span className="visually-hidden">Loading...</span></div>
          <p className="text-muted small">Loading intelligence archive...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted border border-dashed rounded-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
          <BookOpen size={32} className="mb-2 text-secondary" />
          <p className="mb-0">No articles match current filters.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(article => (
            <div className="col-lg-6" key={article.id}>
              <div className="card glass-card p-4 h-100" style={{ borderLeft: `4px solid ${topicColors[article.topic] || '#00E5FF'}` }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge" style={{ background: `${topicColors[article.topic] || '#00E5FF'}20`, color: topicColors[article.topic] || '#00E5FF', border: `1px solid ${topicColors[article.topic] || '#00E5FF'}30`, fontSize: '0.72rem' }}>
                    {article.topic}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>By {article.author}</span>
                </div>
                <h5 className="font-display fw-bold text-light mb-2">{article.title}</h5>
                <p className="text-muted mb-3" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                  {expandedId === article.id ? article.content : article.content.substring(0, 150) + (article.content.length > 150 ? '...' : '')}
                </p>
                <button
                  onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                  className="btn btn-sm btn-cyber-outline d-flex align-items-center gap-1"
                  style={{ fontSize: '0.8rem' }}
                >
                  {expandedId === article.id ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Read More</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPage;
