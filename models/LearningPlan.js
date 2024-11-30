const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  tasks: [String],
  timeline: String,
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  }
});

const milestoneSchema = new mongoose.Schema({
  title: String,
  week: String,
  description: String,
  completed: {
    type: Boolean,
    default: false
  }
});

const resourceSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ['Documentation', 'Course', 'Tutorial', 'Video', 'Article', 'Other']
  },
  url: String,
  completed: {
    type: Boolean,
    default: false
  }
});

const weeklyPlanSchema = new mongoose.Schema({
  weekNumber: Number,
  title: String,
  days: [{
    dayNumber: Number,
    tasks: [String],
    completed: {
      type: Boolean,
      default: false
    }
  }],
  resources: [resourceSchema],
  projects: [projectSchema]
});

const monthlyPlanSchema = new mongoose.Schema({
  monthNumber: Number,
  title: String,
  goals: [String],
  weeks: [weeklyPlanSchema],
  milestones: [milestoneSchema]
});

const learningPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  careerGoal: {
    type: String,
    required: true
  },
  technology: {
    type: String,
    required: true
  },
  timeline: {
    type: String,
    required: true,
    enum: ['3 months', '6 months', '1 year']
  },
  planPreference: {
    type: String,
    required: true,
    enum: ['Daily basis', 'Weekly basis', 'Monthly basis']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  progress: {
    type: Number,
    default: 0
  },
  months: [monthlyPlanSchema],
  rawRoadmap: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated timestamp before saving
learningPlanSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Calculate end date based on timeline
  const months = {
    '3 months': 3,
    '6 months': 6,
    '1 year': 12
  };
  
  this.endDate = new Date(this.startDate);
  this.endDate.setMonth(this.endDate.getMonth() + months[this.timeline]);
  
  next();
});

// Method to update progress
learningPlanSchema.methods.updateProgress = function() {
  let totalTasks = 0;
  let completedTasks = 0;

  this.months.forEach(month => {
    month.weeks.forEach(week => {
      week.days.forEach(day => {
        totalTasks += day.tasks.length;
        if (day.completed) completedTasks += day.tasks.length;
      });
    });
  });

  this.progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  return this.progress;
};

module.exports = mongoose.model('LearningPlan', learningPlanSchema); 