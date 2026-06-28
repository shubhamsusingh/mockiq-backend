import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, execute } from '../config/db';
import { sendSuccess, sendError } from '../config/response';
import { AuthRequest, UserRow } from '../types';

const generateTokens = (userId: number, email: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
  const refreshToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as jwt.SignOptions
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) { sendError(res, 'Name, email and password are required.', 400); return; }
    if (password.length < 6) { sendError(res, 'Password must be at least 6 characters.', 400); return; }

    const existing = await query<UserRow>('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) { sendError(res, 'Email already registered.', 409); return; }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await execute(
      `INSERT INTO users (name, email, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const { accessToken, refreshToken } = generateTokens(result.insertId, email, 'user');
    sendSuccess(res, 'Account created successfully.', {
      user: { id: result.insertId, name: name.trim(), email: email.toLowerCase().trim(), role: 'user' },
      accessToken, refreshToken,
    }, 201);
  } catch (err) { console.error('[Signup Error]', err); sendError(res, 'Internal server error.', 500); }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { sendError(res, 'Email and password are required.', 400); return; }

    const users = await query<UserRow>('SELECT * FROM users WHERE email = ? AND is_active = 1', [email.toLowerCase().trim()]);
    if (users.length === 0) { sendError(res, 'Invalid email or password.', 401); return; }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { sendError(res, 'Invalid email or password.', 401); return; }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
    await execute(
      `INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [refreshToken, user.id]
    );

    sendSuccess(res, 'Login successful.', {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken, refreshToken,
    });
  } catch (err) { console.error('[Login Error]', err); sendError(res, 'Internal server error.', 500); }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    sendSuccess(res, 'Logged out successfully.');
  } catch (err) { console.error('[Logout Error]', err); sendError(res, 'Internal server error.', 500); }
};

// POST /api/auth/refresh
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) { sendError(res, 'Refresh token is required.', 400); return; }

    const rows = await query('SELECT id FROM refresh_tokens WHERE token = ? AND expires_at > NOW()', [token]);
    if (rows.length === 0) { sendError(res, 'Invalid or expired refresh token.', 401); return; }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh') as { userId: number; email: string; role: string };
    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
    sendSuccess(res, 'Token refreshed.', { accessToken });
  } catch { sendError(res, 'Invalid or expired refresh token.', 401); }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await query<UserRow>('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user!.userId]);
    if (users.length === 0) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, 'User fetched.', users[0]);
  } catch (err) { console.error('[GetMe Error]', err); sendError(res, 'Internal server error.', 500); }
};
