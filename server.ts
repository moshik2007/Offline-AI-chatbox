import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Content, Part } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

interface IncomingHistoryItem {
  role: 'user' | 'model';
  text: string;
  imageDataUrl?: string;
}

interface IncomingChatRequest {
  prompt?: string;
  history?: IncomingHistoryItem[];
  image?: {
    dataUrl: string;
    mimeType?: string;
  } | null;
  language?: 'auto' | 'english' | 'tamil' | 'tanglish';
  explanationDepth?: 'standard' | 'simple';
}

function parseDataUrl(dataUrl: string, fallbackMime = 'image/jpeg'): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1] || fallbackMime,
    data: match[2],
  };
}

function buildSystemInstruction(
  language: string = 'auto',
  explanationDepth: string = 'standard'
): string {
  const langRule =
    language === 'tamil'
      ? 'Respond clearly in natural Tamil script (தமிழ்), using clear formatting and keeping code/math notation readable.'
      : language === 'tanglish'
      ? 'Respond primarily in natural, easy-to-understand Tanglish (Tamil written in English script), keeping code and math formulas standard.'
      : language === 'english'
      ? 'Respond in clear, accurate English.'
      : 'Support English, Tamil (தமிழ்), and Tanglish seamlessly: match the language and script the user writes in.';

  const depthRule =
    explanationDepth === 'simple'
      ? 'Explain concepts in simple, beginner-friendly language using everyday analogies and short step-by-step points.'
      : 'Provide complete, accurate, well-structured answers with clear examples and step-by-step explanations when helpful.';

  return [
    'You are LocalMind, a universal, intelligent AI assistant.',
    'Answer any topic dynamically: Science and Technology, Mathematics and Calculations, Environmental Science, Computer Science, Programming and Coding, Engineering subjects, History and Geography, General Knowledge, Education and Exam Questions, Daily Life Questions, Definitions, and open-ended queries.',
    'Understand the full meaning and context of every question, remember earlier turns in the conversation, and answer follow-up questions accurately.',
    langRule,
    depthRule,
    'When writing code (C, C++, Java, Python, HTML, CSS, JavaScript, TypeScript, SQL, etc.), wrap it in fenced markdown blocks with the language tag.',
    'When an image is provided, inspect it carefully to extract text, solve math or exam questions, explain diagrams/charts, or debug code.',
    'If something is genuinely ambiguous or uncertain, explain the uncertainty honestly instead of fabricating facts.',
  ].join(' ');
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (/API_KEY_INVALID|API key not valid|PERMISSION_DENIED|403/i.test(raw)) {
    return {
      status: 403,
      message:
        'The Gemini API key was rejected or lacks permission. Please verify GEMINI_API_KEY in the Settings > Secrets panel.',
    };
  }
  if (/RESOURCE_EXHAUSTED|429|quota/i.test(raw)) {
    return {
      status: 429,
      message:
        'AI request quota has been reached temporarily. Please wait a moment and try again, or verify your Gemini tier in Settings > Secrets.',
    };
  }
  if (/NOT_FOUND|404/i.test(raw)) {
    return {
      status: 404,
      message: `Requested AI model (${MODEL_NAME}) was not found or is unavailable right now.`,
    };
  }
  return {
    status: 500,
    message: `AI service error: ${raw}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      app: 'LocalMind',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Streaming Universal AI Endpoint (SSE)
  app.post('/api/chat/stream', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured on the backend. Please add your Gemini API key in the Settings > Secrets panel to enable Universal AI answers.',
      });
    }

    const body = (req.body || {}) as IncomingChatRequest;
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const hasImage = Boolean(body.image?.dataUrl);

    if (!prompt && !hasImage) {
      return res.status(400).json({ error: 'A question or image is required.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contents: Content[] = [];
    if (Array.isArray(body.history)) {
      for (const turn of body.history.slice(-14)) {
        if (!turn || (turn.role !== 'user' && turn.role !== 'model')) continue;
        const parts: Part[] = [];
        if (turn.role === 'user' && turn.imageDataUrl) {
          const parsedHistImg = parseDataUrl(turn.imageDataUrl);
          if (parsedHistImg) {
            parts.push({ inlineData: parsedHistImg });
          }
        }
        if (typeof turn.text === 'string' && turn.text.trim()) {
          parts.push({ text: turn.text.trim() });
        }
        if (parts.length > 0) {
          contents.push({ role: turn.role, parts });
        }
      }
    }

    const currentParts: Part[] = [];
    if (body.image?.dataUrl) {
      const parsedImg = parseDataUrl(body.image.dataUrl, body.image.mimeType || 'image/jpeg');
      if (!parsedImg) {
        return res.status(400).json({ error: 'Invalid image encoding. Please attach a valid PNG, JPG, or WEBP image.' });
      }
      currentParts.push({ inlineData: parsedImg });
    }
    currentParts.push({
      text:
        prompt ||
        'Analyze this image carefully. If it contains questions, math problems, code, diagrams, or handwritten notes, explain or solve them step by step.',
    });
    contents.push({ role: 'user', parts: currentParts });

    const systemInstruction = buildSystemInstruction(body.language, body.explanationDepth);

    let clientClosed = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        clientClosed = true;
      }
    });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(': stream-open\n\n');

    const candidateModels = [MODEL_NAME, 'gemini-3.1-flash-lite'];
    let fullText = '';
    let lastError: unknown = null;

    for (const candidateModel of candidateModels) {
      if (clientClosed) break;
      try {
        const result = await Promise.race([
          ai.models.generateContent({
            model: candidateModel,
            contents,
            config: {
              systemInstruction,
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API request timed out.')), 15000)
          ),
        ]);

        fullText = result.text || '';
        if (fullText.trim()) break;
      } catch (err: unknown) {
        lastError = err;
        const rawMsg = err instanceof Error ? err.message : String(err);
        // Immediately stop retrying on auth/bad-request errors; fall back on 503/429/timeout
        if (/400|403|API_KEY_INVALID|PERMISSION_DENIED/i.test(rawMsg)) {
          break;
        }
      }
    }

    if (clientClosed) return;

    if (!fullText.trim()) {
      const mapped = lastError
        ? formatGeminiError(lastError)
        : {
            status: 500,
            message: 'The AI service returned an empty response. Please try rephrasing your question.',
          };
      res.write(`data: ${JSON.stringify({ error: mapped.message })}\n\n`);
      res.end();
      return;
    }

    // Stream response chunks over SSE cleanly
    const pieces = fullText.split(/(\s+)/);
    const batchSize = 4;
    for (let i = 0; i < pieces.length; i += batchSize) {
      if (clientClosed) break;
      const delta = pieces.slice(i, i + batchSize).join('');
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
      await new Promise((r) => setTimeout(r, 12));
    }

    if (!clientClosed) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  });

  // Audio Transcription Endpoint for Universal Microphone Access (MediaRecorder fallback)
  app.post('/api/transcribe', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured on the backend. Please add your Gemini API key in Settings > Secrets.',
      });
    }

    const body = (req.body || {}) as {
      audio?: { dataUrl?: string; mimeType?: string };
      speechLang?: string;
    };
    const dataUrl = body.audio?.dataUrl;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Recorded audio data is required.' });
    }

    const parsed = parseDataUrl(dataUrl, body.audio?.mimeType || 'audio/webm');
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid audio encoding.' });
    }

    // Normalize codec suffixes like "audio/webm;codecs=opus" -> "audio/webm"
    const normalizedMime = parsed.mimeType.split(';')[0].trim() || 'audio/webm';

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const langHint =
      body.speechLang === 'ta-IN'
        ? 'The speaker may be speaking Tamil (தமிழ்), Tanglish, or English.'
        : body.speechLang === 'en-IN'
        ? 'The speaker may be speaking Indian English, Tanglish, or Tamil.'
        : 'The speaker may be speaking English, Tamil, or Tanglish.';

    const audioPart: Part = {
      inlineData: {
        mimeType: normalizedMime,
        data: parsed.data,
      },
    };
    const promptPart: Part = {
      text: `Transcribe ONLY the exact spoken words in this audio into plain text, with no commentary or timestamps. ${langHint} If the audio is silent, noise-only, or has no clear spoken words, output nothing (empty text) and do not invent words.`,
    };

    const candidateModels = ['gemini-3.5-transcribe', 'gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
    let transcript = '';
    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const result = await Promise.race([
          ai.models.generateContent({
            model,
            contents: { parts: [audioPart, promptPart] },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Audio transcription timed out.')), 15000)
          ),
        ]);
        transcript = (result.text || '').trim();
        break;
      } catch (err: unknown) {
        lastError = err;
        const rawMsg = err instanceof Error ? err.message : String(err);
        if (/400|403|API_KEY_INVALID|PERMISSION_DENIED/i.test(rawMsg)) {
          break;
        }
      }
    }

    if (!transcript && lastError) {
      const mapped = formatGeminiError(lastError);
      return res.status(mapped.status).json({ error: mapped.message });
    }

    return res.json({ text: transcript });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const fs = await import('fs');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

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
    console.log(`LocalMind Universal AI server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
