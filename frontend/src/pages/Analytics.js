import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axios';
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Activity,
  CheckCircle,
  Clock,
  Flag,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [goals, setGoals] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  const STATUS_COLORS = ['#94a3b8', '#0ea5e9', '#10b981', '#ef4444'];
  const CATEGORY_COLORS = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [goalsRes, analyticsRes] = await Promise.all([
        axiosInstance.get('/api/goals'),
        axiosInstance.get('/api/goals/analytics'),
      ]);

      setGoals(goalsRes.data.goals || []);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSeriesData = () => {
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthGoals = goals.filter(goal => {
        const goalDate = new Date(goal.createdAt);
        return goalDate.getMonth() === date.getMonth() && goalDate.getFullYear() === date.getFullYear();
      });

      const avgProgress =
        monthGoals.length > 0
          ? monthGoals.reduce((sum, g) => sum + g.currentProgress, 0) / monthGoals.length
          : 0;

      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        goals: monthGoals.length,
        progress: Math.round(avgProgress),
        score: monthGoals.length * 10 + Math.round(avgProgress * 0.5),
      });
    }

    return data;
  };

  const getStatusDistribution = () => {
    const counts = {
      'Not Started': 0,
      'In Progress': 0,
      Completed: 0,
      'Behind Schedule': 0,
    };

    goals.forEach(goal => {
      const status = goal.status
        .replace('-', ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    const updates = goals.flatMap(g => g.progressUpdates || []).sort((a, b) => new Date(b.date) - new Date(a.date));

    let date = new Date(today);
    for (let i = 0; i < 30; i++) {
      const dateStr = date.toISOString().split('T')[0];
      const hasUpdate = updates.some(u => new Date(u.date).toISOString().split('T')[0] === dateStr);
      if (hasUpdate) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  const timeSeriesData = getTimeSeriesData();
  const statusData = getStatusDistribution();
  const streak = calculateStreak();
  const completionRate = analytics?.completionRate || 0;
  const totalScore = goals.reduce((sum, g) => sum + Math.round(g.currentProgress / 10), 0);
  const overdueGoals = goals.filter(g => new Date(g.targetDate) < new Date() && g.status !== 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Professional insights for your goals</p>
        </div>
        <select
          className="input-field mt-4 md:mt-0"
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Completion Rate', value: `${completionRate.toFixed(1)}%`, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Current Streak', value: `${streak} days`, icon: Activity, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Score', value: `${totalScore} pts`, icon: Award, color: 'bg-purple-50 text-purple-600' },
          { label: 'Overdue Goals', value: overdueGoals, icon: Clock, color: 'bg-red-50 text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">{label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
              </div>
              <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Over Time */}
        <div className="card h-80">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Progress Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="progress" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Performance */}
        <div className="card h-80">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} /> Monthly Performance
          </h2>
          <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="score" stroke="#d946ef" strokeWidth={3} name="Score" />
              <Line dataKey="goals" stroke="#10b981" strokeWidth={3} name="Goals Created" />
              <Line dataKey="progress" stroke="#0ea5e9" strokeWidth={3} name="Avg Progress" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Pie */}
        <div className="card h-96">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock size={20} /> Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={350} minHeight={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" outerRadius={100} label>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card h-96">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Flag size={20} /> Category Distribution
          </h2>
          <ResponsiveContainer width="100%" height={350} minHeight={250}>
            <PieChart>
              <Pie
                data={Object.entries(analytics?.categoryData || {}).map(([name, value]) => ({ name, value }))}
                dataKey="value"
                outerRadius={100}
                label
              >
                {Object.entries(analytics?.categoryData || {}).map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
