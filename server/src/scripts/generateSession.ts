import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiId = parseInt(process.env.API_ID || '0');
const apiHash = process.env.API_HASH || '';

if (!apiId || !apiHash) {
  console.error('Error: API_ID and API_HASH must be set in server/.env');
  console.log('Get them from https://my.telegram.org/apps');
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((resolve) => rl.question(q, resolve));

const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
  connectionRetries: 5,
  deviceModel: 'Samsung SM-G998B',
  systemVersion: '14',
  appVersion: '10.14.5',
  systemLangCode: 'en',
  langCode: 'en',
  langPack: 'android',
});

(async () => {
  console.log('🔐 Telegram MTProto Session Generator');
  console.log('This will simulate a Samsung Galaxy S21 Ultra (Android 14) device.\n');

  await client.start({
    phoneNumber: async () => await ask('Enter phone number (with country code, e.g. +84...): '),
    password: async () => await ask('Enter 2FA password (if any, press Enter to skip): '),
    phoneCode: async () => await ask('Enter OTP code from Telegram: '),
    onError: (err) => console.log(err),
  });

  const session = client.session.save() as unknown as string;
  console.log('\n✅ Session generated successfully!');
  console.log('\n--- COPY THIS TO YOUR .env FILE ---');
  console.log(`TELEGRAM_SESSION=${session}`);
  console.log('--- END ---\n');

  await client.disconnect();
  rl.close();
})();
