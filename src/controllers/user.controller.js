import { z } from 'zod';
import * as userService from '../services/user.service.js';

const RoleEnum = z.enum(['owner','admin','editor','viewer']);
const StatusEnum = z.enum(['active','blocked']);

export const listUsersQuerySchema = z.object({
    q: z.string().trim().optional(),
    role: RoleEnum.optional(),
    status: StatusEnum.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export async function listUsers(req, res, next) {
    try {
        const { tenantId } = req.user;
        const { q, role, status, page, pageSize } = req.validated?.query ?? req.query;

        const result = await userService.listUsers({ tenantId, q, role, status, page: Number(page), pageSize: Number(pageSize) });
        res.json(result);
    } catch (e) {
        next(e);
    }
}