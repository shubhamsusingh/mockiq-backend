import { Request, Response } from 'express';
import { query, execute } from '../config/db';
import { sendSuccess, sendError } from '../config/response';
import { AuthRequest, QuestionRow } from '../types';

export const listQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page       = Math.max(1, Number(req.query.page) || 1);
    const limit      = Math.min(100, Number(req.query.limit) || 20);
    const offset     = (page - 1) * limit;
    const search     = (req.query.search as string || '').trim();
    const domainId   = req.query.domain_id as string;
    const difficulty = req.query.difficulty as string;

    const params: (string | number)[] = [];
    let where = 'WHERE q.is_active = 1';
    if (domainId)   { where += ' AND q.domain_id = ?';   params.push(domainId); }
    if (difficulty) { where += ' AND q.difficulty = ?';  params.push(difficulty); }
    if (search)     { where += ' AND (q.question LIKE ? OR q.topic LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const countResult = await query<{ total: number }>(`SELECT COUNT(*) as total FROM questions q ${where}`, params);
    const total = countResult[0].total;

    const questions = await query<QuestionRow>(
      `SELECT q.id, q.question, q.topic, q.hint, q.difficulty, d.id as domain_id, d.name as domain_name
       FROM questions q JOIN domains d ON q.domain_id = d.id ${where} ORDER BY q.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    sendSuccess(res, 'Questions fetched.', { questions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { console.error('[ListQuestions Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const getRandomQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain_id, difficulty, exclude } = req.query;
    if (!domain_id || !difficulty) { sendError(res, 'domain_id and difficulty are required.', 400); return; }

    const excludeIds = (exclude as string || '').split(',').map(Number).filter(Boolean);
    const params: (string | number)[] = [domain_id as string, difficulty as string];
    let sql = 'SELECT * FROM questions WHERE domain_id = ? AND difficulty = ? AND is_active = 1';
    if (excludeIds.length > 0) {
      sql += ` AND id NOT IN (${excludeIds.map(() => '?').join(',')})`;
      params.push(...excludeIds);
    }
    sql += ' ORDER BY RAND() LIMIT 1';

    const questions = await query<QuestionRow>(sql, params);
    if (questions.length === 0) { sendError(res, 'No more questions available.', 404); return; }

    const { ideal_answer: _ia, ...safeQ } = questions[0];
    void _ia;
    sendSuccess(res, 'Question fetched.', safeQ);
  } catch (err) { console.error('[GetRandomQ Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await query<QuestionRow>(
      'SELECT q.*, d.name as domain_name FROM questions q JOIN domains d ON q.domain_id = d.id WHERE q.id = ? AND q.is_active = 1',
      [req.params.id]
    );
    if (questions.length === 0) { sendError(res, 'Question not found.', 404); return; }
    sendSuccess(res, 'Question fetched.', questions[0]);
  } catch (err) { console.error('[GetQuestionById Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { domain_id, difficulty, question, topic, hint, ideal_answer } = req.body;
    if (!domain_id || !difficulty || !question) { sendError(res, 'domain_id, difficulty and question are required.', 400); return; }
    const result = await execute(
      `INSERT INTO questions (domain_id, difficulty, question, topic, hint, ideal_answer, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [domain_id, difficulty, question, topic || '', hint || '', ideal_answer || '']
    );
    sendSuccess(res, 'Question created.', { id: result.insertId }, 201);
  } catch (err) { console.error('[CreateQuestion Error]', err); sendError(res, 'Internal server error.', 500); }
};
