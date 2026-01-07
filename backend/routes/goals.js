const express = require('express');
const Goal = require('../models/Goal');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create goal
router.post('/', auth, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      user: req.user._id
    });
    
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all goals for user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');
    
    // Calculate scores
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.currentProgress === 100).length;
    const averageProgress = goals.reduce((acc, goal) => acc + goal.currentProgress, 0) / totalGoals || 0;
    
    res.json({
      goals,
      stats: {
        totalGoals,
        completedGoals,
        averageProgress: Math.round(averageProgress),
        inProgressGoals: goals.filter(g => g.status === 'in-progress').length,
        behindSchedule: goals.filter(g => g.status === 'behind-schedule').length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update goal progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { progress, notes } = req.body;
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.progressUpdates.push({
      progress,
      notes: notes || ''
    });

    goal.currentProgress = progress;
    goal.status = goal.calculateStatus();
    
    await goal.save();

    // Update user score
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { score: Math.round(progress / 10) }
    });

    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get goal analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    
    const categoryData = {};
    const monthlyProgress = {};
    
    goals.forEach(goal => {
      // Category distribution
      categoryData[goal.category] = (categoryData[goal.category] || 0) + 1;
      
      // Monthly progress
      const month = new Date(goal.createdAt).getMonth();
      monthlyProgress[month] = (monthlyProgress[month] || 0) + goal.currentProgress;
    });
    
    res.json({
      categoryData,
      monthlyProgress,
      completionRate: (goals.filter(g => g.currentProgress === 100).length / goals.length * 100) || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
