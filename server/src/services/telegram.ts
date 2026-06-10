import TelegramBot from 'node-telegram-bot-api';
import db from '../db';

const token = process.env.TELEGRAM_BOT_TOKEN || '';

if (!token) {
  console.warn('Warning: TELEGRAM_BOT_TOKEN is not set. Telegram bot features will be disabled.');
}

export const bot = token ? new TelegramBot(token, { polling: true }) : null;

// Tạm lưu file đợi user xác nhận
interface PendingFile {
  chatId: number;
  file: TelegramBot.Audio | TelegramBot.Video | TelegramBot.Document | TelegramBot.PhotoSize;
  fileType: string;
  fileName: string;
  title: string;
  artist: string | null;
  mimeType?: string;
  size?: number;
  duration?: number;
  messageId: number;
}
const pendingFiles = new Map<string, PendingFile>();

function getMimeType(msg: TelegramBot.Message, fileType: string): string | undefined {
  return msg.document?.mime_type || msg.audio?.mime_type || msg.video?.mime_type;
}

function getSize(msg: TelegramBot.Message, fileType: string): number | undefined {
  return msg.document?.file_size || msg.audio?.file_size || msg.video?.file_size;
}

function getDuration(msg: TelegramBot.Message, fileType: string): number | undefined {
  return msg.audio?.duration || msg.video?.duration;
}

export function startTelegramBot() {
  if (!bot) return;

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Ưu tiên document (file upload nguyên bản) -> giữ chất lượng gốc
    const file = msg.document || msg.audio || msg.video || (msg.photo ? msg.photo[msg.photo.length - 1] : null);

    if (!file) {
      if (msg.text && msg.text.startsWith('/')) {
        if (msg.text === '/start') {
          bot?.sendMessage(chatId, '👋 Welcome to Teledrive!\n\nSend me any file (audio, video, document, image) and choose "📁 Upload as File" to keep original quality.\n\n💡 Tip: On mobile, tap the 📎 icon and choose "File" instead of "Photo/Video" to avoid compression.');
        }
      }
      return;
    }

    const fileAny = file as any;
    const fileName = fileAny.file_name || msg.caption || 'Untitled';

    let type = 'document';
    const mime = getMimeType(msg, type);
    if (mime?.startsWith('audio/')) type = 'audio';
    else if (mime?.startsWith('video/')) type = 'video';
    else if (mime?.startsWith('image/')) type = 'image';

    const title = msg.audio?.title || fileName;
    const artist = msg.audio?.performer || null;

    const pendingId = `${chatId}_${msg.message_id}`;
    pendingFiles.set(pendingId, {
      chatId,
      file,
      fileType: type,
      fileName,
      title,
      artist,
      mimeType: mime,
      size: getSize(msg, type),
      duration: getDuration(msg, type),
      messageId: msg.message_id,
    });

    await bot.sendMessage(chatId, `📂 *${fileName}*\n\nType: \`${type}\`\nSize: \`${(getSize(msg, type) || 0 / 1024 / 1024).toFixed(2)} MB\`\n\nDo you want to upload this file to Teledrive?`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📁 Upload as File (Keep Quality)', callback_data: `upload:${pendingId}` },
          ],
          [
            { text: '❌ Cancel', callback_data: `cancel:${pendingId}` },
          ],
        ],
      },
    });
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const msgId = query.message?.message_id;
    const data = query.data;
    if (!data || !chatId || !msgId) return;

    await bot.answerCallbackQuery(query.id);

    if (data.startsWith('upload:')) {
      const pendingId = data.replace('upload:', '');
      const pending = pendingFiles.get(pendingId);
      if (!pending) {
        await bot.editMessageText('❌ File expired or already processed.', { chat_id: chatId, message_id: msgId });
        return;
      }

      try {
        const fileAny = pending.file as any;
        const stmt = db.prepare(`
          INSERT OR IGNORE INTO media 
          (telegram_file_id, file_unique_id, file_name, title, artist, type, mime_type, size, duration, telegram_message_id, category)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          fileAny.file_id,
          fileAny.file_unique_id,
          pending.fileName,
          pending.title,
          pending.artist,
          pending.fileType,
          pending.mimeType || null,
          pending.size || null,
          pending.duration || null,
          pending.messageId,
          null
        );

        pendingFiles.delete(pendingId);
        await bot.editMessageText(`✅ Added to Teledrive: *${pending.title}* (${pending.fileType})`, {
          chat_id: chatId,
          message_id: msgId,
          parse_mode: 'Markdown',
        });
      } catch (err) {
        console.error('Error saving media:', err);
        await bot.editMessageText('❌ Failed to add media.', { chat_id: chatId, message_id: msgId });
      }
    } else if (data.startsWith('cancel:')) {
      const pendingId = data.replace('cancel:', '');
      pendingFiles.delete(pendingId);
      await bot.editMessageText('🚫 Upload cancelled.', { chat_id: chatId, message_id: msgId });
    }
  });

  console.log('Telegram bot started and polling...');
}

export async function getFileUrl(fileId: string): Promise<string> {
  if (!bot) throw new Error('Bot not initialized');
  const file = await bot.getFile(fileId);
  return `https://api.telegram.org/file/bot${token}/${file.file_path}`;
}
