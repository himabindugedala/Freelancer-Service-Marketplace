import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration with support for multiple domains and Render subdomains
const configuredClients = (ENV.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...configuredClients,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      // Allow if origin is in configured allowed list
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      // Allow any .onrender.com subdomain (handles separate frontend/backend deployments on Render)
      if (origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      // Allow in non-production environments
      if (ENV.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Dev/preview convenience
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for Render and uptime monitoring
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'Freelance Service Marketplace API',
  });
});

// Serve static uploads
const uploadPath = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
app.use('/uploads', express.static(uploadPath));

// API rate limit
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', apiRouter);

// Support for unified single-service full-stack deployment:
// If frontend/dist exists, serve it as static files and fallback to index.html for SPA routing
const clientBuildPathA = path.resolve(process.cwd(), '../frontend/dist');
const clientBuildPathB = path.resolve(process.cwd(), 'frontend/dist');
const resolvedDist = fs.existsSync(clientBuildPathA)
  ? clientBuildPathA
  : fs.existsSync(clientBuildPathB)
  ? clientBuildPathB
  : null;

if (resolvedDist) {
  app.use(express.static(resolvedDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(resolvedDist, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
