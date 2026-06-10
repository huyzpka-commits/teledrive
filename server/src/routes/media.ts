import { Router } from 'express';
import db from '../db';
import { getFileUrl } from '../services/telegram';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { type, search, limit = '50', offset = '0' } = req.query;
    let sql = 'SELECT * FROM media WHERE 1=1';
    const params: (string | number)[] = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type as string);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR artist LIKE ? OR file_name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(sql).all(...params);
    res.json({ data: rows, total: rows.length });
  } catch (e) {
    res.status(500).json({ error: 'Database error', detail: (e as Error).message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id) as Record<string, any> | undefined;
    if (!row) return res.status(404).json({ error: 'Media not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id/stream', async (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id) as Record<string, any> | undefined;
    if (!row) return res.status(404).json({ error: 'Media not found' });

    const url = await getFileUrl(row.telegram_file_id);
    res.redirect(url);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate stream URL', detail: (e as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
