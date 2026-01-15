import { Router } from 'express';
import { requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { list, updateStatus } from '../../controllers/ebilling.controller.js';
import { listSchema, statusBodySchema, idParamSchema } from '../../controllers/ebilling.controller.js';

const r = Router();
const roles = ['editor','admin','owner'];

r.get('/ebilling-requests', requireRole(roles), validate(listSchema, 'query'), list);
r.put('/ebilling-requests/:id/status', requireRole(roles), validate(idParamSchema, 'params'), validate(statusBodySchema), updateStatus);

export default r;