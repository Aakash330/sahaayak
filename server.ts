import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Server-side Gemini API proxy endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt' });
    }
    if (prompt.length > 5000) {
      return res.status(400).json({ error: 'Input exceeds maximum allowed length' });
    }

    const ai = getAiClient();
    let responseText = '';
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction ? String(systemInstruction) : undefined,
          responseMimeType: 'application/json',
        },
      });
      responseText = response.text || '';
    } catch (primaryErr: unknown) {
      const primaryMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      console.warn('[Sahaayak Server] Primary model failed, trying fallback:', primaryMsg);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction ? String(systemInstruction) : undefined,
          responseMimeType: 'application/json',
        },
      });
      responseText = fallbackResponse.text || '';
    }

    return res.json({ text: responseText });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'AI request failed';
    console.error('[Sahaayak Server] Gemini error:', errorMsg);
    return res.status(500).json({ error: errorMsg });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sahaayak server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
