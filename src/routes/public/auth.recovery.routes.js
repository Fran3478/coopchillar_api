import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { verifyRecovery, verifyBodySchema, resetPasswordBySession, resetBySessionBodySchema } from '../../controllers/recovery.controller.js';

const r = Router();
r.post('/auth/recovery/verify', validate(verifyBodySchema), verifyRecovery);
r.post('/auth/recovery/reset', validate(resetBySessionBodySchema), resetPasswordBySession)
export default r;
