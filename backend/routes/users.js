const express = require('express');
const User = require('../models/User');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');
const router = express.Router();

// Search users for accountability partners
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('name email avatar score');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send partner request
router.post('/partner-request/:userId', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request already exists
    const existingRequest = targetUser.partnerRequests.find(
      req => req.user.toString() === req.user._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    targetUser.partnerRequests.push({
      user: req.user._id,
      status: 'pending'
    });

    await targetUser.save();
    res.json({ message: 'Partner request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get partner requests
router.get('/partner-requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('partnerRequests.user', 'name email avatar');
    
    res.json(user.partnerRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to partner request
router.patch('/partner-request/:requestId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user._id);
    
    const request = user.partnerRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = status;
    
    if (status === 'accepted') {
      user.accountabilityPartner = request.user;
      
      // Also set the other user's accountability partner
      await User.findByIdAndUpdate(request.user, {
        accountabilityPartner: req.user._id
      });
    }
    
    await user.save();
    res.json({ message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get partner's public goals
router.get('/partner-goals', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('accountabilityPartner');
    
    if (!user.accountabilityPartner) {
      return res.json([]);
    }
    
    const goals = await Goal.find({
      user: user.accountabilityPartner._id,
      isPublic: true
    }).populate('user', 'name avatar');
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
