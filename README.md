# Synthetic Good - AI Prompts Platform

A static web application for sharing AI generated image prompts. Built with React (Frontend) and Supabase (Backend), deployable to Netlify.

## Features
- **Public:** View, Copy, Like prompts. Filter by category.
- **Admin Panel:** Secure upload interface to publish new content.
- **Routing:** Individual post pages (`/p/slug`).

## Admin Panel
Access the admin panel at: `https://your-site.netlify.app/admin`

1. Login with your Admin credentials (configured in Supabase Auth).
2. The system checks `is_admin()` RPC.
3. **Publishing:**
   - Upload Image.
   - Select Category (Fixed list).
   - Enter Prompt.
   - Click Publish.
   - A unique URL is generated automatically.

## Deployment (Netlify)

1. Connect repo to Netlify.
2. Build command: `npm run build` (or your build script).
3. Publish directory: `dist` (or `.`).
4. Ensure `netlify.toml` is present for routing rules.

## Local Development

1. Run a local server (e.g., `vite`, `live-server`).
2. Ensure `assets/config.js` has valid Supabase credentials.

## Supabase Setup
- Tables: `posts`, `admins`
- Buckets: `post-images` (Public)
- Functions: `is_admin`