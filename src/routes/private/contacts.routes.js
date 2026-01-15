import { Router } from 'express';
import { requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { list, updateStatus } from '../../controllers/contact.controller.js';
import { listSchema, statusBodySchema, idParamSchema } from '../../controllers/contact.controller.js';

const r = Router();
const roles = ['editor', 'admin', 'owner'];

r.get('/contacts', requireRole(roles), validate(listSchema, 'query'), list);
r.put('/contacts/:id/status', requireRole(roles), validate(idParamSchema, 'params'), validate(statusBodySchema), updateStatus);

export default r;