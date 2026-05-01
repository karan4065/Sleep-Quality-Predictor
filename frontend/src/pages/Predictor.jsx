import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Moon, Monitor, TrendingUp, Trash2, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_APP}/api`;

const Predictor = () => {
  const [formData, setFormData] = useState({ screen_time: '', sleep_time: '', physical_activity: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/history/${deleteId}`);
      setHistory(prev => prev.filter(item => item._id !== deleteId));
      toast.success('Record deleted successfully');
    } catch (error) {
      toast.error('Failed to delete record');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getScoreColor = (category) => {
    if (category === 'Good') return 'var(--success)';
    if (category === 'Average') return 'var(--warning)';
    return 'var(--error)';
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const chartData = [];
  const seenDates = new Set();
  
  [...history].reverse().forEach(h => {
    if (h.score == null || !h.createdAt) return; // Ignore missing data
    const date = formatDate(h.createdAt);
    if (date.includes("NaN")) return; // Ignore invalid dates

    if (!seenDates.has(date)) {
      seenDates.add(date);
      chartData.push({
        date: date,
        score: Number(h.score)
      });
    }
  });

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Sleep Quality Predictor</h1>
      
      {/* Top Section */}
      <div className="predictor-top-row">
        {/* Left Column: Form */}
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

        {/* Right Column: Result */}
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
      </div>

      {/* Bottom Section */}
      <div className="predictor-bottom-row">
        {/* Score History */}
        {history.length > 0 && (
          <div className="card fade-in">
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} /> Score History</h2>
            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
              {history.map((item, idx) => (
                <div key={idx} className="history-item">
                  <div>
                    <div style={{ fontWeight: '600' }}>Score: {item.score}</div>
                    <div className="history-date">{new Date(item.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${item.category.toLowerCase()}`}>{item.category}</span>
                    <button
                      onClick={() => setDeleteId(item._id)}
                      title="Delete record"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(239, 68, 68, 0.6)', padding: '4px',
                        borderRadius: '6px', display: 'flex', alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239, 68, 68, 0.6)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(6px)'
          }}
          onClick={() => !deleting && setDeleteId(null)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
              }}
              className="fade-in"
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
              }}>
                <Trash2 size={22} color="#ef4444" />
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Delete Record?</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Are you sure you want to delete this record? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  style={{
                    padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                    fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                    background: '#ef4444', color: 'white', cursor: deleting ? 'not-allowed' : 'pointer',
                    fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.2s',
                    opacity: deleting ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {deleting ? <><div className="spinner" style={{ width: '16px', height: '16px' }}></div> Deleting...</> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Graph/Chart */}
        {history.length > 1 && (
          <div className="card fade-in" style={{ height: '400px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Score Trends For Each Day</h2>
            <div style={{ width: '100%', height: 'calc(100% - 2rem)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "#94a3b8", fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[40, 100]} 
                    tickCount={7} 
                    tick={{ fill: "#94a3b8", fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name="Score"
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictor;
