# VibeLab Setup Guide

This guide will walk you through setting up VibeLab from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Project Setup](#supabase-project-setup)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** version 16 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A **Supabase account** ([Sign up free](https://supabase.com/))
- A **Google Cloud account** (optional, for Google OAuth)

Check your installations:
```bash
node --version  # Should be v16 or higher
npm --version   # Should be v7 or higher
```

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/VibeLab.git
cd VibeLab
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including React, Vite, Supabase, Tone.js, and more.

### 3. Create Environment File

Copy the example environment file:
```bash
cp .env.example .env.local
```

You'll fill in the values in the next section after creating your Supabase project.

---

## Supabase Project Setup

### 1. Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **"New Project"**
3. Fill in:
   - **Name:** VibeLab
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"**
5. Wait for the project to finish setting up (2-3 minutes)

### 2. Get Your API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)

3. Open your `.env.local` file and add these values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migrations

You need to create the database tables and storage buckets.

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in your Supabase project
2. Click **"New Query"**
3. Copy the contents of `supabase/migrations/001_create_schema.sql`
4. Paste into the editor and click **"Run"**
5. Repeat for `supabase/migrations/002_create_storage.sql`

#### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Set Up Authentication Providers

#### Email/Password Auth (Already Enabled)
Email authentication is enabled by default. No action needed!

#### Google OAuth (Optional)

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Find **Google** and toggle it on
3. You'll need:
   - **Client ID** from Google Cloud Console
   - **Client Secret** from Google Cloud Console

**Getting Google OAuth Credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**
8. Paste into Supabase Google provider settings
9. Click **Save**

### 5. Configure Storage Bucket

The migration should have created the `projects` bucket automatically. Verify:

1. Go to **Storage** in Supabase Dashboard
2. You should see a bucket named **projects**
3. Click on it and verify **Public bucket** is **OFF** (it should be private)

---

## Running the Application

### 1. Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v6.0.7  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 2. Open in Browser

Navigate to `http://localhost:5173`

### 3. Test Authentication

1. Click **"Sign Up"** on the login page
2. Enter an email and password (at least 6 characters)
3. Click **"Sign Up"**
4. You should see the Studio interface!

### 4. Test Basic Functionality

- **Import a Beat:** Click "Import Beat" and upload an MP3/WAV file
- **Record Vocals:** Click the red record button (or press R)
- **Write Lyrics:** Type in the right panel
- **Save Project:** Click Save (or Ctrl+S)
- **Sign Out:** Click "Sign Out" in the toolbar

---

## Troubleshooting

### Port 5173 Already in Use

If you see `Port 5173 is in use`, either:
- Kill the process using that port
- Or change the port in `vite.config.ts`:
  ```ts
  export default defineConfig({
    server: { port: 3000 },
    // ...
  })
  ```

### "Invalid API Key" Error

- Double-check your `.env.local` file
- Make sure you copied the **anon/public** key, not the service role key
- Restart the dev server after changing `.env.local`

### Database Connection Errors

- Verify migrations ran successfully in Supabase SQL Editor
- Check for any error messages in the SQL Editor
- Make sure your Supabase project is fully initialized

### Google OAuth Not Working

- Verify redirect URI matches exactly: `https://your-project.supabase.co/auth/v1/callback`
- Make sure Google OAuth provider is enabled in Supabase
- Check Client ID and Secret are correct

### Audio Recording Not Working

- Make sure you're using HTTPS or localhost (required for `getUserMedia`)
- Grant microphone permissions when prompted
- Check browser console for errors

### Build Errors

If you see TypeScript errors:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Storage Upload Fails

- Check Storage policies in Supabase Dashboard
- Verify the `projects` bucket exists
- Make sure RLS policies are applied from migration 002

---

## Production Build

To build for production:

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

To preview the production build locally:

```bash
npm run preview
```

---

## Next Steps

Once everything is working:

1. ✅ Test all features thoroughly
2. ✅ Customize the theme colors in `tailwind.config.js`
3. ✅ Add your own logo/branding
4. ✅ Deploy to Vercel, Netlify, or your preferred host
5. ✅ Set up a custom domain
6. ✅ Monitor usage in Supabase Dashboard

---

## Need Help?

- Check the [README.md](./README.md) for feature documentation
- Review [Supabase Documentation](https://supabase.com/docs)
- Open an issue on GitHub
- Email: support@vibelab.io

---

**Happy music making! 🎵**
