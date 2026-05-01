import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

const Charts = ({ ordersByDate, revenueByDate, orderStatusStats }) => {
  if (!ordersByDate || !revenueByDate || !orderStatusStats) return null;

  const pieData = [
    { name: 'Pending', value: orderStatusStats?.pending || 0 },
    { name: 'Completed', value: orderStatusStats?.completed || 0 },
    { name: 'Cancelled', value: orderStatusStats?.cancelled || 0 },
  ];

  const formatXAxisDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const shortYear = year ? year.slice(-2) : '';
    return `${day}-${month}-${shortYear}`;
  };

  const chartStyle = {
    backgroundColor: '#0f172a',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.05)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Line Chart - Orders Overview */}
        <div style={chartStyle} className="fade-in">
          <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Orders Overview (Last 7 Days)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} axisLine={false} tickLine={false} tickFormatter={formatXAxisDate} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: 'white' }}
                />
                <Line type="monotone" dataKey="count" name="Orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Revenue */}
        <div style={{...chartStyle, animationDelay: '0.1s'}} className="fade-in">
          <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Revenue (Last 7 Days)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} axisLine={false} tickLine={false} tickFormatter={formatXAxisDate} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  itemStyle={{ color: 'white' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Chart - Status */}
      <div style={{...chartStyle, animationDelay: '0.2s', width: '100%', maxWidth: '100%'}} className="fade-in">
        <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Order Status Breakdown</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} 
                itemStyle={{ color: 'white' }}
              />
              <Legend 
                wrapperStyle={{ color: 'white', paddingTop: '20px' }} 
                formatter={(value, entry) => `${value} (${entry.payload.value})`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
