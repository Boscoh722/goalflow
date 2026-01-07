import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Award,
  Calendar,
  Edit2,
  Camera,
  Save,
  X,
  Bell,
  Shield,
  LogOut,
  TrendingUp,
  Target,
  CheckCircle
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
      fetchUserStats();
    }
  }, [user]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchUserStats = async () => {
    try {
      const response = await axiosInstance.get('/api/goals');
      const goals = response.data.goals;
      
      const completed = goals.filter(g => g.status === 'completed').length;
      const inProgress = goals.filter(g => g.status === 'in-progress').length;
      const avgProgress = goals.length > 0 
        ? goals.reduce((acc, goal) => acc + goal.currentProgress, 0) / goals.length
        : 0;
      
      setStats({
        totalGoals: goals.length,
        completed,
        inProgress,
        avgProgress: Math.round(avgProgress),
        streak: 7, // This would come from backend in real implementation
        score: user?.score || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, you would make an API call to update user profile
      // const response = await axios.put('/api/users/profile', formData);
      // updateUser(response.data.user);
      
      // For demo, just update local state
      updateUser({ ...user, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings</p>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors mt-4 md:mt-0"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center overflow-hidden">
                          {formData.avatar ? (
                            <img 
                              src={formData.avatar} 
                              alt={formData.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl font-bold text-primary-600">
                              {formData.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        {isEditing && (
                          <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <Camera size={20} className="text-gray-600" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                          </label>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Award className="text-yellow-500" size={16} />
                          <span className="font-medium">{user.score || 0} Achievement Points</span>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg">{user.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        ) : (
                          <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                            <Mail size={18} className="text-gray-400 mr-3" />
                            <span>{user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                        <Calendar size={18} className="text-gray-400 mr-3" />
                        <span>{new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Save size={20} />
                          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Stats Card */}
              {stats && (
                <div className="card">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Your Statistics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { 
                        label: 'Total Goals', 
                        value: stats.totalGoals, 
                        icon: <Target className="text-blue-600" size={20} />,
                        color: 'bg-blue-50'
                      },
                      { 
                        label: 'Completed', 
                        value: stats.completed, 
                        icon: <CheckCircle className="text-green-600" size={20} />,
                        color: 'bg-green-50'
                      },
                      { 
                        label: 'In Progress', 
                        value: stats.inProgress, 
                        icon: <TrendingUp className="text-yellow-600" size={20} />,
                        color: 'bg-yellow-50'
                      },
                      { 
                        label: 'Avg Progress', 
                        value: `${stats.avgProgress}%`, 
                        icon: <Award className="text-purple-600" size={20} />,
                        color: 'bg-purple-50'
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                          {stat.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  {[
                    { label: 'Goal Reminders', description: 'Get reminders for upcoming deadlines' },
                    { label: 'Progress Updates', description: 'Notifications when you update progress' },
                    { label: 'Partner Activity', description: 'Updates from your accountability partners' },
                    { label: 'Weekly Reports', description: 'Weekly summary of your progress' }
                  ].map((pref, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{pref.label}</h3>
                        <p className="text-sm text-gray-500">{pref.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Display Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select className="input-field">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select className="input-field">
                      <option value="utc">UTC</option>
                      <option value="est">Eastern Time</option>
                      <option value="pst">Pacific Time</option>
                      <option value="cst">Central Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button type="button" className="btn-primary">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Public Profile</h3>
                      <p className="text-sm text-gray-500">Allow others to find you by email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Goal Visibility</h3>
                      <p className="text-sm text-gray-500">Share goals with accountability partners</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Achievement Card */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
            <div className="space-y-4">
              {[
                { 
                  title: 'Goal Setter', 
                  description: 'Created your first goal',
                  achieved: true,
                  icon: '🎯'
                },
                { 
                  title: 'Consistency King', 
                  description: '7-day update streak',
                  achieved: stats?.streak >= 7,
                  icon: '🔥'
                },
                { 
                  title: 'Goal Crusher', 
                  description: 'Completed 5 goals',
                  achieved: stats?.completed >= 5,
                  icon: '🏆'
                },
                { 
                  title: 'Partner Pro', 
                  description: 'Connected with a partner',
                  achieved: false,
                  icon: '🤝'
                },
                { 
                  title: 'Progress Master', 
                  description: '90% average progress',
                  achieved: stats?.avgProgress >= 90,
                  icon: '⭐'
                }
              ].map((achievement, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.achieved 
                      ? 'bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      achievement.achieved ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${
                      achievement.achieved ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.achieved && (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account Status */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Type</span>
                <span className="font-medium text-primary-600">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Goals Limit</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium">1 GB</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full btn-primary">
                Upgrade to Pro
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Unlock advanced analytics and features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
