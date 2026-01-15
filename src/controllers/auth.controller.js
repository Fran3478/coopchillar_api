import * as authService from '../services/auth.service.js';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { cookieOptions } from '../utils/tokens.js';
import { BadRequestError } from '../utils/errors.js';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantId: z.number()
});

export async function login(req, res, next) {
  try {
    const { email, password, tenantId } = req.validated.body;
    const { accessToken, refreshToken, sessionId, user } = await authService.login({
      email, password, tenantId, ua: req.headers['user-agent'] || '', ip: req.ip || req.headers['x-forwarded-for'] || ''
    });

    const csrf = crypto.randomBytes(24).toString('hex');

    res.cookie(env.refresh.cookieName, refreshToken, cookieOptions('/v1/auth/refresh'));
    res.cookie(env.refresh.cookieRid, String(sessionId), cookieOptions('/v1/auth/refresh'));
    res.cookie('csrf', csrf, {
      httpOnly: false,
      secure: env.refresh.cookieSecure,
      sameSite: env.refresh.cookieSecure ? 'none' : 'lax',
      domain: env.refresh.cookieDomain,
      path: '/v1/auth',
      maxAge: env.refresh.expiresDays * 24 * 60 * 60 * 1000
    });

    res.json({ token: accessToken, user: { id: user.id, role: user.role, tenantId: user.tenantId, email: user.email } });
  } catch (e) { next(e); }
}

export async function refresh(req, res, next) {
  try {
    const raw = req.cookies?.[env.refresh.cookieName];
    const rid = req.cookies?.[env.refresh.cookieRid];
    if (!raw || !rid) throw new BadRequestError('Falta cookie de refresh');

    const { accessToken, refreshToken } = await authService.refresh({ sessionId: Number(rid), rawRefresh: raw });

    res.cookie(env.refresh.cookieName, refreshToken, cookieOptions('/v1/auth/refresh'));
    res.json({ token: accessToken });
  } catch (e) { next(e); }
}

export async function logout(req, res, next) {
  try {
    const rid = req.cookies?.[env.refresh.cookieRid];
    if (rid) await authService.logout({ sessionId: Number(rid) });
    res.clearCookie(env.refresh.cookieName, cookieOptions('/v1/auth/refresh'));
    res.clearCookie(env.refresh.cookieRid, cookieOptions('/v1/auth/refresh'));
    res.json({ ok: true });
  } catch (e) { next(e); }
}
