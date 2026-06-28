import { Router } from 'express';
import authRoutes     from './auth.routes';
import userRoutes     from './user.routes';
import domainRoutes   from './domain.routes';
import sessionRoutes  from './session.routes';
import questionRoutes from './question.routes';

const router = Router();

router.use('/auth',     authRoutes);
router.use('/user',     userRoutes);
router.use('/domain',   domainRoutes);
router.use('/session',  sessionRoutes);
router.use('/question', questionRoutes);

export default router;
