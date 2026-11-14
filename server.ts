import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', offlineReady: true });
  });

  // Hybrid Mode API: Calls Gemini to answer any question when online
  app.post('/api/gemini-ask', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Server is running without GEMINI_API_KEY. Using offline engine.' });
      }

      const { prompt, history } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Valid prompt string is required' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history)) {
        for (const turn of history.slice(-10)) {
          if (
            turn &&
            (turn.role === 'user' || turn.role === 'model') &&
            typeof turn.text === 'string' &&
            turn.text.trim()
          ) {
            contents.push({
              role: turn.role,
              parts: [{ text: turn.text }],
            });
          }
        }
      }
      contents.push({ role: 'user', parts: [{ text: prompt }] });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction:
            'You are a helpful, knowledgeable AI assistant inside an Offline-Capable AI Chatbot app. Answer any question the user asks clearly, accurately, and concisely. If the user writes in Tamil or Tanglish, reply naturally in the same style. Use fenced markdown code blocks (e.g. ```python) when providing code.',
        },
      });

      return res.json({ reply: response.text || 'I could not generate a response for that query.' });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return res.status(500).json({ error: err.message || 'Gemini online query failed' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const fs = await import('fs');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for all non-API GET requests in dev
    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Offline Chatbot server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
