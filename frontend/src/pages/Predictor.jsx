import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Moon, Heart, TrendingUp, Trash2, ShieldAlert, User, Briefcase, Zap, Watch } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_APP}/api`;

const Predictor = () => {
  const [formData, setFormData] = useState({
    age: '', gender: 'Male', occupation: 'Software Engineer', sleep_duration: '',
    physical_activity: '', stress_level: '5', bmi_category: 'Normal',
    heart_rate: '', daily_steps: '', blood_pressure: ''
  });
  
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
    if (!formData.blood_pressure.includes('/')) {
        return toast.error("Please enter a valid blood pressure (e.g., 120/80)");
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/sleep-predict`, {
        age: Number(formData.age),
        gender: formData.gender,
        occupation: formData.occupation,
        sleep_duration: Number(formData.sleep_duration),
        physical_activity: Number(formData.physical_activity),
        stress_level: Number(formData.stress_level),
        bmi_category: formData.bmi_category,
        heart_rate: Number(formData.heart_rate),
        daily_steps: Number(formData.daily_steps),
        blood_pressure: formData.blood_pressure
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
    if (category === 'Good') return '#10B981'; // Emerald 500
    if (category === 'Average') return '#F59E0B'; // Amber 500
    return '#EF4444'; // Red 500
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
    if (h.score == null || !h.createdAt) return;
    const date = formatDate(h.createdAt);
    if (date.includes("NaN")) return;

    if (!seenDates.has(date)) {
      seenDates.add(date);
      chartData.push({ date: date, score: Number(h.score) });
    }
  });

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>AI Sleep Quality Predictor</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Enter your lifestyle metrics below to get an AI-powered sleep analysis.</p>
      </div>
      
      <div className="predictor-top-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Main Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <Activity size={24} color="#3b82f6" /> Health & Lifestyle Metrics
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem 1.5rem' }}>
              
              {/* Row 1 */}
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> Age</label>
                <input type="number" className="input-modern" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required placeholder="e.g. 25" min="10" max="100"/>
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> Gender</label>
                <select className="input-modern" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} /> Occupation</label>
                <select className="input-modern" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})}>
                  <option>Software Engineer</option><option>Doctor</option><option>Teacher</option><option>Nurse</option><option>Engineer</option><option>Accountant</option><option>Scientist</option><option>Lawyer</option><option>Salesperson</option><option>Manager</option><option>Other</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Moon size={16} /> Sleep Duration (hours)</label>
                <input type="number" step="0.1" className="input-modern" value={formData.sleep_duration} onChange={e => setFormData({...formData, sleep_duration: e.target.value})} required placeholder="e.g. 7.5"/>
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={16} /> Physical Activity (mins/day)</label>
                <input type="number" className="input-modern" value={formData.physical_activity} onChange={e => setFormData({...formData, physical_activity: e.target.value})} required placeholder="e.g. 60"/>
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldAlert size={16} /> Stress Level (1-10)</label>
                <input type="range" min="1" max="10" className="input-modern" style={{ padding: '0', cursor: 'pointer', height: '6px', appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} value={formData.stress_level} onChange={e => setFormData({...formData, stress_level: e.target.value})} />
                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8', marginTop: '8px', fontWeight: '500' }}>Selected Level: <span style={{ color: '#fff' }}>{formData.stress_level}</span></div>
              </div>

              {/* Row 3 */}
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> BMI Category</label>
                <select className="input-modern" value={formData.bmi_category} onChange={e => setFormData({...formData, bmi_category: e.target.value})}>
                  <option>Underweight</option><option>Normal</option><option>Overweight</option><option>Obese</option>
                </select>
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Heart size={16} /> Heart Rate (bpm)</label>
                <input type="number" className="input-modern" value={formData.heart_rate} onChange={e => setFormData({...formData, heart_rate: e.target.value})} required placeholder="e.g. 70"/>
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Watch size={16} /> Daily Steps</label>
                <input type="number" className="input-modern" value={formData.daily_steps} onChange={e => setFormData({...formData, daily_steps: e.target.value})} required placeholder="e.g. 5000"/>
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Heart size={16} /> Blood Pressure</label>
                <input type="text" className="input-modern" value={formData.blood_pressure} onChange={e => setFormData({...formData, blood_pressure: e.target.value})} required placeholder="e.g. 120/80"/>
              </div>

            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '2.5rem', padding: '1rem', fontSize: '1.1rem', background: 'linear-gradient(90deg, #3b82f6, #a855f7)' }}>
              {loading ? <><div className="spinner"></div> Analyzing Neural Profile...</> : <><Zap size={20} /> Generate AI Sleep Prediction</>}
            </button>
          </form>
        </div>

        {/* Results Card */}
        {result ? (
          <div className="card fade-in" style={{ border: `2px solid ${getScoreColor(result.category)}`, boxShadow: `0 0 30px ${getScoreColor(result.category)}30`, background: 'rgba(15, 23, 42, 0.8)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>AI Analysis Result</h2>
            <div className="score-circle" style={{ '--score-color': getScoreColor(result.category), '--percentage': `${result.score}%`, margin: '0 auto', width: '150px', height: '150px', fontSize: '3rem' }}>
              <span className="score-value" style={{ color: getScoreColor(result.category) }}>{result.score}</span>
            </div>
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <h3 style={{ fontSize: '1.8rem' }}>Overall Quality: <span style={{ color: getScoreColor(result.category) }}>{result.category}</span></h3>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1rem', color: '#f8fafc' }}>Actionable Insights</h3>
              <ul className="suggestion-list" style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                {result.suggestions.map((s, idx) => (
                  <li key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px' }}>
                    <span style={{ marginRight: '10px' }}>✨</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div className="predictor-bottom-row" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Score History List */}
        {history.length > 0 && (
          <div className="card fade-in">
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} color="#a855f7"/> Past Predictions</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {history.map((item, idx) => (
                <div key={idx} className="history-item" style={{ borderLeft: `4px solid ${getScoreColor(item.category)}` }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#f8fafc' }}>Score: {item.score}</div>
                    <div className="history-date">{new Date(item.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="badge" style={{ background: `${getScoreColor(item.category)}20`, color: getScoreColor(item.category) }}>
                      {item.category}
                    </span>
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

        {/* Graph/Chart */}
        {history.length > 1 && (
          <div className="card fade-in" style={{ height: '100%', minHeight: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#f8fafc' }}>Progress Tracking</h2>
            <div style={{ width: '100%', height: 'calc(100% - 3rem)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} dy={15}/>
                  <YAxis domain={[0, 100]} tickCount={6} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} dx={-10}/>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" name="Sleep Score" stroke="url(#colorScore)" strokeWidth={4} dot={{ r: 5, fill: '#3B82F6', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#a855f7' }} />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(6px)' }} onClick={() => !deleting && setDeleteId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center' }} className="fade-in">
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Delete Record?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Are you sure you want to delete this record? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} disabled={deleting} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictor;
