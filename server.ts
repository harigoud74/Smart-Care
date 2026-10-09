import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import apiRouter from './server/src/routes/index.js';
import { errorHandler } from './server/src/middleware/error-handler.js';
import { config } from './server/src/config/index.js';
import { setupGeminiLiveWebSocket } from './server/src/services/gemini.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Attach WebSocket server for Gemini Live Voice API (gemini-3.8-live)
  setupGeminiLiveWebSocket(server);

  // Ensure uploads directory exists
  const uploadsDir = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Basic security and parsing middlewares
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static files for uploads
  app.use('/uploads', express.static(uploadsDir));

  // Mount API router
  app.use('/api', apiRouter);

  // Mount Vite middleware in development or serve static in production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  // Global centralized error handling middleware
  app.use(errorHandler);

  server.listen(port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` SmartCare Healthcare System running on port ${port}`);
    console.log(` Live API WebSocket Endpoint: ws://localhost:${port}/live`);
    console.log(` API Endpoint: http://localhost:${port}/api/health`);
    console.log(` Mode: ${isProd ? 'Production' : 'Development'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
