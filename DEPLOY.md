# VibeLab Deployment Guide

This guide covers deploying VibeLab to production on various hosting platforms.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables](#environment-variables)
3. [Deploy to Vercel](#deploy-to-vercel)
4. [Deploy to Netlify](#deploy-to-netlify)
5. [Deploy to Other Platforms](#deploy-to-other-platforms)
6. [Post-Deployment Steps](#post-deployment-steps)
7. [Custom Domain Setup](#custom-domain-setup)

---

## Pre-Deployment Checklist

Before deploying, make sure:

- ✅ Your Supabase project is set up and running
- ✅ Database migrations have been applied (001 and 002)
- ✅ Storage bucket 'projects' exists and has correct policies
- ✅ Google OAuth is configured (if using)
- ✅ You've tested the app locally with `npm run dev`
- ✅ All environment variables are ready
- ✅ You have a GitHub account (for most platforms)

---

## Environment Variables

You'll need these environment variables in production:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
- Go to your Supabase project → Settings → API
- Copy the **Project URL** and **anon/public** key

**Important:** Never commit `.env.local` to Git! These values will be set in your hosting platform's dashboard.

---

## Deploy to Vercel

Vercel is the recommended platform for VibeLab (same company that makes Next.js).

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial VibeLab commit"
git branch -M main
git remote add origin https://github.com/yourusername/VibeLab.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your VibeLab repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)

### 3. Add Environment Variables

In the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environments: Check all (Production, Preview, Development)
   
3. Add the second variable:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your anon key
   - Environments: Check all

### 4. Deploy

1. Click **"Deploy"**
2. Wait for build to complete (1-2 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### 5. Update Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to **Site URL:**
   ```
   https://your-project.vercel.app
   ```
3. Add to **Redirect URLs:**
   ```
   https://your-project.vercel.app/**
   ```

---

## Deploy to Netlify

### 1. Push to GitHub

(Same as Vercel step 1 above)

### 2. Import to Netlify

1. Go to [Netlify](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your VibeLab repo
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)

### 3. Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add both variables:
   - `VITE_SUPABASE_URL` → Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → Your anon key

### 4. Deploy

1. Click **"Deploy site"**
2. Wait for build (1-2 minutes)
3. Your app will be live at `https://random-name.netlify.app`

### 5. Update Supabase Redirect URLs

Same as Vercel step 5, but use your Netlify URL.

---

## Deploy to Other Platforms

### GitHub Pages

GitHub Pages doesn't support SPA routing well, so **not recommended** for VibeLab.

### DigitalOcean App Platform

1. Connect your GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in dashboard
5. Deploy!

### Railway

1. Connect GitHub repo
2. Railway auto-detects Vite
3. Add environment variables in dashboard
4. Deploy!

### Self-Hosted (VPS/Cloud)

If you want to host on your own server:

```bash
# Build locally or in CI
npm run build

# Upload dist/ folder to your server
scp -r dist/* user@yourserver:/var/www/vibelab/

# Configure Nginx
server {
    listen 80;
    server_name vibelab.yourdomain.com;
    root /var/www/vibelab;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Enable HTTPS with Let's Encrypt
sudo certbot --nginx -d vibelab.yourdomain.com
```

---

## Post-Deployment Steps

### 1. Test Core Features

Visit your deployed app and test:

- ✅ Sign up with email/password
- ✅ Sign in with Google (if enabled)
- ✅ Upload a beat
- ✅ Record vocals
- ✅ Write lyrics
- ✅ Save project
- ✅ Sign out and back in
- ✅ Load saved project

### 2. Monitor Performance

- Check Vercel/Netlify analytics
- Monitor Supabase usage in dashboard
- Set up error tracking (Sentry, LogRocket, etc.)

### 3. Set Up CI/CD

Your deployments are automatic! Every push to `main` triggers a new deployment.

**To deploy to preview:**
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Creates a preview deployment
```

### 4. Enable HTTPS

Most platforms (Vercel, Netlify) automatically provide HTTPS. If self-hosting, use Let's Encrypt.

---

## Custom Domain Setup

### Vercel

1. Go to project **Settings** → **Domains**
2. Add your domain: `vibelab.com`
3. Follow DNS instructions (add A/CNAME records)
4. Wait for DNS propagation (5-60 minutes)
5. Vercel automatically provisions SSL

### Netlify

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain
4. Update DNS records as instructed
5. Enable HTTPS (automatic with Let's Encrypt)

### DNS Records

Typical setup for `vibelab.com`:

```
Type    Name    Value                          TTL
A       @       76.76.21.21                    300
CNAME   www     your-project.vercel.app        300
```

---

## Production Optimizations

### 1. Enable Gzip/Brotli Compression

Most platforms do this automatically, but verify in Network tab.

### 2. Add Security Headers

In Vercel, create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Set Up Analytics

Add Vercel Analytics or Google Analytics:

```tsx
// src/main.tsx
import { inject } from '@vercel/analytics'

inject()
```

### 4. Configure Caching

Vite automatically fingerprints assets. No action needed!

### 5. Monitor Bundle Size

```bash
npm run build

# Check dist/ folder size
# Should be under 1MB for optimal performance
```

---

## Troubleshooting

### Build Fails on Platform

- Check build logs for errors
- Ensure Node.js version matches locally (use `engines` in package.json)
- Verify all dependencies are in `dependencies`, not `devDependencies`

### Environment Variables Not Working

- Make sure they start with `VITE_` prefix
- Redeploy after adding env vars
- Check they're set for the right environment (Production/Preview)

### Supabase Auth Fails in Production

- Add production URL to Supabase redirect URLs
- Verify environment variables are correct
- Check browser console for CORS errors

### Audio Features Don't Work

- Ensure site is served over HTTPS (required for microphone access)
- Check browser permissions
- Test on multiple browsers

---

## Scaling Considerations

As your app grows:

1. **Database:** Supabase free tier supports up to 500MB. Upgrade to Pro for more.
2. **Storage:** Monitor Supabase Storage usage. Files are stored long-term.
3. **Bandwidth:** Vercel/Netlify free tiers have bandwidth limits.
4. **CDN:** Consider CloudFlare for global edge caching.

---

## Support

Need help with deployment?

- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- Netlify Support: [netlify.com/support](https://netlify.com/support)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)

---

**Your VibeLab is now live! 🎉**
