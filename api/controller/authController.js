require('dotenv').config();
const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { phone, password } = req.body;

  if (phone === process.env.PHONE && password === process.env.PASSWORD) {
    try {
      const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({
        message: 'Login successful',
        token,
      });
    } catch (err) {
      res.status(500).json({ message: 'Token generation failed' });
    }
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

const verifyToken = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, data: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { login, verifyToken };
