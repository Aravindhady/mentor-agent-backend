const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, steps } = req.body;
    
    const newRoadmap = new Roadmap({
      userId: req.user.id, // From auth middleware
      title,
      description,
      steps,
      createdAt: new Date()
    });

    await newRoadmap.save();
    res.status(201).json(newRoadmap);
  } catch (error) {
    console.error('Error saving roadmap:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 