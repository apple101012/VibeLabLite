# VibeLab Developer Quick Reference

Quick commands and info for VibeLab development.

## 🚀 Commands

```bash
# Development
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# Setup
.\setup.ps1          # Windows setup script
./setup.sh           # Linux/Mac setup script
npm install          # Install dependencies
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.tsx          # Login/signup
│   ├── Studio.tsx        # Main container
│   ├── Toolbar.tsx       # Top controls
│   ├── Timeline.tsx      # Audio tracks
│   ├── LyricsPanel.tsx   # Lyrics editor
│   └── EffectsPanel.tsx  # Effects controls
├── lib/
│   └── supabaseClient.ts # Supabase config
├── types/
│   └── database.ts       # TS types
├── App.tsx               # Root component
├── main.tsx              # Entry point
└── index.css             # Styles
```

## 🎨 Theme Colors

```css
--vibelab-dark:     #000000  /* Black background */
--vibelab-cyan:     #00E5FF  /* Neon cyan accent */
--vibelab-charcoal: #0A0F14  /* Dark gray elements */
```

## 🗄️ Database Schema

**projects**
- id, user_id, name, lyrics, bpm, key, created_at, updated_at

**tracks**
- id, project_id, type, file_path, position, effects, created_at

**Storage:** `projects` bucket → `{userId}/{projectId}/beats|vocals/`

## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## 🧩 Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` | UI framework |
| `@supabase/supabase-js` | Backend |
| `tone` | Audio playback |
| `@ffmpeg/ffmpeg` | Export |
| `tailwindcss` | Styling |

## 📡 Supabase Setup

```sql
-- Run in SQL Editor:
1. supabase/migrations/001_create_schema.sql
2. supabase/migrations/002_create_storage.sql
```

## 🎯 Key Features Status

✅ Implemented
- Auth (email + Google)
- Project CRUD
- Beat upload
- Vocal recording
- Lyrics editor
- Effects UI
- Dark theme

❌ Pending
- Keyboard shortcuts
- Export (MP3/WAV/project)
- Real audio effects
- Waveform viz
- Undo/redo

## 🐛 Common Issues

**Import errors:** Restart TS server
**Auth fails:** Check .env.local and Supabase URLs
**Audio won't record:** Must use HTTPS or localhost
**Build fails:** Clear node_modules, reinstall

## 📚 Documentation

- `README.md` - Overview & features
- `SETUP.md` - Local setup guide
- `DEPLOY.md` - Deployment instructions
- `current.txt` - Current state snapshot
- `changelog.txt` - Change history

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [Tone.js Docs](https://tonejs.github.io)
- [Tailwind Docs](https://tailwindcss.com)

## 🎹 Planned Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Record |
| `Space` | Play/Pause |
| `S` | Stop |
| `Ctrl+S` | Save |
| `Ctrl+Z` | Undo |
| `L` | Lyrics toggle |
| `+/-` | Zoom |

---

**Last Updated:** 2025-01-16
