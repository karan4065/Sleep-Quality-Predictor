import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Activity, Moon, Monitor, TrendingUp, LogOut } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_APP}/api`;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({ screen_time: '', sleep_time: '', physical_activity: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (error) {
      toast.error('Failed to fetch your history.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/sleep-predict`, {
        screen_time: Number(formData.screen_time),
        sleep_time: Number(formData.sleep_time),
        physical_activity: Number(formData.physical_activity)
      });
      setResult(res.data);
      toast.success('Prediction generated successfully!');
      fetchHistory();
    } catch (error) {
      toast.error('Prediction failed. Ensure backend & ML API are running.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (category) => {
    if (category === 'Good') return 'var(--success)';
    if (category === 'Average') return 'var(--warning)';
    return 'var(--error)';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatName = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };
  
  const chartData = {
    labels: [...history].reverse().map(h => new Date(h.createdAt).toLocaleDateString()),
    datasets: [{
      label: 'Sleep Quality Score',
      data: [...history].reverse().map(h => h.score),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#f8fafc' } },
      title: { display: false }
    },
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return (
    <div className="app-container fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Sleep Quality Predictor</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{getGreeting()}, <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{formatName(user?.email)}</span></p>
        </div>
        <button onClick={() => { logout(); toast.success('Logged out'); }} className="btn-secondary">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="card">
            <h2>Enter Daily Metrics</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label><Monitor size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Screen Time (hours)</label>
                <input type="number" step="0.1" className="input-modern" value={formData.screen_time} onChange={e => setFormData({...formData, screen_time: e.target.value})} required placeholder="e.g., 4.5"/>
              </div>
              <div className="input-group">
                <label><Moon size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Sleep Time (hours)</label>
                <input type="number" step="0.1" className="input-modern" value={formData.sleep_time} onChange={e => setFormData({...formData, sleep_time: e.target.value})} required placeholder="e.g., 7.5"/>
              </div>
              <div className="input-group">
                <label><Activity size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Physical Activity (minutes)</label>
                <input type="number" className="input-modern" value={formData.physical_activity} onChange={e => setFormData({...formData, physical_activity: e.target.value})} required placeholder="e.g., 45"/>
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                {loading ? <><div className="spinner"></div> Analyzing...</> : 'Predict Sleep Quality'}
              </button>
            </form>
          </div>
          {history.length > 0 && (
            <div className="card">
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} /> Score History</h2>
              <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                {history.map((item, idx) => (
                  <div key={idx} className="history-item">
                    <div>
                      <div style={{ fontWeight: '600' }}>Score: {item.score}</div>
                      <div className="history-date">{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                    <span className={`badge ${item.category.toLowerCase()}`}>{item.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {result ? (
            <div className="card fade-in" style={{ border: `1px solid ${getScoreColor(result.category)}`, boxShadow: `0 0 20px ${getScoreColor(result.category)}20` }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Analysis Result</h2>
              <div className="score-circle" style={{ '--score-color': getScoreColor(result.category), '--percentage': `${result.score}%` }}>
                <span className="score-value" style={{ color: getScoreColor(result.category) }}>{result.score}</span>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3>Category: <span style={{ color: getScoreColor(result.category) }}>{result.category}</span></h3>
              </div>
              <h3>Personalized Suggestions</h3>
              <ul className="suggestion-list">
                {result.suggestions.map((s, idx) => (<li key={idx}><span>💡</span> {s}</li>))}
              </ul>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Submit your daily metrics to see your personalized sleep quality analysis.</p>
            </div>
          )}
          {history.length > 1 && (
            <div className="card fade-in">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
