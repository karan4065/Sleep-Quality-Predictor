import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Activity, Clock, BarChart3, CalendarDays, ShieldAlert, TrendingUp, Lightbulb, Target, AlertTriangle, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';

const API_URL = `${import.meta.env.VITE_APP}/api`;

const DashboardOverview = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({ avgScore: 0, avgDuration: 0, avgStress: 0, avgActivity: 0, consistency: 0, totalRecords: 0, latestCategory: 'N/A' });
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
          const totalDuration = histData.reduce((acc, curr) => acc + (curr.sleep_duration || 0), 0);
          const totalStress = histData.reduce((acc, curr) => acc + (curr.stress_level || 0), 0);
          const totalActivity = histData.reduce((acc, curr) => acc + (curr.physical_activity || 0), 0);
          
          const avgScore = Math.round(totalScore / histData.length);
          const avgDuration = (totalDuration / histData.length).toFixed(1);
          const avgStress = (totalStress / histData.length).toFixed(1);
          const avgActivity = Math.round(totalActivity / histData.length);

          const durations = histData.map(h => h.sleep_duration || 0);
          const variance = durations.reduce((acc, curr) => acc + Math.pow(curr - avgDuration, 2), 0) / durations.length;
          const stdDev = Math.sqrt(variance);
          const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (stdDev * 15))));

          setMetrics({ 
            avgScore, 
            avgDuration,
            avgStress,
            avgActivity,
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
    if (score >= 80) return '#10B981'; // Emerald 500
    if (score >= 60) return '#F59E0B'; // Amber 500
    return '#EF4444'; // Red 500
  };

  const getProgressWidth = () => Math.min(100, (metrics.avgDuration / 8) * 100);

  if (loading) return <div className="fade-in" style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.2rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{getGreeting()}, <span style={{ color: '#3b82f6', fontWeight: '600' }}>{formatName(user?.email)}</span></p>
        </div>
      </header>

      {/* Top Cards - Updated to Grid of 6 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div className="card metric-card" style={{ padding: '1rem 1.25rem', minWidth: '160px' }}>
          <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px' }}><Activity size={20} color="#3b82f6" /></div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg Sleep Score</h3>
          <p className="metric-value" style={{ color: getScoreColor(metrics.avgScore), fontSize: '1.8rem' }}>{metrics.avgScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/100</span></p>
          {history.length > 0 && <div className="badge" style={{ marginTop: '6px', background: `${getScoreColor(metrics.avgScore)}20`, color: getScoreColor(metrics.avgScore), fontSize: '0.75rem', padding: '4px 8px' }}>{metrics.latestCategory}</div>}
        </div>
        <div className="card metric-card" style={{ padding: '1rem 1.25rem', minWidth: '160px' }}>
          <div className="metric-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '6px' }}><Clock size={20} color="#a855f7" /></div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg Duration</h3>
          <p className="metric-value" style={{ fontSize: '1.8rem' }}>{metrics.avgDuration} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>hrs</span></p>
        </div>
        <div className="card metric-card" style={{ padding: '1rem 1.25rem', minWidth: '160px' }}>
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '6px' }}><TrendingUp size={20} color="#10b981" /></div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Consistency</h3>
          <p className="metric-value" style={{ fontSize: '1.8rem' }}>{metrics.consistency}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>%</span></p>
        </div>
        <div className="card metric-card" style={{ padding: '1rem 1.25rem', minWidth: '160px' }}>
          <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '6px' }}><ShieldAlert size={20} color="#ef4444" /></div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg Stress</h3>
          <p className="metric-value" style={{ fontSize: '1.8rem' }}>{metrics.avgStress} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/10</span></p>
        </div>
        <div className="card metric-card" style={{ padding: '1rem 1.25rem', minWidth: '160px' }}>
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '6px' }}><Zap size={20} color="#f59e0b" /></div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg Activity</h3>
          <p className="metric-value" style={{ fontSize: '1.8rem' }}>{metrics.avgActivity} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>mins</span></p>
        </div>
        <div className="card metric-card" style={{ padding: '1rem 1.25rem', minWidth: '160px' }}>
          <div className="metric-icon" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '6px' }}><CalendarDays size={20} color="#ffffff" /></div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Days Tracked</h3>
          <p className="metric-value" style={{ fontSize: '1.8rem' }}>{metrics.totalRecords}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card fade-in" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Sleep Score Trend (Last {Math.min(history.length, 14)} Days)</h2>
        <div style={{ height: '320px' }}>
          {history.length > 1 ? <Line data={chartData} options={chartOptions} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Not enough data for trends yet. Predict your sleep to see it here!</div>}
        </div>
      </div>

      {/* History and Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Recent Sleep History</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Activity</th>
                  <th>Stress</th>
                  <th>Score</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((h, i) => (
                  <tr key={i}>
                    <td>{new Date(h.createdAt).toLocaleDateString()}</td>
                    <td>{h.sleep_duration || h.sleep_time || '-'} hrs</td>
                    <td>{h.physical_activity || '-'} mins</td>
                    <td>{h.stress_level || '-'} / 10</td>
                    <td style={{ color: getScoreColor(h.score), fontWeight: 'bold' }}>{h.score}</td>
                    <td><span className="badge" style={{ background: `${getScoreColor(h.category)}20`, color: getScoreColor(h.category) }}>{h.category}</span></td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No records yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card fade-in">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={20} color="#3b82f6" /> Goal Progress</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Target: 8.0 hrs/night</p>
          <div className="progress-bg" style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div className="progress-fill" style={{ width: `${getProgressWidth()}%`, background: 'linear-gradient(90deg, #3b82f6, #a855f7)', height: '100%', borderRadius: '12px', transition: 'width 1s ease-in-out' }}></div>
          </div>
          <p style={{ marginTop: '12px', fontWeight: 'bold', textAlign: 'right', color: '#f8fafc' }}>{Math.round(getProgressWidth())}% Achieved</p>
        </div>

        <div className="card fade-in">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb size={20} color="#f59e0b" /> AI Insights</h2>
          <ul className="insight-list" style={{ gap: '14px' }}>
            {metrics.avgDuration < 7 && <li style={{ background: 'rgba(255,255,255,0.03)' }}><span style={{ marginRight: '8px' }}>💡</span> You are averaging less than 7 hours of sleep. Try going to bed 30 mins earlier.</li>}
            {metrics.avgStress >= 7 && <li style={{ background: 'rgba(255,255,255,0.03)' }}><span style={{ marginRight: '8px' }}>🧘</span> High average stress detected. Consider relaxation techniques.</li>}
            {metrics.consistency < 75 && <li style={{ background: 'rgba(255,255,255,0.03)' }}><span style={{ marginRight: '8px' }}>⏱️</span> Your sleep consistency is low. Sticking to a strict wake-up time will improve this.</li>}
            {metrics.avgScore >= 80 && <li style={{ background: 'rgba(255,255,255,0.03)' }}><span style={{ marginRight: '8px' }}>⭐</span> Excellent sleep patterns detected! Keep up the current routine.</li>}
            {history.length === 0 && <li style={{ color: 'var(--text-secondary)', border: 'none', background: 'transparent' }}>Predict your sleep to unlock personalized insights.</li>}
          </ul>
        </div>

        <div className="card fade-in" style={{ border: history.length > 0 && (history[0].sleep_duration < 6 || history[0].stress_level > 8) ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.03)' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} color="#ef4444" /> Alerts</h2>
          {history.length > 0 && (history[0].sleep_duration < 6 || history[0].stress_level > 8) ? (
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
              <strong style={{ color: '#ef4444', fontSize: '1.1rem' }}>Attention Required</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '8px', lineHeight: '1.5' }}>
                {history[0].sleep_duration < 6 && '• Your last record shows critically low sleep (< 6 hours). '}
                {history[0].stress_level > 8 && '• Extremely high stress level reported in your last check-in.'}
              </p>
            </div>
          ) : (
             <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
               <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>All Clear!</strong>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '8px' }}>No urgent alerts. Your recent health metrics look stable and safe.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
