import { Router } from 'express';
import {
  saveSession,
  getSessionHistory,
  getSessionById,
  getStats,
} from '../controllers/session.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All session routes require auth
router.use(authenticate);

// POST /api/session        — save a completed session
router.post('/', saveSession);

// GET  /api/session/history — list with ?search=&domain=&difficulty=&page=&limit=
router.get('/history', getSessionHistory);

// GET  /api/session/stats   — dashboard summary
router.get('/stats', getStats);

// GET  /api/session/:id     — single session + answers
router.get('/:id', getSessionById);

export default router;
