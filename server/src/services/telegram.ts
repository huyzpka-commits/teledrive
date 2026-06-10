import TelegramBot from 'node-telegram-bot-api';
import db from '../db';

const token = process.env.TELEGRAM_BOT_TOKEN || '';

if (!token) {
  console.warn('Warning: TELEGRAM_BOT_TOKEN is not set. Telegram bot features will be disabled.');
}

export const bot = token ? new TelegramBot(token, { polling: true }) : null;

export function startTelegramBot() {
  if (!bot) return;

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const file = msg.audio || msg.video || msg.document;

    if (!file) {
      if (msg.text && msg.text.startsWith('/')) return;
      return;
    }

    const isAudio = !!msg.audio || (msg.document?.mime_type?.startsWith('audio/'));
    const isVideo = !!msg.video || (msg.document?.mime_type?.startsWith('video/'));

    if (!isAudio && !isVideo) return;

    const type = isAudio ? 'audio' : 'video';
    const fileName = file.file_name || msg.caption || 'Untitled';
    const title = msg.audio?.title || fileName;
    const artist = msg.audio?.performer || null;

    try {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO media 
        (telegram_file_id, file_unique_id, file_name, title, artist, type, mime_type, size, duration, telegram_message_id, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        file.file_id,
        file.file_unique_id,
        fileName,
        title,
        artist,
        type,
        file.mime_type,
        file.file_size || null,
        (msg.audio || msg.video)?.duration || null,
        msg.message_id,
        null
      );

      bot.sendMessage(chatId, `✅ Added to Teledrive: *${title}* (${type})`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Error saving media:', err);
      bot.sendMessage(chatId, '❌ Failed to add media.');
    }
  });

  bot.onText(/\/start/, (msg) => {
    bot?.sendMessage(msg.chat.id, 'Welcome to Teledrive Bot! Send me audio or video files to add them to your library.');
  });

  console.log('Telegram bot started and polling...');
}

export async function getFileUrl(fileId: string): Promise<string> {
  if (!bot) throw new Error('Bot not initialized');
  const file = await bot.getFile(fileId);
  return `https://api.telegram.org/file/bot${token}/${file.file_path}`;
}
