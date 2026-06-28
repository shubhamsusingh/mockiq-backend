// import { Response } from 'express';
// import bcrypt from 'bcryptjs';
// import { query, execute } from '../config/db';
// import { sendSuccess, sendError } from '../config/response';
// import { AuthRequest, UserRow } from '../types';

// export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const users = await query<UserRow>('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', [req.user!.userId]);
//     if (users.length === 0) { sendError(res, 'User not found.', 404); return; }
//     sendSuccess(res, 'Profile fetched.', users[0]);
//   } catch (err) { console.error('[GetProfile Error]', err); sendError(res, 'Internal server error.', 500); }
// };

// export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const { name } = req.body;
//     if (!name?.trim()) { sendError(res, 'Name is required.', 400); return; }
//     await execute('UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?', [name.trim(), req.user!.userId]);
//     sendSuccess(res, 'Profile updated successfully.');
//   } catch (err) { console.error('[UpdateProfile Error]', err); sendError(res, 'Internal server error.', 500); }
// };

// export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     if (!currentPassword || !newPassword) { sendError(res, 'Current and new password are required.', 400); return; }
//     if (newPassword.length < 6) { sendError(res, 'New password must be at least 6 characters.', 400); return; }

//     const users = await query<UserRow>('SELECT password FROM users WHERE id = ?', [req.user!.userId]);
//     const isMatch = await bcrypt.compare(currentPassword, users[0].password);
//     if (!isMatch) { sendError(res, 'Current password is incorrect.', 401); return; }

//     const hashed = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
//     await execute('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashed, req.user!.userId]);
//     sendSuccess(res, 'Password changed successfully.');
//   } catch (err) { console.error('[ChangePassword Error]', err); sendError(res, 'Internal server error.', 500); }
// };

// export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const page   = Math.max(1, Number(req.query.page) || 1);
//     const limit  = Math.min(100, Number(req.query.limit) || 10);
//     const search = (req.query.search as string || '').trim();
//     const offset = (page - 1) * limit;

//     let where = 'WHERE 1=1';
//     const params: (string | number)[] = [];
//     if (search) { where += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

//     const countResult = await query<{ total: number }>(`SELECT COUNT(*) as total FROM users ${where}`, params);
//     const total = countResult[0].total;

//     const users = await query<UserRow>(
//       `SELECT id, name, email, role, is_active, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
//       [...params, limit, offset]
//     );
//     sendSuccess(res, 'Users fetched.', { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
//   } catch (err) { console.error('[ListUsers Error]', err); sendError(res, 'Internal server error.', 500); }
// };
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, execute } from '../config/db';
import { sendSuccess, sendError } from '../config/response';
import { AuthRequest, UserRow } from '../types';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await query<UserRow>('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', [req.user!.userId]);
    if (users.length === 0) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, 'Profile fetched.', users[0]);
  } catch (err) { console.error('[GetProfile Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name?.trim()) { sendError(res, 'Name is required.', 400); return; }
    await execute('UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?', [name.trim(), req.user!.userId]);
    sendSuccess(res, 'Profile updated successfully.');
  } catch (err) { console.error('[UpdateProfile Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) { sendError(res, 'Current and new password are required.', 400); return; }
    if (newPassword.length < 6) { sendError(res, 'New password must be at least 6 characters.', 400); return; }

    const users = await query<UserRow>('SELECT password FROM users WHERE id = ?', [req.user!.userId]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) { sendError(res, 'Current password is incorrect.', 401); return; }

    const hashed = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
    await execute('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashed, req.user!.userId]);
    sendSuccess(res, 'Password changed successfully.');
  } catch (err) { console.error('[ChangePassword Error]', err); sendError(res, 'Internal server error.', 500); }
};

// PUT /api/user/:id  — admin can update any user, user can update only themselves
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    // Non-admin users can only update their own profile
    if (req.user!.role !== 'admin' && Number(id) !== req.user!.userId) {
      sendError(res, 'Access denied. You can only update your own profile.', 403);
      return;
    }

    // Only admin can change role and is_active
    if (req.user!.role !== 'admin' && (role || is_active !== undefined)) {
      sendError(res, 'Access denied. Only admin can change role or status.', 403);
      return;
    }

    // Check user exists
    const existing = await query<UserRow>('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) { sendError(res, 'User not found.', 404); return; }

    // Check email not taken by another user
    if (email) {
      const emailCheck = await query<UserRow>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email.toLowerCase().trim(), id]
      );
      if (emailCheck.length > 0) { sendError(res, 'Email already in use by another account.', 409); return; }
    }

    await execute(
      `UPDATE users
       SET name      = COALESCE(?, name),
           email     = COALESCE(?, email),
           role      = COALESCE(?, role),
           is_active = COALESCE(?, is_active),
           updated_at = NOW()
       WHERE id = ?`,
      [
        name  ? name.trim()                : null,
        email ? email.toLowerCase().trim() : null,
        req.user!.role === 'admin' ? (role || null) : null,
        req.user!.role === 'admin' ? (is_active ?? null) : null,
        id,
      ]
    );

    // Fetch and return updated user
    const updated = await query<UserRow>(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    sendSuccess(res, 'User updated successfully.', updated[0]);
  } catch (err) { console.error('[UpdateUser Error]', err); sendError(res, 'Internal server error.', 500); }
};

// DELETE /api/user/:id  — admin can hard delete, user can delete only themselves (soft)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const targetId = Number(id);

    // Non-admin can only delete their own account
    if (req.user!.role !== 'admin' && targetId !== req.user!.userId) {
      sendError(res, 'Access denied. You can only delete your own account.', 403);
      return;
    }

    // Prevent admin from deleting themselves
    if (targetId === req.user!.userId && req.user!.role === 'admin') {
      sendError(res, 'Admin cannot delete their own account.', 400);
      return;
    }

    // Check user exists
    const existing = await query<UserRow>('SELECT id, role FROM users WHERE id = ?', [id]);
    if (existing.length === 0) { sendError(res, 'User not found.', 404); return; }

    if (req.user!.role === 'admin') {
      // Admin → hard delete (removes all related data via CASCADE)
      await execute('DELETE FROM users WHERE id = ?', [id]);
      sendSuccess(res, 'User permanently deleted.');
    } else {
      // Regular user → soft delete (deactivate account)
      await execute('UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);
      sendSuccess(res, 'Account deactivated successfully.');
    }
  } catch (err) { console.error('[DeleteUser Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page   = Math.max(1, Number(req.query.page) || 1);
    const limit  = Math.min(100, Number(req.query.limit) || 10);
    const search = (req.query.search as string || '').trim();
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: (string | number)[] = [];
    if (search) { where += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const countResult = await query<{ total: number }>(`SELECT COUNT(*) as total FROM users ${where}`, params);
    const total = countResult[0].total;

    const users = await query<UserRow>(
      `SELECT id, name, email, role, is_active, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    sendSuccess(res, 'Users fetched.', { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { console.error('[ListUsers Error]', err); sendError(res, 'Internal server error.', 500); }
};
