import express from 'express';
import cors from 'cors';
import path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import reportRoutes from './routes/reports';
import voteRoutes from './routes/votes';
import adminRoutes from './routes/admin';

// Sync database schema before anything else
console.log('=== Lastiğim Gitti Startup ===');
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
try {
  console.log('Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss --schema=prisma/schema.prisma', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('Database synced successfully!');
} catch (err) {
  console.error('prisma db push failed:', err);
}

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// CORS - allow frontend origin in dev, same-origin in prod
app.use(cors({
  origin: isProduction
    ? (process.env.FRONTEND_URL || true)
    : 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Lastiğim Gitti API' });
});

// Serve frontend in production
if (isProduction) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const HOST = '0.0.0.0';
app.listen(Number(PORT), HOST, () => {
  console.log(`Lastiğim Gitti server running on ${HOST}:${PORT}`);
});
