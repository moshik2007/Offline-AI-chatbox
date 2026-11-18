# LocalMind — Universal AI Answer Engine

LocalMind is a full-stack React + Vite Progressive Web App (PWA) with voice input/output, multimodal camera vision, code snippet copying, local IndexedDB chat history, and server-side AI inference via `/api/*` supporting English, Tamil (தமிழ்), and Tanglish.

## 1. Link & Push to GitHub

1. Create a new empty repository on [GitHub](https://github.com/new).
2. In your project folder, initialize Git and push:

```bash
git init
git add .
git commit -m "Initial commit: LocalMind PWA & Universal AI"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

> `.env*` files are excluded via `.gitignore` (except `.env.example`), so secrets are never pushed to GitHub.

## 2. Deploy on Vercel (Linked to GitHub)

1. Go to [Vercel](https://vercel.com/new) and import your GitHub repository.
2. Vercel auto-detects `vercel.json` (`framework: "vite"`, `buildCommand: "npm run build"`, `outputDirectory: "dist"`, and `/api/*` Serverless Functions).
3. In **Vercel Project Settings -> Environment Variables**, add:
   - `GEMINI_API_KEY` = your Gemini API key
4. Click **Deploy**. Every subsequent `git push` to `main` automatically deploys to Vercel.

## 3. Install as an App (PWA)

- **Chrome / Edge / Android**: Click **Install App** in the LocalMind header (or in Settings -> Install as App), or click your browser's install icon in the address bar.
- **iPhone / iPad (Safari)**: Tap **Share** in Safari -> **Add to Home Screen**.
- **Local Development**:

```bash
npm install
cp .env.example .env
# Add GEMINI_API_KEY inside .env
npm run dev
```
