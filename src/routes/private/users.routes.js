import { Router } from "express";
import { requireRole, requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { listUsers, listUsersQuerySchema } from "../../controllers/user.controller.js";
import { updateEmail, updateEmailParams, updateEmailBody, updateRole, updateRoleParams, updateRoleBody, updateStatus, updateStatusParams, updateStatusBody, createUser, createUserBody } from "../../controllers/user.admin.controller.js";
import { adminCreateToken, createTokenParamsSchema, createTokenBodySchema } from '../../controllers/recovery.controller.js';

const r = Router();

r.get('/users', requireRole(['admin','owner']), validate(listUsersQuerySchema, 'query'), listUsers);
r.post('/users', requireRole(['admin','owner']), validate(createUserBody), createUser);
r.put('/users/:id/email', requireRole(['admin','owner']), validate(updateEmailParams, 'params'), validate(updateEmailBody), updateEmail);
r.put('/users/:id/role', requireRole(['admin','owner']), validate(updateRoleParams, 'params'), validate(updateRoleBody), updateRole);
r.put('/users/:id/status', requireRole(['admin','owner']), validate(updateStatusParams, 'params'), validate(updateStatusBody), updateStatus);
r.post('/users/:id/recovery-token',requireRole(['admin','owner']), validate(createTokenParamsSchema, 'params'), validate(createTokenBodySchema), adminCreateToken)

export default r;