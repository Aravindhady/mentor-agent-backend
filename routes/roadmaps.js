const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');

// Save a new roadmap
router.post('/', async (req, res) => {
  try {
    const { userId, careerPath, technology, roadmap } = req.body;
    
    const newRoadmap = new Roadmap({
      userId,
      careerPath,
      technology,
      roadmap
    });

    await newRoadmap.save();
    
    res.json({ success: true, roadmap: newRoadmap });
  } catch (error) {
    console.error('Error saving roadmap:', error);
    res.status(500).json({ success: false, error: 'Failed to save roadmap' });
  }
});

// Get roadmaps for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.params.userId })
                                 .sort({ createdAt: -1 });
    
    res.json({ success: true, roadmaps });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch roadmaps' });
  }
});

module.exports = router; 