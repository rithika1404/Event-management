import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforeventmanagement';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware to authenticate Admin requests
export const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed. Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.username !== ADMIN_USERNAME) {
      return res.status(403).json({ message: 'Access denied. Invalid user.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Admin Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Generate JWT token valid for 24h
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  }

  return res.status(401).json({ message: 'Invalid username or password' });
});

export default router;
