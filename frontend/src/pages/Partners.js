import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axios';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Award,
  TrendingUp,
  Shield
} from 'lucide-react';

const Partners = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [partnerGoals, setPartnerGoals] = useState([]);
  const [currentPartner, setCurrentPartner] = useState(null); // ADDED THIS LINE
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('find');

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      const [requestsRes, goalsRes, currentPartnerRes] = await Promise.all([
        axiosInstance.get('/api/users/partner-requests'),
        axiosInstance.get('/api/users/partner-goals'),
        axiosInstance.get('/api/users/current-partner') // ADD THIS API CALL
      ]);
      
      setPartnerRequests(requestsRes.data);
      setPartnerGoals(goalsRes.data);
      setCurrentPartner(currentPartnerRes.data); // SET THE CURRENT PARTNER
    } catch (error) {
      console.error('Failed to fetch partner data:', error);
      setCurrentPartner(null); // Set to null if API fails or no partner exists
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/users/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPartnerRequest = async (userId) => {
    try {
      await axiosInstance.post(`/api/users/partner-request/${userId}`);
      alert('Partner request sent!');
      setSearchResults(searchResults.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Failed to send request:', error);
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleRequestResponse = async (requestId, status) => {
    try {
      await axiosInstance.patch(`/api/users/partner-request/${requestId}`, { status });
      fetchPartnerData();
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle className="text-green-500" />;
      case 'rejected': return <XCircle className="text-red-500" />;
      default: return <Clock className="text-yellow-500" />;
    }
  };

  const tabs = [
    { id: 'find', label: 'Find Partners', icon: <Search size={18} /> },
    { id: 'requests', label: 'Requests', icon: <UserPlus size={18} /> },
    { id: 'shared', label: 'Shared Goals', icon: <Users size={18} /> }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Accountability Partners</h1>
          <p className="text-gray-600 mt-2">Stay motivated together</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Active Partner</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {currentPartner ? currentPartner.name : 'None'} {/* DISPLAY PARTNER NAME OR 'None' */}
              </h3>
                {currentPartner && (
                <p className="text-sm text-gray-500 mt-1">
                  Connected since {new Date(currentPartner.connectedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full">
              <Users className="text-primary-600" size={24} />
            </div>
            <div className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full">
              <Users className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Pending Requests</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {partnerRequests.filter(r => r.status === 'pending').length}
              </h3>
            </div>
            <div className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full">
              <Clock className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Shared Goals</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {partnerGoals.length}
              </h3>
            </div>
            <div className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full">
              <Award className="text-primary-600" size={24} />
            </div>
          </div>
        </div>
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

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Find Partners Tab */}
        {activeTab === 'find' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className="input-field pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="btn-primary"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              <div className="space-y-4">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                          ) : (
                            <span className="text-xl font-bold text-primary-600">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Award size={14} className="text-yellow-500" />
                            <span className="text-xs font-medium">{user.score || 0} pts</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => sendPartnerRequest(user._id)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <UserPlus size={18} />
                        <span>Request Partner</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Find Accountability Partners</h3>
                    <p className="text-gray-500">
                      Search for users to connect and stay motivated together
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Why Partner Up?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <TrendingUp className="text-green-600" size={24} />,
                    title: 'Increased Motivation',
                    desc: 'Stay accountable and motivated with regular check-ins'
                  },
                  {
                    icon: <Shield className="text-blue-600" size={24} />,
                    title: 'Better Consistency',
                    desc: 'Partners help maintain consistency in goal tracking'
                  },
                  {
                    icon: <MessageSquare className="text-purple-600" size={24} />,
                    title: 'Shared Insights',
                    desc: 'Get feedback and insights from your partner'
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="p-3 bg-gray-50 rounded-lg w-fit mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {partnerRequests.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {partnerRequests.map((request) => (
                  <div
                    key={request._id}
                    className="card hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                          {request.user?.avatar ? (
                            <img src={request.user.avatar} alt={request.user.name} className="w-16 h-16 rounded-full" />
                          ) : (
                            <span className="text-2xl font-bold text-primary-600">
                              {request.user?.name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{request.user?.name}</h3>
                          <p className="text-gray-600">{request.user?.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Award size={16} className="text-yellow-500" />
                            <span className="text-sm font-medium">{request.user?.score || 0} pts</span>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span className={`text-sm font-medium capitalize ${
                                request.status === 'accepted' ? 'text-green-600' :
                                request.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleRequestResponse(request._id, 'accepted')}
                            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRequestResponse(request._id, 'rejected')}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <UserPlus size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Partner Requests</h3>
                <p className="text-gray-500">
                  When someone sends you a partner request, it will appear here
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Shared Goals Tab */}
        {activeTab === 'shared' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {partnerGoals.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {partnerGoals.map((goal) => (
                  <div
                    key={goal._id}
                    className="card hover:shadow-xl transition-shadow group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                            {goal.user?.avatar ? (
                              <img src={goal.user.avatar} alt={goal.user.name} className="w-12 h-12 rounded-full" />
                            ) : (
                              <span className="text-lg font-bold text-primary-600">
                                {goal.user?.name?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{goal.user?.name}'s Goal</h3>
                            <p className="text-sm text-gray-500">Shared with you</p>
                          </div>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {goal.title}
                        </h4>
                        <p className="text-gray-600 mb-4">{goal.description}</p>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium">Current Progress</span>
                              <span className="font-bold text-primary-600">{goal.currentProgress}%</span>
                            </div>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${goal.currentProgress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="capitalize">Category: {goal.category}</span>
                              <span className="capitalize">Priority: {goal.priority}</span>
                            </div>
                            <span>
                              Due: {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="ml-4 p-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                        onClick={() => {
                          // Implement message feature
                          alert(`Send encouragement to ${goal.user?.name} about their goal!`);
                        }}
                      >
                        <MessageSquare size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Users size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Shared Goals</h3>
                <p className="text-gray-500 mb-6">
                  Connect with a partner to see their shared goals here
                </p>
                <button
                  onClick={() => setActiveTab('find')}
                  className="btn-primary"
                >
                  Find Partners
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Partners;
