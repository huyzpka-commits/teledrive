import { Router } from 'express';
import db from '../db';
import { streamMedia } from '../services/telegram';

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
    if (!row.chat_id || !row.telegram_message_id) {
      return res.status(400).json({ error: 'Media not available for streaming (missing MTProto reference)' });
    }

    await streamMedia(res, row.chat_id, row.telegram_message_id);
  } catch (e) {
    res.status(500).json({ error: 'Failed to stream media', detail: (e as Error).message });
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
