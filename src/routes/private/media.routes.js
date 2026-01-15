import { Router } from 'express';
import { requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { signSchema, signUploadController } from '../../controllers/media.controller.js';

const r = Router();

r.post('/sign', requireRole(['editor','admin','owner']), validate(signSchema), signUploadController);

export default r;
