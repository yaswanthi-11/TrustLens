import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3, TrendingUp, ShieldAlert, PieChart } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (err) {
      console.error("Error loading analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-info mb-2" role="status" style={{ color: '#00E5FF' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted small">Loading analytical security parameters...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-5 text-muted">
        Failed to fetch analytics parameters. Make sure backend connection is online.
      </div>
    );
  }

  // 1. Doughnut Chart: Risk Level Distribution
  const riskLabels = Object.keys(data.riskDistribution);
  const riskValues = Object.values(data.riskDistribution);
  
  const riskDistributionData = {
    labels: riskLabels,
    datasets: [{
      label: 'Scans Count',
      data: riskValues,
      backgroundColor: [
        '#22C55E', // Safe (Green)
        '#EAB308', // Low Risk (Yellow)
        '#F97316', // Suspicious (Orange)
        '#EF4444'  // Dangerous (Red)
      ],
      borderColor: '#1E293B',
      borderWidth: 2,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94A3B8',
          font: { family: 'Outfit', size: 12 }
        }
      }
    }
  };

  // 2. Line Chart: Daily Scan Trends
  const dailyLabels = Object.keys(data.dailyTrends);
  const dailyValues = Object.values(data.dailyTrends);

  const dailyTrendsData = {
    labels: dailyLabels.map(d => {
      const parts = d.split('-');
      return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d; // MM/DD formatting
    }),
    datasets: [{
      fill: true,
      label: 'URL Scans',
      data: dailyValues,
      borderColor: '#00E5FF',
      backgroundColor: 'rgba(0, 229, 255, 0.08)',
      tension: 0.4,
      pointBackgroundColor: '#00E5FF',
      pointBorderColor: '#0F172A',
      pointHoverRadius: 6,
      borderWidth: 2,
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#94A3B8', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#94A3B8', precision: 0 }
      }
    }
  };

  // 3. Bar Chart: Threat Category Breakdown
  const categoryLabels = Object.keys(data.threatCategoryBreakdown);
  const categoryValues = Object.values(data.threatCategoryBreakdown);

  const categoryBreakdownData = {
    labels: categoryLabels,
    datasets: [{
      label: 'Rule Triggers',
      data: categoryValues,
      backgroundColor: 'rgba(0, 229, 255, 0.4)',
      borderColor: '#00E5FF',
      borderWidth: 1.5,
      borderRadius: 4,
    }]
  };

  const barOptions = {
    indexAxis: 'y', // Horizontal bar chart!
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#94A3B8', precision: 0 }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#F8FAFC', font: { family: 'Outfit', size: 11 } }
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="font-display fw-bold text-light mb-1">Analytics Hub</h2>
        <p className="text-muted">Explore threat frequencies, heuristic activations, and risk profiles.</p>
      </div>

      <div className="row g-4">
        {/* Daily Scan Trends Line Chart */}
        <div className="col-lg-8">
          <div className="card glass-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-info" />
              <h4 className="fs-5 fw-bold text-light mb-0 font-display">Daily Scan Activity (Last 14 Days)</h4>
            </div>
            <div style={{ height: '300px', position: 'relative' }}>
              {dailyValues.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  Insufficient timeline metrics. Start scans to populate timeline graphs.
                </div>
              ) : (
                <Line data={dailyTrendsData} options={lineOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Risk Level Distribution Doughnut Chart */}
        <div className="col-lg-4">
          <div className="card glass-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-4">
              <PieChart size={18} className="text-info" />
              <h4 className="fs-5 fw-bold text-light mb-0 font-display">Risk Profile Ratio</h4>
            </div>
            <div style={{ height: '300px', position: 'relative' }}>
              {riskValues.every(v => v === 0) ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  No scan metrics recorded.
                </div>
              ) : (
                <Doughnut data={riskDistributionData} options={doughnutOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Threat Category Breakdown Horizontal Bar Chart */}
        <div className="col-lg-12">
          <div className="card glass-card p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-info" />
              <h4 className="fs-5 fw-bold text-light mb-0 font-display">Heuristic Threat Vector Incidences</h4>
            </div>
            <div style={{ height: '350px', position: 'relative' }}>
              {categoryValues.every(v => v === 0) ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  No heuristic matches compiled. Complete threat audits.
                </div>
              ) : (
                <Bar data={categoryBreakdownData} options={barOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
