import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM playlists ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = db.prepare('INSERT INTO playlists (name) VALUES (?)').run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id/items', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT m.*, pi.position 
      FROM playlist_items pi
      JOIN media m ON pi.media_id = m.id
      WHERE pi.playlist_id = ?
      ORDER BY pi.position
    `).all(req.params.id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/:id/items', (req, res) => {
  try {
    const { media_id } = req.body;
    const playlist_id = req.params.id;
    const maxPos = db.prepare('SELECT MAX(position) as maxPos FROM playlist_items WHERE playlist_id = ?').get(playlist_id);
    const nextPos = (maxPos?.maxPos || 0) + 1;
    const result = db.prepare('INSERT INTO playlist_items (playlist_id, media_id, position) VALUES (?, ?, ?)').run(playlist_id, media_id, nextPos);
    res.json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id/items/:itemId', (req, res) => {
  try {
    db.prepare('DELETE FROM playlist_items WHERE id = ? AND playlist_id = ?').run(req.params.itemId, req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
