import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import { Api } from 'telegram/tl';
import db from '../db';

const apiId = parseInt(process.env.API_ID || '0');
const apiHash = process.env.API_HASH || '';
const sessionString = process.env.TELEGRAM_SESSION || '';

// Cấu hình giả lập thiết bị di động Samsung Galaxy S21 Ultra (Android 14)
// Để Telegram server nghĩ đây là một Telegram client di động thông thường
export const client = (apiId && apiHash)
  ? new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
      connectionRetries: 5,
      deviceModel: 'Samsung SM-G998B',      // Galaxy S21 Ultra
      systemVersion: '14',                     // Android 14
      appVersion: '10.14.5',                   // Telegram Android version
      systemLangCode: 'en',
      langCode: 'en',
      langPack: 'android',
      useWSS: false,
    })
  : null;

function detectTypeFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const audioExts = ['mp3', 'flac', 'wav', 'aac', 'ogg', 'opus', 'm4a', 'wma', 'aiff'];
  const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpeg', 'mpg', '3gp'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'ico', 'heic'];
  if (audioExts.includes(ext)) return 'audio';
  if (videoExts.includes(ext)) return 'video';
  if (imageExts.includes(ext)) return 'image';
  return 'document';
}

export async function startTelegramClient() {
  if (!client) {
    console.warn('Warning: API_ID/API_HASH not set. Telegram MTProto features disabled.');
    return;
  }

  await client.connect();
  if (!sessionString) {
    console.log('No TELEGRAM_SESSION set. Run `npm run generate-session` locally to create one.');
    return;
  }

  const me = await client.getMe();
  console.log(`🤖 MTProto connected as ${(me as any)?.firstName || 'User'} (mobile device simulation)`);
  console.log('Telegram client started and polling...');

  client.addEventHandler(async (event) => {
    const message = event.message;
    if (!message || !message.media) return;

    let fileName = 'Untitled';
    let type = 'document';
    let size = 0;
    let mimeType = '';
    let duration = 0;

    const media = message.media;

    if (media instanceof Api.MessageMediaDocument) {
      const doc = media.document;
      if (doc instanceof Api.Document) {
        mimeType = doc.mimeType;
        size = Number(doc.size);

        for (const attr of doc.attributes) {
          if (attr instanceof Api.DocumentAttributeFilename) {
            fileName = attr.fileName;
          }
          if (attr instanceof Api.DocumentAttributeAudio) {
            type = 'audio';
            duration = attr.duration || 0;
            if (attr.title) fileName = attr.title;
          }
          if (attr instanceof Api.DocumentAttributeVideo) {
            type = 'video';
            duration = attr.duration || 0;
          }
          if (attr instanceof Api.DocumentAttributeImageSize) {
            type = 'image';
          }
        }
      }
    } else if (media instanceof Api.MessageMediaPhoto) {
      type = 'image';
      fileName = `photo_${message.id}.jpg`;
    }

    // Fallback detection by file extension if still document
    if (type === 'document' && fileName !== 'Untitled') {
      const detected = detectTypeFromExtension(fileName);
      if (detected !== 'document') type = detected;
    }

    const chatId = message.chatId?.toString() || '';
    const messageId = message.id;
    const sizeMB = (size / 1024 / 1024).toFixed(2);

    console.log(`[MTProto] Received: ${fileName}, mime: ${mimeType}, type: ${type}, chat: ${chatId}, msg: ${messageId}`);

    try {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO media 
        (telegram_file_id, file_unique_id, file_name, title, artist, type, mime_type, size, duration, telegram_message_id, category, chat_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        '',
        '',
        fileName,
        fileName,
        '',
        type,
        mimeType,
        size,
        duration,
        messageId,
        '',
        chatId
      );

      await client.sendMessage(message.chatId!, {
        message: `✅ Added to Teledrive: *${fileName}* (${type})\nSize: ${sizeMB} MB`,
        parseMode: 'md',
      });
    } catch (err) {
      console.error('Error saving media:', err);
      await client.sendMessage(message.chatId!, {
        message: '❌ Failed to add media.',
      });
    }
  }, new NewMessage({}));
}

export async function streamMedia(res: any, chatId: string, messageId: number) {
  if (!client) throw new Error('MTProto client not initialized');

  const messages = await client.getMessages(chatId, { ids: messageId });
  if (!messages.length || !messages[0].media) {
    throw new Error('Media not found');
  }

  const media = messages[0].media;
  let mimeType = 'application/octet-stream';
  let size = 0;

  if (media instanceof Api.MessageMediaDocument) {
    const doc = media.document;
    if (doc instanceof Api.Document) {
      mimeType = doc.mimeType;
      size = Number(doc.size);
    }
  } else if (media instanceof Api.MessageMediaPhoto) {
    mimeType = 'image/jpeg';
  }

  res.setHeader('Content-Type', mimeType);
  if (size > 0) res.setHeader('Content-Length', size.toString());

  try {
    for await (const chunk of client.iterDownload({ file: media, requestSize: 512 * 1024 })) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream failed' });
    } else {
      res.end();
    }
  }
}
