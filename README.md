# Teledrive

A web-based media streaming application that uses Telegram as a storage backend. Stream your music and movies directly from Telegram channels.

## Features
- Stream Audio & Video directly from Telegram
- Playlist Management
- Dark Mode UI inspired by Netflix/Spotify
- Search & Filter
- Responsive Design
- Auto-index media from Telegram Bot

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Storage**: Telegram Cloud via Bot API

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/huyzpka-commits/teledrive.git
cd teledrive
npm install
```

### 2. Configure Environment
Create `server/.env` from `server/.env.example`:
```env
PORT=3001
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=development
```

To get a Telegram Bot Token:
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot and copy the token

### 3. Run Development
```bash
npm run dev
```
- Client: http://localhost:5173
- Server: http://localhost:3001

### 4. Add Media
Send audio or video files to your Telegram bot. They will be automatically indexed into the library.

### 5. Production Build
```bash
npm run build
npm start
```

## API Endpoints
- `GET /api/media` - List media
- `GET /api/media/:id` - Get media details
- `GET /api/media/:id/stream` - Stream redirect
- `GET /api/playlists` - List playlists
- `POST /api/playlists` - Create playlist

## License
MIT
