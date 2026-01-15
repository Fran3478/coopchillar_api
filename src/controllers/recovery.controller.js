import { z } from 'zod';
import * as recoveryService from '../services/recovery.service.js';

export const verifyBodySchema = z.object({
  email: z.string().email(),
  tenantId: z.coerce.number().int().positive(),
  token: z.string().min(8)
});

export async function verifyRecovery(req, res, next) {
  try {
    const { email, tenantId, token } = req.validated?.body ?? req.body;
    const out = await recoveryService.verifyAndIssueRecoverySession({ email, tenantId, token });
    res.json(out);
  } catch (err) {
    next(err);
  }
}

export const resetBySessionBodySchema = z.object({
  recoveryToken: z.string().min(20),
  newPassword: z.string().min(8)
});

export async function resetPasswordBySession(req, res, next) {
  try {
    const { recoveryToken, newPassword } = req.validated?.body ?? req.body;
    console.log(recoveryToken, newPassword)
    await recoveryService.resetPasswordWithRecoverySession({ recoveryToken, newPassword, ip: req.ip, ua: req.get('user-agent') });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export const createTokenParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});
export const createTokenBodySchema = z.preprocess(
  (v) => (v == null || v === '' ? {} : v),
  z.object({
    ttlMinutes: z.coerce.number().int().min(5).max(60).default(15)
  }).default({})
);

export async function adminCreateToken(req, res, next) {
  try {
    const { id } = req.validated?.params ?? req.params;
    const { ttlMinutes } = req.validated?.body ?? req.body;
    const { id: adminId, tenantId, role } = req.user;

    const out = await recoveryService.createAdminToken({
      requestedBy: adminId,
      targetUserId: Number(id),
      tenantId,
      ttlMinutes,
      ip: req.ip,
      ua: req.get('user-agent')
    });

    res.status(201).json({ token: out.token, expiresAt: out.expiresAt });
  } catch (e) { next(e); }
}

// export const resetBodySchema = z.object({
//   email: z.coerce.string().email(),
//   tenantId: z.coerce.number().int().positive(),
//   token: z.coerce.string().min(8),
//   newPassword: z.coerce.string().min(8)
// });

// export async function resetPassword(req, res, next) {
//   try {
//     const { email, tenantId, token, newPassword } = req.validated?.body ?? req.body;
//     await recoveryService.resetPasswordWithToken({
//       email, tenantId, token, newPassword,
//       ip: req.ip, ua: req.get('user-agent')
//     });
//     res.json({ ok: true });
//   } catch (e) { next(e); }
// }
