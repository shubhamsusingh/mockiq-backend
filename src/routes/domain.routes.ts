import { Router } from 'express';
import {
  listDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
} from '../controllers/domain.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// GET  /api/domain/list  — public, supports ?search=
router.get('/list', listDomains);

// GET  /api/domain/:id  — public
router.get('/:id', getDomainById);

// POST /api/domain  — admin only
router.post('/', authenticate, authorizeAdmin, createDomain);

// PUT  /api/domain/:id  — admin only
router.put('/:id', authenticate, authorizeAdmin, updateDomain);

// DELETE /api/domain/:id  — admin only (soft delete)
router.delete('/:id', authenticate, authorizeAdmin, deleteDomain);

export default router;
