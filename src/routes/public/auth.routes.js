import { Router } from 'express';
import { login, refresh, logout, loginSchema } from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { requireCsrf } from '../../middlewares/csrf.js';
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const r = Router();

const ALLOWED = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

r.use("/auth", authLimiter);

r.post('/auth/login', validate(loginSchema), login);
r.post('/auth/refresh', requireCsrf(ALLOWED), refresh);
r.post('/auth/logout', requireCsrf(ALLOWED), logout);
export default r;
