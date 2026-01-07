const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a goal title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    enum: ['health', 'career', 'education', 'finance', 'personal', 'relationship', 'other'],
    default: 'personal'
  },
  targetDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  progressUpdates: [{
    date: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot be more than 300 characters']
    }
  }],
  milestones: [{
    title: {
      type: String,
      required: true
    },
    targetDate: Date,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  currentProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'behind-schedule'],
    default: 'not-started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
});

// Calculate status based on progress and target date
goalSchema.methods.calculateStatus = function() {
  const now = new Date();
  const timeLeft = this.targetDate - now;
  const daysLeft = timeLeft / (1000 * 60 * 60 * 24);
  
  if (this.currentProgress === 100) return 'completed';
  if (this.currentProgress === 0) return 'not-started';
  if (daysLeft < 0 || (this.currentProgress < 50 && daysLeft < 7)) {
    return 'behind-schedule';
  }
  return 'in-progress';
};

module.exports = mongoose.model('Goal', goalSchema);
