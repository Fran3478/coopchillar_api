import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export function requireAuth(req, _res, next) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return next(new UnauthorizedError('Falta header Authorization'));

  try {
    const payload = jwt.verify(m[1], env.jwt?.secret ?? env.access?.secret);
    const user = {
      id: payload.id ?? payload.uid ?? payload.userId ?? null,
      tenantId: Number(payload.tenantId ?? payload.tid ?? NaN),
      role: payload.role,
    };

    if (!user.id || !user.tenantId) {
      return next(new UnauthorizedError('Token inválido'));
    }

    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireRole(roles = []) {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError('Rol insuficiente'));
    next();
  };
}
