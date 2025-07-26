import express from 'express';
import dotenv from 'dotenv';
import {
  register,
  login,
  logout,
  check
} from '../controllers/auth.controller.js';

dotenv.config();

import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.post('/logout', authMiddleware, logout);
router.get('/check', authMiddleware, check);

export default router;
