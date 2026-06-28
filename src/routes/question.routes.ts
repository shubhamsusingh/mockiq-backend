import { Router } from 'express';
import {
  listQuestions,
  getRandomQuestion,
  getQuestionById,
  createQuestion,
} from '../controllers/question.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// GET  /api/question/list    — public, supports ?search=&domain_id=&difficulty=&page=
router.get('/list', listQuestions);

// GET  /api/question/random  — protected, ?domain_id=&difficulty=&exclude=1,2,3
router.get('/random', authenticate, getRandomQuestion);

// GET  /api/question/:id     — public
router.get('/:id', getQuestionById);

// POST /api/question         — admin only
router.post('/', authenticate, authorizeAdmin, createQuestion);

export default router;
