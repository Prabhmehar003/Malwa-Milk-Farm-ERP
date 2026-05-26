import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import KPICard from '../components/KPICard';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Droplets, TrendingUp, Calendar, DollarSign, Milk } from 'lucide-react';
import { motion } from 'framer-motion';
import { API } from '../lib/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, chartsRes] = await Promise.all([
        axios.get(`${API}/analytics/dashboard`, { withCredentials: true }),
        axios.get(`${API}/analytics/charts`, { withCredentials: true }),
      ]);
      setAnalytics(analyticsRes.data);
      setChartData(chartsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2563EB', '#D4AF37'];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 min-h-screen bg-[#050B14] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen bg-[#050B14] p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tighter text-white mb-2">Dashboard</h1>
              <p className="text-slate-400">Overview of your dairy farm operations</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <KPICard
                  title="Today's Quantity"
                  value={`${analytics?.today_quantity?.toFixed(1) || 0} L`}
                  change={analytics?.quantity_change || 0}
                  icon={Droplets}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <KPICard
                  title="Today's Revenue"
                  value={`₹${analytics?.today_revenue?.toFixed(0) || 0}`}
                  change={analytics?.revenue_change || 0}
                  icon={DollarSign}
                  isPremium
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <KPICard
                  title="15-Day Avg Qty"
                  value={`${analytics?.avg_15_day_quantity?.toFixed(1) || 0} L`}
                  change={0}
                  icon={Calendar}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <KPICard
                  title="15-Day Avg Rev"
                  value={`₹${analytics?.avg_15_day_revenue?.toFixed(0) || 0}`}
                  change={0}
                  icon={TrendingUp}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <KPICard
                  title="30-Day Avg Qty"
                  value={`${analytics?.avg_30_day_quantity?.toFixed(1) || 0} L`}
                  change={0}
                  icon={Calendar}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <KPICard
                  title="30-Day Avg Rev"
                  value={`₹${analytics?.avg_30_day_revenue?.toFixed(0) || 0}`}
                  change={0}
                  icon={DollarSign}
                />
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-2 glass-card p-6"
              >
                <h2 className="text-xl font-medium text-white mb-4">30-Day Revenue Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData?.daily_trend || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B1221',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#colorRev)" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Milk Type Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-card p-6"
              >
                <h2 className="text-xl font-medium text-white mb-4">Milk Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData?.milk_distribution || []}
                      dataKey="quantity"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {(chartData?.milk_distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B1221',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Quantity Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-medium text-white mb-4">30-Day Production Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData?.daily_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1221',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Bar dataKey="quantity" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
