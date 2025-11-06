require('dotenv').config();
const jwt = require('jsonwebtoken');
const { findUserByPhone, addUser } = require('../db');

const TOKEN_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const existingUser = findUserByPhone(phone);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await addUser({ phone, password });

    res.status(201).json({
      message: 'User registered successfully',
      phone
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = findUserByPhone(phone);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (user not found)' });
    }

    if (password.trim() !== user.password.trim()) {
      return res.status(401).json({ message: 'Invalid credentials (wrong password)' });
    }

    const token = jwt.sign(
      { phone: user.phone },
      TOKEN_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      phone: user.phone
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

module.exports = { register, login, logout };
