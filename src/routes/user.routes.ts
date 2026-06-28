// import { Router } from 'express';
// import {
//   getProfile,
//   updateProfile,
//   changePassword,
//   listUsers,
// } from '../controllers/user.controller';
// import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

// const router = Router();

// // All user routes require authentication
// router.use(authenticate);

// // GET  /api/user/profile
// router.get('/profile', getProfile);

// // PUT  /api/user/profile
// router.put('/profile', updateProfile);

// // PUT  /api/user/change-password
// router.put('/change-password', changePassword);

// // GET  /api/user/list  — admin only, supports ?search=&page=&limit=
// router.get('/list', authorizeAdmin, listUsers);

// export default router;
import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET  /api/user/profile         — own profile
router.get('/profile', getProfile);

// PUT  /api/user/profile         — update own profile
router.put('/profile', updateProfile);

// PUT  /api/user/change-password — change own password
router.put('/change-password', changePassword);

// GET  /api/user/list            — admin only, supports ?search=&page=&limit=
router.get('/list', authorizeAdmin, listUsers);

// PUT  /api/user/:id             — admin: update any user | user: update own only
router.put('/:id', updateUser);

// DELETE /api/user/:id           — admin: hard delete | user: soft delete own account
router.delete('/:id', deleteUser);

export default router;
