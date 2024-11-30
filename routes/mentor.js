const express = require('express');
const auth = require('../middleware/auth');
const LearningPlan = require('../models/LearningPlan');
const router = express.Router();

// Create learning plan
router.post('/create-plan', auth, async (req, res) => {
  try {
    const { careerGoal, technology, timeline, planPreference } = req.body;
    
    // Create and save the plan
    const plan = new LearningPlan({
      user: req.user.userId,
      careerGoal,
      technology,
      timeline,
      planPreference,
      startDate: new Date()
    });

    await plan.save();
    
    res.status(201).json({
      success: true,
      plan
    });

  } catch (error) {
    console.error('Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create learning plan',
      error: error.message
    });
  }
});

// Add route to update progress
router.patch('/progress/:planId/day/:dayId', auth, async (req, res) => {
  try {
    const { completed, tasks } = req.body;
    const plan = await LearningPlan.findOne({ 
      _id: req.params.planId,
      user: req.user.userId 
    });

    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not found' 
      });
    }

    // Update the specific day's progress
    const day = plan.months.reduce((found, month) => {
      if (found) return found;
      return month.weeks.reduce((weekFound, week) => {
        if (weekFound) return weekFound;
        return week.days.find(d => d._id.toString() === req.params.dayId);
      }, null);
    }, null);

    if (day) {
      day.completed = completed;
      if (tasks) day.tasks = tasks;
      
      // Update overall progress
      plan.updateProgress();
      await plan.save();

      res.json({ success: true, plan });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Day not found' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get user's learning plan
router.get('/my-plan', auth, async (req, res) => {
  try {
    const plan = await LearningPlan.findOne({ user: req.user.userId })
      .sort({ createdAt: -1 });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No learning plan found'
      });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 