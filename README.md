# Teledrive

A free, self-hosted media streaming platform powered by **Telegram Cloud**. Stream your music, movies, and images directly from Telegram with original quality — no expensive storage needed.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Tech Stack](https://img.shields.io/badge/Telegram-Bot%20API-blue?logo=telegram)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## Features

- **Stream Audio & Video** directly from Telegram Cloud (no storage cost)
- **Image Gallery** — browse and view photos in full quality
- **Original Quality** — bot prompts to upload as `Document` (avoids Telegram compression)
- **Dark Mode UI** — Netflix/Spotify inspired interface with Tailwind CSS
- **Search & Filter** — find media by name, artist, or type instantly
- **Playlist Management** — create and manage custom playlists
- **Responsive Design** — works on desktop, tablet, and mobile
- **Auto-index** — bot auto-detects file type by extension and MIME type
- **Free Hosting** — deploy to Render.com completely free

---

## Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | SQLite (better-sqlite3) with WAL mode |
| **Storage** | Telegram Cloud via Bot API (unlimited free storage) |
| **Deployment** | Docker + Render.com (free tier) |

---

## Project Structure

```
teledrive/
├── client/          # React SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/    # Sidebar, MediaCard, PlayerBar, SearchBar
│   │   ├── pages/         # Home, Library, MediaPlayer
│   │   └── api.ts         # Axios API client
│   └── package.json
├── server/          # Express API + Telegram Bot
│   ├── src/
│   │   ├── db.ts          # SQLite schema & connection
│   │   ├── routes/        # media.ts, playlists.ts
│   │   ├── services/      # telegram.ts (bot logic)
│   │   └── index.ts       # Express server entry
│   └── package.json
├── Dockerfile       # Multi-stage Docker build
├── render.yaml      # Render.com deploy blueprint
└── package.json     # Root monorepo workspace config
```

---

## Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/huyzpka-commits/teledrive.git
cd teledrive
npm install
```

### 2. Get Telegram Bot Token

1. Open Telegram and search for **[@BotFather](https://t.me/botfather)**
2. Send `/newbot` and follow instructions
3. Copy the token (looks like `123456789:ABCdef...`)

### 3. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=3001
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=development
```

### 4. Run Development

```bash
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3001

---

## Adding Media (Upload via Telegram Bot)

1. **Send any file** to your Telegram bot (audio, video, image, document)
2. The bot will reply with an **inline keyboard**:
   - 📁 **Upload as File (Keep Quality)** — saves to your library with original quality
   - ❌ **Cancel** — discards the file
3. Visit your Teledrive web app to browse and stream!

> **Tip:** On mobile, tap the 📎 icon and choose **"File"** instead of **"Photo/Video"** to avoid Telegram compression.

---

## Deploy to Render (Free Hosting)

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Connect to Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New +** → **Blueprint**
3. Select your `huyzpka-commits/teledrive` repository
4. Render will auto-read `render.yaml` and create your service

### 3. Add Environment Variables

In your Render service dashboard, go to **Environment** tab:

| Key | Value |
|-----|-------|
| `TELEGRAM_BOT_TOKEN` | `123456789:ABCdef...` (from BotFather) |

### 4. Deploy

Click **Deploy** — your app will be live at `https://teledrive-xxx.onrender.com`

### 5. Keep It Online (Free Tier)

Render free tier sleeps after 15 minutes of inactivity. Use [UptimeRobot](https://uptimerobot.com) to ping it every 5 minutes:

- **URL:** `https://teledrive-xxx.onrender.com/api/health`
- **Interval:** 5 minutes

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/media` | List all media (query: `?type=audio/video/image&search=...&limit=50`) |
| `GET` | `/api/media/:id` | Get media details |
| `GET` | `/api/media/:id/stream` | Stream redirect (direct Telegram URL) |
| `DELETE` | `/api/media/:id` | Delete media from library |
| `GET` | `/api/playlists` | List playlists |
| `POST` | `/api/playlists` | Create playlist |
| `GET` | `/api/playlists/:id/items` | Get playlist items |
| `POST` | `/api/playlists/:id/items` | Add item to playlist |
| `DELETE` | `/api/playlists/:id/items/:itemId` | Remove item from playlist |

---

## Supported File Types

| Category | Extensions | Detected Type |
|----------|-----------|---------------|
| **Audio** | `.mp3`, `.flac`, `.wav`, `.aac`, `.ogg`, `.opus`, `.m4a`, `.wma` | `audio` |
| **Video** | `.mp4`, `.mkv`, `.avi`, `.mov`, `.wmv`, `.webm`, `.mpeg`, `.3gp` | `video` |
| **Images** | `.jpg`, `.png`, `.gif`, `.webp`, `.bmp`, `.tiff`, `.svg` | `image` |
| **Documents** | `.pdf`, `.zip`, `.docx`, `.txt`, etc. | `document` |

---

## Customization

### Change Default Port

Edit `server/.env`:
```env
PORT=3001
```

### Modify UI Theme

Edit `client/tailwind.config.js` and `client/src/index.css` to customize colors and dark mode styling.

### Bot Commands

You can set bot commands via [@BotFather](https://t.me/botfather):

```
start - Start using Teledrive
help - How to upload and stream
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Music not showing in **Music** tab | Make sure you send file as **Document** (not Quick Video/Audio). Bot detects type by extension if MIME is unclear. |
| Bot not responding | Check `TELEGRAM_BOT_TOKEN` is correct. Delete and recreate if needed. |
| Website sleeps on free tier | Set up [UptimeRobot](https://uptimerobot.com) ping to `/api/health` every 5 minutes. |
| Build fails on Render | Check `package-lock.json` is committed. Run `npm install --package-lock-only` locally if needed. |
| TypeScript errors | Ensure `strict` mode is enabled in `tsconfig.json`. Use `as` type assertions for DB rows if needed. |

---

## License

MIT — feel free to fork, modify, and deploy your own instance!

---

**Made with ❤️ for the Telegram community.**
