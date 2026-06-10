# Teledrive

A free, self-hosted media streaming platform powered by **Telegram Cloud**. Stream your music, movies, and images directly from Telegram with original quality — no expensive storage needed.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Tech Stack](https://img.shields.io/badge/Telegram-MTProto-blue?logo=telegram)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## Features

- **Stream Audio & Video** directly from Telegram Cloud (no storage cost)
- **Image Gallery** — browse and view photos in full quality
- **Original Quality** — files uploaded as documents (no Telegram compression)
- **Dark Mode UI** — Netflix/Spotify inspired interface with Tailwind CSS
- **Search & Filter** — find media by name, artist, or type instantly
- **Playlist Management** — create and manage custom playlists
- **Responsive Design** — works on desktop, tablet, and mobile
- **Auto-index** — detects file type by extension and MIME type automatically
- **MTProto Mobile Simulation** — disguises as a Samsung Galaxy S21 Ultra (Android 14) to avoid detection
- **Free Hosting** — deploy to Render.com completely free

---

## Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | SQLite (better-sqlite3) with WAL mode |
| **Telegram Protocol** | MTProto Client API (GramJS) — simulates mobile device |
| **Storage** | Telegram Cloud (unlimited free storage) |
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
├── server/          # Express API + MTProto Telegram Client
│   ├── src/
│   │   ├── db.ts          # SQLite schema & connection
│   │   ├── routes/        # media.ts, playlists.ts
│   │   ├── services/      # telegram.ts (MTProto client logic)
│   │   ├── scripts/       # generateSession.ts (one-time login)
│   │   └── index.ts       # Express server entry
│   └── package.json
├── Dockerfile       # Multi-stage Docker build
├── render.yaml      # Render.com deploy blueprint
└── package.json     # Root monorepo workspace config
```

---

## Why MTProto instead of Bot API?

| Feature | Bot API | MTProto (This Project) |
|---------|---------|------------------------|
| **Detection** | Known as bot/scraper | **Simulates mobile device** (Samsung Galaxy) |
| **Rate Limits** | Stricter | **Relaxed** (user-level limits) |
| **File Access** | Only via bot token | **Full user access** (groups, channels, saved messages) |
| **Compression** | Photos/videos compressed | **Document upload = original quality** |
| **Privacy** | Bot activity logged | **Indistinguishable from normal user** |

---

## Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/huyzpka-commits/teledrive.git
cd teledrive
npm install
```

### 2. Get Telegram API Credentials

1. Go to [https://my.telegram.org/apps](https://my.telegram.org/apps)
2. Log in with your phone number
3. Create a new app:
   - **App title:** `Teledrive`
   - **Short name:** `teledrive`
   - **Platform:** `Desktop`
   - **Description:** `Personal media streaming from Telegram`
4. Copy **API_ID** (a number) and **API_HASH** (a string)

### 3. Generate Session String (One-Time)

```bash
cd server
cp .env.example .env
# Edit .env: add your API_ID and API_HASH

npm run generate-session
```

Follow the prompts:
1. Enter your phone number (with country code, e.g. `+84...`)
2. Enter the OTP code sent to your Telegram
3. Enter 2FA password if you have one

The script will output a **session string**. Copy it.

### 4. Configure Environment

Edit `server/.env`:
```env
PORT=3001
API_ID=12345678
API_HASH=your_api_hash_here
TELEGRAM_SESSION=your_session_string_here
NODE_ENV=development
```

### 5. Run Development

```bash
# From root directory
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3001

---

## Adding Media (Upload via Telegram)

1. **Send any file** to yourself (Saved Messages) or any chat where your account is active
   - On mobile: tap 📎 → **File** (not Photo/Video) to keep original quality
2. Teledrive will **auto-index** the file within seconds
3. Visit your web app to browse and stream!

> **Tip:** Forward media from channels/groups to your Saved Messages. Teledrive detects everything automatically.

---

## Deploy to Render (Free Hosting)

### 1. Generate Session String Locally

You **must** run the session generator on your local machine first (see Step 3 above). You cannot generate a session on Render (no interactive terminal).

### 2. Push to GitHub

```bash
git push origin main
```

### 3. Connect to Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New +** → **Blueprint**
3. Select your `huyzpka-commits/teledrive` repository
4. Render will auto-read `render.yaml` and create your service

### 4. Add Environment Variables

In your Render service dashboard, go to **Environment** tab:

| Key | Value |
|-----|-------|
| `API_ID` | `12345678` (from my.telegram.org) |
| `API_HASH` | `your_api_hash` (from my.telegram.org) |
| `TELEGRAM_SESSION` | `your_session_string` (from local generator) |

> ⚠️ **Never commit `.env` or session string to GitHub!** Only add to Render dashboard.

### 5. Deploy

Click **Deploy** — your app will be live at `https://teledrive-xxx.onrender.com`

### 6. Keep It Online (Free Tier)

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
| `GET` | `/api/media/:id/stream` | Stream media directly via MTProto (chunked download) |
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

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Music not showing in Music tab** | Send file as **Document** (not Quick Video/Audio). App detects type by extension if MIME is unclear. |
| **MTProto not connecting** | Check `API_ID` and `API_HASH` are correct. Ensure `TELEGRAM_SESSION` is set. |
| **Session expired / banned** | Regenerate session string with `npm run generate-session`. If banned, wait 24 hours. |
| **Website sleeps on free tier** | Set up [UptimeRobot](https://uptimerobot.com) ping to `/api/health` every 5 minutes. |
| **Build fails on Render** | Check `package-lock.json` is committed. Run `npm install --package-lock-only` locally if needed. |
| **Stream is slow** | MTProto downloads chunks directly from Telegram datacenters. Speed depends on your Render instance region. |
| **TypeScript errors** | Ensure `strict` mode is enabled in `tsconfig.json`. Use `as` type assertions for DB rows if needed. |

---

## Security Warning

⚠️ **Your Telegram account is valuable.** Using MTProto with automated tools carries a small risk of rate-limiting or temporary suspension by Telegram if abused. Teledrive mitigates this by:

- Simulating a legitimate Samsung Galaxy device
- Using conservative download chunk sizes (512KB)
- Only downloading files when you explicitly stream them

**Never share your `API_HASH` or `TELEGRAM_SESSION` with anyone.** These are equivalent to your Telegram password.

---

## License

MIT — feel free to fork, modify, and deploy your own instance!

---

**Made with ❤️ for the Telegram community.**
