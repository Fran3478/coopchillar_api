import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import * as userRepo from '../repositories/user.repo.js';
import * as tokenRepo from '../repositories/recoveryToken.repo.js';
import * as sessionRepo from '../repositories/session.repo.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

function issueRecoverySessionJWT({ userId, tenantId, recId, ttMinutes = 10 }) {
  const now = Math.floor(Date.now()/1000);
  const exp = now + ttMinutes*60;
  const payload = { kind: 'recovery_session', uid: userId, tenantId, recId, iat: now, exp };
  return { token: jwt.sign(payload, env.jwt.secret), expiresAt: new Date(exp*1000) };
}

export async function verifyAndIssueRecoverySession({ email, tenantId, token }) {
  const user = await userRepo.findByEmailTenant({ email, tenantId });
  if (!user) throw new BadRequestError('Token inválido o expirado');

  const row = await tokenRepo.findValidByUserAndToken({ userId: user.id, token, purposeList: ['account_recovery','onboarding'] });
  if (!row) throw new BadRequestError('Token inválido o expirado');

  const { token: recoveryToken, expiresAt } = issueRecoverySessionJWT({ userId: user.id, tenantId, recId: row.id, ttMinutes: 10 });

  return { recoveryToken, expiresAt };
}

export async function resetPasswordWithRecoverySession({ recoveryToken, newPassword, ip, ua }) {
  let payload;
  try {
    payload = jwt.verify(recoveryToken, env.jwt.secret);
  } catch (err) {
    throw new BadRequestError('Token de recuperación inválido o expirado');
  }
  if (payload.kind !== 'recovery_session') {
    throw new BadRequestError('Token de recuperación inválido');
  }
  const { uid: userId, tenantId, recId } = payload;
  const row = await tokenRepo.findByIdValid({ id: recId, userId });
  if (!row) throw new BadRequestError('Token inválido o expirado');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await userRepo.updatePassword({ userId, passwordHash });

  await tokenRepo.markUsed({ id: recId });
  await sessionRepo.revokeAllForUser({ userId });
  return { ok: true };
}

export async function createAdminToken({ requestedBy, targetUserId, tenantId, ttlMinutes = 15, ip, ua }) {
  const user = await userRepo.findById({ id: targetUserId, tenantId });
  if (!user) throw new NotFoundError('Usuario objetivo no encontrado');

  await sessionRepo.revokeAllForUser({ userId: targetUserId });

  return tokenRepo.createForUser({
    userId: targetUserId,
    tenantId,
    requestedByUserId: requestedBy,
    ttlMinutes,
    ip, ua
  });
}

// export async function resetPasswordWithToken({ email, tenantId, token, newPassword, ip, ua }) {
//   const user = await userRepo.findByEmailTenant({ email, tenantId });
//   if (!user) throw new BadRequestError('Token inválido o expirado');

//   const row = await tokenRepo.findValidByUserAndToken({ userId: user.id, token });
//   if (!row) throw new BadRequestError('Token inválido o expirado');

//   const passwordHash = await bcrypt.hash(newPassword, 12);
//   await userRepo.updatePassword({ userId: user.id, passwordHash });

//   await tokenRepo.markUsed({ id: row.id });
//   await sessionRepo.revokeAllForUser({ userId: user.id });

//   return { ok: true };
// }
