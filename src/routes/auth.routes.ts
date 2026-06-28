import { Router } from 'express';
import { signup, login, logout, refreshToken, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// GET  /api/auth/me  (protected)
router.get('/me', authenticate, getMe);

export default router;
