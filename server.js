require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
// Connect to MongoDB
connectDB();

// Middleware

app.use(express.json());

// Add this middleware definition before your routes
const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const tokenString = token.replace('Bearer ', '');
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Routes
app.use('/api/auth', authRoutes);

app.put('/api/users/profile', authenticateUser, async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user information
    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save();

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    res.json({ message: 'Profile updated successfully', user: userData });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 