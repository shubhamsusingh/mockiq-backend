import { Response } from 'express';
import { query, execute } from '../config/db';
import { sendSuccess, sendError } from '../config/response';
import { AuthRequest, SessionRow } from '../types';

export const saveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { domain_id, difficulty, score, total_q, verdict, answers } = req.body;
    if (!domain_id || !difficulty || score === undefined) { sendError(res, 'domain_id, difficulty and score are required.', 400); return; }

    const result = await execute(
      `INSERT INTO sessions (user_id, domain_id, difficulty, score, total_q, verdict, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [req.user!.userId, domain_id, difficulty, score, total_q || 5, verdict || '']
    );
    const sessionId = result.insertId;

    if (Array.isArray(answers) && answers.length > 0) {
      for (const a of answers) {
        await execute(
          `INSERT INTO session_answers (session_id, question_id, answer, score, feedback) VALUES (?, ?, ?, ?, ?)`,
          [sessionId, a.question_id || null, a.answer || '', a.score || 0, a.feedback || '']
        );
      }
    }
    sendSuccess(res, 'Session saved.', { sessionId }, 201);
  } catch (err) { console.error('[SaveSession Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const getSessionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page       = Math.max(1, Number(req.query.page) || 1);
    const limit      = Math.min(50, Number(req.query.limit) || 10);
    const offset     = (page - 1) * limit;
    const search     = (req.query.search as string || '').trim();
    const difficulty = req.query.difficulty as string;
    const domain     = req.query.domain as string;

    const params: (string | number)[] = [req.user!.userId as number];
    let whereExtra = '';
    if (search)     { whereExtra += ' AND d.name LIKE ?'; params.push(`%${search}%`); }
    if (difficulty) { whereExtra += ' AND s.difficulty = ?'; params.push(difficulty); }
    if (domain)     { whereExtra += ' AND d.id = ?'; params.push(domain); }

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM sessions s JOIN domains d ON s.domain_id = d.id WHERE s.user_id = ? ${whereExtra}`, params
    );
    const total = countResult[0].total;

    const sessions = await query<SessionRow>(
      `SELECT s.id, s.difficulty, s.score, s.total_q, s.verdict, s.created_at, d.id as domain_id, d.name as domain_name
       FROM sessions s JOIN domains d ON s.domain_id = d.id
       WHERE s.user_id = ? ${whereExtra} ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    sendSuccess(res, 'Session history fetched.', { sessions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { console.error('[GetHistory Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const getSessionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await query<SessionRow>(
      'SELECT s.*, d.name as domain_name FROM sessions s JOIN domains d ON s.domain_id = d.id WHERE s.id = ? AND s.user_id = ?',
      [req.params.id, req.user!.userId as number]
    );
    if (sessions.length === 0) { sendError(res, 'Session not found.', 404); return; }
    const answers = await query(
      'SELECT sa.*, q.question, q.topic FROM session_answers sa LEFT JOIN questions q ON sa.question_id = q.id WHERE sa.session_id = ?',
      [req.params.id]
    );
    sendSuccess(res, 'Session fetched.', { session: sessions[0], answers });
  } catch (err) { console.error('[GetSession Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId as number;
    const totals = await query<{ total: number; avg_score: number }>(
      'SELECT COUNT(*) as total, AVG(score) as avg_score FROM sessions WHERE user_id = ?', [userId]
    );
    const domainBreakdown = await query(
      `SELECT d.name, d.icon, COUNT(*) as sessions, AVG(s.score) as avg_score
       FROM sessions s JOIN domains d ON s.domain_id = d.id WHERE s.user_id = ? GROUP BY d.id ORDER BY sessions DESC`, [userId]
    );
    const diffBreakdown = await query(
      'SELECT difficulty, COUNT(*) as count, AVG(score) as avg_score FROM sessions WHERE user_id = ? GROUP BY difficulty', [userId]
    );
    const recentTrend = await query(
      `SELECT DATE(created_at) as date, AVG(score) as avg_score FROM sessions
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date ASC`, [userId]
    );
    sendSuccess(res, 'Stats fetched.', {
      totalSessions: totals[0].total,
      averageScore:  Math.round(totals[0].avg_score || 0),
      domainBreakdown, diffBreakdown, recentTrend,
    });
  } catch (err) { console.error('[GetStats Error]', err); sendError(res, 'Internal server error.', 500); }
};
