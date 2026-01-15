import { Router } from 'express';
import { requireRole } from '../../middlewares/auth.js';
import { list, create, update, publish, unpublish, getById } from '../../controllers/post.controller.js';
import { validate } from '../../middlewares/validate.js';
import { createSchema, updateSchema, listSchema, idParamSchema } from '../../controllers/post.controller.js';

const r = Router();

r.get('/', requireRole(['editor','admin','owner']), validate(listSchema, 'query'), list);
r.get('/:id', requireRole(['editor','admin','owner']), validate(idParamSchema, 'params'), getById);
r.post('/', requireRole(['editor','admin','owner']), validate(createSchema), create);
r.put('/:id', requireRole(['editor','admin','owner']), validate(updateSchema), update);
r.post('/:id/publish', requireRole(['editor','admin','owner']), publish);
r.post('/:id/unpublish', requireRole(['editor','admin','owner']), unpublish);

export default r;