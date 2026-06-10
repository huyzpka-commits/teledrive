import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mediaRouter from './routes/media';
import playlistRouter from './routes/playlists';
import { startTelegramBot } from './services/telegram';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/media', mediaRouter);
app.use('/api/playlists', playlistRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  startTelegramBot();
});
