import 'dotenv/config';
import './src/config/zod-es.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { sequelize } from './src/db/sequelize.js';
import { initModels } from './src/db/models/index.js';

import publicRouter from './src/routes/public/index.js';
import privateRouter from './src/routes/private/index.js';
import errorHandler from './src/middlewares/errorHandler.js';

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 100,                  // 100 intentos por IP
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // permite herramientas como Insomnia
    return ALLOWED_ORIGINS.includes(origin) ? cb(null, true) : cb(new Error('CORS not allowed'));
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rutas
app.use('/v1', publicRouter);
app.use('/v1', privateRouter);
app.use('/v1/auth/', authLimiter);

app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);

(async () => {
  try {
    await sequelize.authenticate();
    await initModels();
    console.log('DB connection OK');
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  } catch (e) {
    console.error('DB connection FAIL', e);
    process.exit(1);
  }
})();
