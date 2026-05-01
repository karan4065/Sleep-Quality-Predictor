import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Activity, Clock, BarChart3, CalendarDays, ShieldAlert, TrendingUp, Lightbulb, Target, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';

const API_URL = 'http://localhost:3001/api';

const DashboardOverview = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({ avgScore: 0, avgDuration: 0, consistency: 0, totalRecords: 0, latestCategory: 'N/A' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const historyRes = await axios.get(`${API_URL}/history`);
        
        // Deduplicate: keep only the first predicting value for each day
        const uniqueHistData = [];
        const seenDates = new Set();
        
        [...historyRes.data].reverse().forEach(h => {
          if (h.score == null || !h.createdAt) return;
          const date = new Date(h.createdAt).toLocaleDateString();
          if (date.includes("NaN")) return;

          if (!seenDates.has(date)) {
            seenDates.add(date);
            uniqueHistData.push(h);
          }
        });
        
        // Revert back to newest-first order
        const histData = uniqueHistData.reverse();
        
        setHistory(histData);

        if (histData.length > 0) {
          const totalScore = histData.reduce((acc, curr) => acc + curr.score, 0);
          const totalDuration = histData.reduce((acc, curr) => acc + curr.sleep_time, 0);
          
          const avgScore = Math.round(totalScore / histData.length);
          const avgDuration = (totalDuration / histData.length).toFixed(1);

          const durations = histData.map(h => h.sleep_time);
          const variance = durations.reduce((acc, curr) => acc + Math.pow(curr - avgDuration, 2), 0) / durations.length;
          const stdDev = Math.sqrt(variance);
          const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (stdDev * 15))));

          setMetrics({ 
            avgScore, 
            avgDuration, 
            consistency: consistencyScore, 
            totalRecords: histData.length,
            latestCategory: histData[0]?.category || 'N/A'
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatName = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const chartData = {
    labels: [...history].reverse().slice(-14).map(h => new Date(h.createdAt).toLocaleDateString()),
    datasets: [{
      label: 'Sleep Score',
      data: [...history].reverse().slice(-14).map(h => h.score),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#9BAACB' }, grid: { color: 'rgba(255,255,255,0.03)' } },
      x: { ticks: { color: '#9BAACB' }, grid: { color: 'rgba(255,255,255,0.03)' } }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getProgressWidth = () => Math.min(100, (metrics.avgDuration / 8) * 100);

  if (loading) return <div className="fade-in" style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div className="fade-in">
      <header className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{getGreeting()}, <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{formatName(user?.email)}</span></p>
        </div>
      </header>

      {/* Top 4 Cards */}
      <div className="grid-4">
        <div className="card metric-card">
          <div className="metric-icon"><Activity size={20} color="var(--primary)" /></div>
          <h3>Avg Sleep Score</h3>
          <p className="metric-value" style={{ color: getScoreColor(metrics.avgScore) }}>{metrics.avgScore} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/100</span></p>
          <div className="badge" style={{ marginTop: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>{metrics.latestCategory}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Clock size={20} color="var(--secondary)" /></div>
          <h3>Avg Duration</h3>
          <p className="metric-value">{metrics.avgDuration} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>hrs</span></p>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><TrendingUp size={20} color="var(--success)" /></div>
          <h3>Consistency</h3>
          <p className="metric-value">{metrics.consistency}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>%</span></p>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><CalendarDays size={20} color="var(--warning)" /></div>
          <h3>Days Tracked</h3>
          <p className="metric-value">{metrics.totalRecords}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card fade-in" style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ marginBottom: '1rem' }}>Sleep Score Trend (Last {Math.min(history.length, 14)} Days)</h2>
        <div style={{ height: '300px' }}>
          {history.length > 1 ? <Line data={chartData} options={chartOptions} /> : <p style={{ color: 'var(--text-secondary)' }}>Need more data for trends.</p>}
        </div>
      </div>

      {/* History and Insights */}
      <div className="grid-2">
        <div className="card fade-in">
          <h2 style={{ marginBottom: '1rem' }}>Recent Sleep History</h2>
          <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Score</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((h, i) => (
                  <tr key={i}>
                    <td>{new Date(h.createdAt).toLocaleDateString()}</td>
                    <td>{h.sleep_time} hrs</td>
                    <td style={{ color: getScoreColor(h.score), fontWeight: 'bold' }}>{h.score}</td>
                    <td><span className={`badge ${h.category.toLowerCase()}`}>{h.category}</span></td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No records yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card fade-in">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb size={20} color="var(--warning)" /> AI Insights</h2>
          <ul className="insight-list">
            {metrics.avgDuration < 7 && <li><span></span> You are averaging less than 7 hours of sleep. Try going to bed 30 mins earlier.</li>}
            {metrics.consistency < 75 && <li><span></span> Your sleep consistency is low. Sticking to a strict wake-up time will improve this.</li>}
            {metrics.avgScore >= 80 && <li><span></span> Excellent sleep patterns detected! Keep up the current routine.</li>}
            {history.length === 0 && <li style={{ color: 'var(--text-secondary)' }}>Predict your sleep to unlock personalized insights.</li>}
            {history.length > 0 && metrics.avgDuration >= 7 && metrics.avgScore < 80 && <li><span></span> You sleep enough hours, but quality is low. Reduce screen time before bed.</li>}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid-3">
        <div className="card fade-in">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={20} color="var(--primary)" /> Goal Progress</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Target: 8.0 hrs/night</p>
          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${getProgressWidth()}%` }}></div>
          </div>
          <p style={{ marginTop: '8px', fontWeight: 'bold', textAlign: 'right' }}>{Math.round(getProgressWidth())}% Achieved</p>
        </div>

        <div className="card fade-in">
          <h2 style={{ marginBottom: '1rem' }}>Weekly Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="summary-row"><span>Avg Score:</span> <strong>{metrics.avgScore}</strong></div>
            <div className="summary-row"><span>Best Sleep:</span> <strong style={{ color: 'var(--success)' }}>{history.length > 0 ? Math.max(...history.slice(0,7).map(h=>h.score)) : '-'}</strong></div>
            <div className="summary-row"><span>Worst Sleep:</span> <strong style={{ color: 'var(--error)' }}>{history.length > 0 ? Math.min(...history.slice(0,7).map(h=>h.score)) : '-'}</strong></div>
          </div>
        </div>

        <div className="card fade-in" style={{ border: history.length > 0 && history[0].sleep_time < 6 ? '1px solid var(--error)' : '' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} color="var(--primary)" /> Alerts</h2>
          {history.length > 0 && history[0].sleep_time < 6 ? (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--error)' }}>
              <strong>Low Sleep Duration Detected</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Your last record shows less than 6 hours of sleep. Please prioritize rest.</p>
            </div>
          ) : (
             <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
               <strong>All Clear!</strong>
               <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>No urgent alerts. Your recent sleep looks stable.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
