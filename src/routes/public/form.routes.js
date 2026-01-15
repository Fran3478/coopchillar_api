import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import * as contact from '../../controllers/contact.controller.js';
import * as ebill from '../../controllers/ebilling.controller.js';

const r = Router();

r.post('/public/tenants/:tenantId/contacts', validate(contact.publicCreateSchema), contact.createPublic);
r.post('/public/tenants/:tenantId/ebilling-requests', validate(ebill.publicCreateSchema), ebill.createPublic);

export default r;