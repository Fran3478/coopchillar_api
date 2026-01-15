import { z } from 'zod';
import * as adminUserService from '../services/user.admin.service.js';

const RoleEnum = z.enum(['owner','admin','editor','viewer']);
const StatusEnum = z.enum(['active','blocked']);

export const updateEmailParams = z.object({ id: z.coerce.number().int().positive() });
export const updateEmailBody = z.object({ email: z.string().email() });
export async function updateEmail(req, res, next) {
  try {
    const { id } = req.validated?.params ?? req.params;
    const { email } = req.validated?.body ?? req.body;
    const actor = req.user;
    const out = await adminUserService.updateEmail({ actor, tenantId: actor.tenantId, targetUserId: Number(id), email });
    res.json(out);
  } catch (e) { next(e); }
}

export const updateRoleParams = z.object({ id: z.coerce.number().int().positive() });
export const updateRoleBody = z.object({ role: RoleEnum });
export async function updateRole(req, res, next) {
  try {
    const { id } = req.validated?.params ?? req.params;
    const { role } = req.validated?.body ?? req.body;
    const actor = req.user;
    const out = await adminUserService.changeRole({ actor, tenantId: actor.tenantId, targetUserId: Number(id), newRole: role });
    res.json(out);
  } catch (e) { next(e); }
}

export const updateStatusParams = z.object({ id: z.coerce.number().int().positive() });
export const updateStatusBody = z.object({ status: StatusEnum });
export async function updateStatus(req, res, next) {
  try {
    const { id } = req.validated?.params ?? req.params;
    const { status } = req.validated?.body ?? req.body;
    const actor = req.user;
    const out = await adminUserService.setStatus({ actor, tenantId: actor.tenantId, targetUserId: Number(id), status });
    res.json(out);
  } catch (e) { next(e); }
}
export const createUserBody = z.object({
  email: z.string().email(),
  role: RoleEnum.default('viewer'),
  onboardingTtlMinutes: z.coerce.number().int().min(5).max(7*24*60).optional()
});
export async function createUser(req, res, next) {
  try {
    const actor = req.user;
    const { email, role, onboardingTtlMinutes } = req.validated?.body ?? req.body;
    const out = await adminUserService.createUserWithOnboarding({
      actor,
      tenantId: actor.tenantId,
      email,
      role,
      onboardingTtlMinutes: onboardingTtlMinutes ?? 15
    });
    res.status(201).json(out);
  } catch (e) { next(e); }
}