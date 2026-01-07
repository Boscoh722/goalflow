import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../utils/axios';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Target,
  Calendar,
  Flag,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newProgress, setNewProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'career', label: 'Career' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
    { value: 'personal', label: 'Personal Growth' },
    { value: 'relationship', label: 'Relationships' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'behind-schedule', label: 'Behind Schedule' }
  ];

  // Fetch goals
  useEffect(() => {
    fetchGoals();
  }, []);

  // Filter goals whenever search/category/status or goals change
  useEffect(() => {
    filterGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, searchTerm, selectedCategory, selectedStatus]);

  const fetchGoals = async () => {
    try {
      const response = await axiosInstance.get('/api/goals');
      setGoals(response.data.goals);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      setLoading(false);
    }
  };

  const filterGoals = () => {
    let filtered = [...goals];

    if (searchTerm) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(goal => goal.status === selectedStatus);
    }

    setFilteredGoals(filtered);
  };

  const handleCreateGoal = async (goalData) => {
    try {
      await axiosInstance.post('/api/goals', goalData);
      fetchGoals();
      setShowCreateModal(false);

      // Show success message
      setSuccessMessage('Goal created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to create goal:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to create goal');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleUpdateProgress = async (goalId) => {
    try {
      await axiosInstance.patch(`/api/goals/${goalId}/progress`, {
        progress: newProgress,
        notes: `Updated progress to ${newProgress}%`
      });
      fetchGoals();
      setShowUpdateModal(false);
      setNewProgress(0);

      // Show success message
      setSuccessMessage('Progress updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'behind-schedule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-2">Track and manage your goals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          <span>New Goal</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search goals..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-4">
            <select
              className="input-field"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              className="input-field"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGoals.map((goal, index) => (
            <motion.div
              key={goal._id || `goal-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-xl transition-shadow group"
            >
              {/* Priority Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`} />
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                  {goal.status ? goal.status.replace('-', ' ') : 'Not set'}
                </span>
              </div>

              {/* Goal Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {goal.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {goal.description || 'No description'}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>Due: {goal.targetDate ? format(new Date(goal.targetDate), 'MMM dd') : 'Not set'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target size={16} />
                    <span className="capitalize">{goal.category}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold text-primary-600">{goal.currentProgress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${goal.currentProgress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Flag size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Milestones</span>
                    </div>
                    <div className="space-y-2">
                      {goal.milestones.slice(0, 2).map((milestone, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {milestone.title}
                          </span>
                          {milestone.completed && (
                            <CheckCircle size={16} className="text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setNewProgress(goal.currentProgress || 0);
                    setShowUpdateModal(true);
                  }}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <TrendingUp size={18} />
                  <span className="font-medium">Update</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Target size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No goals found</h3>
          <p className="text-gray-500 mb-6">Create your first goal to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Goal
          </button>
        </motion.div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGoal}
          categories={categories}
        />
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && selectedGoal && (
        <UpdateProgressModal
          goal={selectedGoal}
          currentProgress={newProgress}
          onProgressChange={setNewProgress}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedGoal(null);
          }}
          onUpdate={() => selectedGoal?._id && handleUpdateProgress(selectedGoal._id)}
        />
      )}
    </div>
  );
};

// ------------------- Modals -------------------
const CreateGoalModal = ({ onClose, onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    targetDate: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      targetDate: '',
      priority: 'medium'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Goal</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title *</label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you want to achieve?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="input-field min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.filter(cat => cat.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                className="input-field"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Date *</label>
            <input
              type="date"
              required
              className="input-field"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Goal</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const UpdateProgressModal = ({ goal, currentProgress, onProgressChange, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Update Progress</h2>
        <p className="text-gray-600 mb-6">{goal.title}</p>

        <div className="mb-8">
          <div className="flex justify-between text-sm mb-4">
            <span className="font-medium">Current Progress</span>
            <span className="font-bold text-primary-600">{currentProgress}%</span>
          </div>
          
          <div className="progress-bar mb-2">
            <div className="progress-fill" style={{ width: `${currentProgress}%` }} />
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={currentProgress}
            onChange={(e) => onProgressChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onUpdate} className="btn-primary">Update Progress</button>
        </div>
      </motion.div>
    </div>
  );
};

export default Goals;
