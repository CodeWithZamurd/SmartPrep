import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import passwordResetRoutes from './routes/passwordReset.js';
import profileRoutes from './routes/profile.js';
import sessionRoutes from './routes/sessions.js';
import practiceRoutes from './routes/practice.js';
import challengeRoutes from './routes/challenge.js';
import domainsRoutes from './routes/domains.js';
import questionsRoutes from './routes/questions.js';
import notificationsRoutes from './routes/notifications.js';
import feedbackRoutes from './routes/feedback.js';
import reportsRoutes from './routes/reports.js';
import aiSettingsRoutes from './routes/aiSettings.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'smartprep-backend' }));

// Serve uploaded videos/frames
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/auth', authRoutes);
app.use('/auth/password', passwordResetRoutes);
app.use('/profile', profileRoutes);
app.use('/sessions', sessionRoutes);
app.use('/practice', practiceRoutes);
app.use('/challenge', challengeRoutes);
app.use('/domains', domainsRoutes);
app.use('/questions', questionsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/reports', reportsRoutes);
app.use('/ai-settings', aiSettingsRoutes);
app.use('/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartprep';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`Backend listening on 0.0.0.0:${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo connection failed:', err.message);
    process.exit(1);
  });
