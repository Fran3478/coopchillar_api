import bcrypt from 'bcryptjs';
import { signAccessToken } from '../utils/jwt.js';
import { newRefreshToken, hashToken, compareToken, refreshExpiryDate } from '../utils/tokens.js';
import * as userRepo from '../repositories/user.repo.js';
import * as sessionRepo from '../repositories/session.repo.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';

export async function login({ email, password, tenantId, ua, ip }) {
  const user = await userRepo.findUserByEmailTenant(email, tenantId);
  if (!user || user.status !== 'active') throw new UnauthorizedError('Credenciales inválidas');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Credenciales inválidas');

  const accessToken = signAccessToken({ uid: user.id, tenantId: user.tenantId, role: user.role });

  const rawRefresh = newRefreshToken();
  const tokenHash = await hashToken(rawRefresh);
  const expiresAt = refreshExpiryDate();
  const session = await sessionRepo.createSession({ userId: user.id, tokenHash, ua, ip, expiresAt });

  return { accessToken, refreshToken: rawRefresh, sessionId: session.id, user };
}

export async function refresh({ sessionId, rawRefresh }) {
  const session = await sessionRepo.getSessionById(sessionId);
  if (!session) throw new NotFoundError('Sesión no encontrada');
  if (new Date(session.expiresAt) < new Date()) throw new UnauthorizedError('Refresh expirado');

  const ok = await compareToken(rawRefresh, session.tokenHash);
  if (!ok) throw new UnauthorizedError('Refresh inválido');

  const newRaw = newRefreshToken();
  const tokenHash = await hashToken(newRaw);
  const expiresAt = refreshExpiryDate();
  await sessionRepo.updateSession(session.id, { tokenHash, expiresAt });

  const user = await userRepo.findUserById(session.userId);
  if (!user) throw new NotFoundError('Usuario no encontrado');

  const accessToken = signAccessToken({ uid: user.id, tenantId: user.tenantId, role: user.role });
  return { accessToken, refreshToken: newRaw };
}

export async function logout({ sessionId }) {
  await sessionRepo.deleteSession(sessionId);
  return true;
}
