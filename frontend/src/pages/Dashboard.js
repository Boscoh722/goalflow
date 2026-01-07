import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import {
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  TrendingDown
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentGoals, setRecentGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [goalsRes, analyticsRes] = await Promise.all([
        axiosInstance.get('/api/goals'),
        axiosInstance.get('/api/goals/analytics')
      ]);

      setStats(goalsRes.data?.stats || null);
      setRecentGoals(goalsRes.data?.goals?.slice(0, 5) || []);
      setAnalytics(analyticsRes.data || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'in-progress':
        return <TrendingUp className="text-blue-500" size={18} />;
      case 'behind-schedule':
        return <TrendingDown className="text-red-500" size={18} />;
      default:
        return <Clock className="text-gray-500" size={18} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track your progress and stay motivated
          </p>
        </div>
        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center space-x-2"
          onClick={() => navigate('/goals/new')}
        >
          <Plus size={20} />
          <span>New Goal</span>
        </motion.button> */}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Total Goals',
              value: stats.totalGoals,
              icon: <Target className="text-primary-600" size={24} />,
              bg: 'bg-primary-50'
            },
            {
              label: 'Completed',
              value: stats.completedGoals,
              icon: <CheckCircle className="text-green-600" size={24} />,
              bg: 'bg-green-50'
            },
            {
              label: 'Avg Progress',
              value: `${stats.averageProgress}%`,
              icon: <TrendingUp className="text-blue-600" size={24} />,
              bg: 'bg-blue-50'
            },
            {
              label: 'Behind Schedule',
              value: stats.behindSchedule,
              icon: <Clock className="text-red-600" size={24} />,
              bg: 'bg-red-50'
            }
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">{card.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-full ${card.bg}`}>
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Goals */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Goals
          </h2>

          <div className="space-y-4">
            {recentGoals.map((goal, index) => (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {goal.title}
                  </h3>
                  {getStatusIcon(goal.status)}
                </div>

                <p className="text-gray-600 text-sm mb-3">
                  {goal.description}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex-1 progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${goal.currentProgress}%` }}
                    />
                  </div>
                  <span className="font-bold text-primary-600">
                    {goal.currentProgress}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="card min-h-[320px]">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Goal Distribution
            </h2>

            <div className="w-full h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.categoryData || {}).map(
                      ([name, value]) => ({ name, value })
                    )}
                    dataKey="value"
                    outerRadius={80}
                    label
                  >
                    {Object.entries(analytics.categoryData || {}).map(
                      (_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
