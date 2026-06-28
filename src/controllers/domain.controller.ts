import { Request, Response } from 'express';
import { query, execute } from '../config/db';
import { sendSuccess, sendError } from '../config/response';
import { AuthRequest, DomainRow } from '../types';

export const listDomains = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string || '').trim();
    let sql = 'SELECT id, name, slug, description, icon, is_active, created_at FROM domains WHERE is_active = 1';
    const params: string[] = [];
    if (search) { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY name ASC';
    const domains = await query<DomainRow>(sql, params);
    sendSuccess(res, 'Domains fetched.', { domains });
  } catch (err) { console.error('[ListDomains Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const getDomainById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const domains = await query<DomainRow>('SELECT * FROM domains WHERE id = ? AND is_active = 1', [id]);
    if (domains.length === 0) { sendError(res, 'Domain not found.', 404); return; }
    const qStats = await query('SELECT difficulty, COUNT(*) as count FROM questions WHERE domain_id = ? AND is_active = 1 GROUP BY difficulty', [id]);
    sendSuccess(res, 'Domain fetched.', { domain: domains[0], questionStats: qStats });
  } catch (err) { console.error('[GetDomain Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const createDomain = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, icon } = req.body;
    if (!name || !slug) { sendError(res, 'Name and slug are required.', 400); return; }
    const result = await execute(
      `INSERT INTO domains (name, slug, description, icon, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())`,
      [name.trim(), slug.trim(), description || '', icon || '◈']
    );
    sendSuccess(res, 'Domain created.', { id: result.insertId }, 201);
  } catch (err) { console.error('[CreateDomain Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const updateDomain = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, icon, is_active } = req.body;
    await execute(
      `UPDATE domains SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon), is_active = COALESCE(?, is_active) WHERE id = ?`,
      [name || null, description || null, icon || null, is_active ?? null, id]
    );
    sendSuccess(res, 'Domain updated.');
  } catch (err) { console.error('[UpdateDomain Error]', err); sendError(res, 'Internal server error.', 500); }
};

export const deleteDomain = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await execute('UPDATE domains SET is_active = 0 WHERE id = ?', [req.params.id]);
    sendSuccess(res, 'Domain deleted (soft).');
  } catch (err) { console.error('[DeleteDomain Error]', err); sendError(res, 'Internal server error.', 500); }
};
