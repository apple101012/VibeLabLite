# VibeLab 🎵

A fast, browser-based music creation platform focused on vocal production. Create, record, and produce music with instant beat uploads, vocal recording, effects, and lyrics—all in your browser.

![Theme: Dark with Cyan Accents](https://img.shields.io/badge/Theme-Dark%20%2B%20Cyan-00E5FF)
![Built with React](https://img.shields.io/badge/React-18-61DAFB)
![Powered by Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E)

## ✨ Features

- 🎤 **Instant Vocal Recording** - One-click recording with Web Audio API
- 🎵 **Beat Upload** - Drag and drop MP3/WAV beats
- 🎛️ **Vocal Effects** - Autotune, reverb, compression, EQ, noise reduction
- 📝 **Lyrics Editor** - Write and save lyrics alongside your project
- ☁️ **Cloud Storage** - All projects saved to Supabase
- 🔐 **Secure Auth** - Email/password and Google OAuth
- 🌙 **Dark Theme** - Sleek black background with cyan neon accents
- ⚡ **Fast & Minimal** - Optimized for speed and simplicity

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/VibeLab.git
   cd VibeLab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase**
   
   Run the migrations in your Supabase project:
   - Navigate to SQL Editor in Supabase Dashboard
   - Copy and run `supabase/migrations/001_create_schema.sql`
   - Copy and run `supabase/migrations/002_create_storage.sql`
   
   Or if using Supabase CLI:
   ```bash
   supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🎮 Usage

### Creating Your First Track

1. **Sign Up/Login** - Create an account or sign in with Google
2. **Create Project** - Your project is automatically created
3. **Import Beat** - Click "Import Beat" and upload an MP3 or WAV file
4. **Record Vocals** - Press `R` or click the record button
5. **Write Lyrics** - Use the lyrics panel on the right
6. **Apply Effects** - Open the effects panel and adjust settings
7. **Save** - Click Save or press `Ctrl+S`

### Keyboard Shortcuts (Planned)

| Shortcut | Action |
|----------|--------|
| `R` | Record |
| `Space` | Play/Pause |
| `S` | Stop |
| `Ctrl+S` | Save |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `L` | Toggle Lyrics Panel |
| `+/-` | Zoom In/Out |

## 🏗️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Backend/Database:** Supabase (Postgres)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Audio:** Tone.js + Web Audio API
- **Export:** FFmpeg WASM (planned)

## 📁 Project Structure

```
VibeLab/
├── src/
│   ├── components/          # React components
│   │   ├── Auth.tsx        # Login/signup
│   │   ├── Studio.tsx      # Main studio
│   │   ├── Toolbar.tsx     # Control toolbar
│   │   ├── Timeline.tsx    # Audio tracks
│   │   ├── LyricsPanel.tsx # Lyrics editor
│   │   └── EffectsPanel.tsx # Effects controls
│   ├── lib/
│   │   └── supabaseClient.ts # Supabase config
│   ├── types/
│   │   └── database.ts     # TypeScript types
│   └── index.css           # Tailwind styles
├── supabase/
│   └── migrations/         # Database migrations
└── package.json
```

## 🎨 Design Philosophy

VibeLab follows a **speed-first, minimal complexity** approach:

- **Dark Neon Aesthetic** - Black (#000000) base with cyan (#00E5FF) accents
- **One-Click Actions** - Minimal clicks for maximum productivity
- **Everything Visible** - Tracks and lyrics displayed simultaneously
- **No DAW Bloat** - Hide engineering-level complexity
- **Beginner Friendly** - Intuitive for BandLab/Soundtrap users

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- Users can only access their own projects and files
- Storage buckets protected with user-level policies
- Authentication via Supabase Auth (email/password + OAuth)

## 🛣️ Roadmap

### Current (MVP)
- [x] Authentication
- [x] Project management
- [x] Beat upload
- [x] Vocal recording
- [x] Lyrics editor
- [x] Effects panel UI

### Next Steps
- [ ] Keyboard shortcuts
- [ ] MP3/WAV/Project export
- [ ] Actual audio effects processing
- [ ] Waveform visualization
- [ ] Undo/Redo
- [ ] Multi-track mixing

### Future (AI Features)
- [ ] AI key detection
- [ ] AI vocal enhancement
- [ ] AI lyric generation
- [ ] AI harmonic doubling
- [ ] AI auto-mix
- [ ] AI beat matching

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **Tone.js** - Web audio framework
- **React** - UI framework
- **TailwindCSS** - Styling

## 📞 Support

For support, email support@vibelab.io or open an issue on GitHub.

---

**Made with 🎵 by the VibeLab Team**
