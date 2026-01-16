import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import {
  listFoldersController, foldersQuerySchema,
  listAssetsController,  assetsQuerySchema,
  deleteAssetController,  deleteQuerySchema
} from '../../controllers/media.assets.controller.js';
import {
  saveMany, saveManySchema,
  list, listSchema,
  update, updateSchema,
  remove, removeQuerySchema,
  getById, idParamSchema
} from '../../controllers/mediaGallery.admin.controller.js';

const r = Router();

r.get('/media/folders',
  requireRole(['editor','admin','owner']),
  validate(foldersQuerySchema, 'query'),
  listFoldersController
);

r.get('/media/assets',
  requireRole(['editor','admin','owner']),
  validate(assetsQuerySchema, 'query'),
  listAssetsController
);

r.delete('/media/asset',
  requireRole(['admin','owner']),
  validate(deleteQuerySchema, 'query'),
  deleteAssetController
);

r.post('/media/gallery/assets',
  requireRole(['editor','admin','owner']),
  validate(saveManySchema),
  saveMany
);

r.get('/media/gallery/assets',
  requireRole(['editor','admin','owner']),
  validate(listSchema, 'query'),
  list
);

r.patch('/media/gallery/assets/:id',
  requireRole(['editor','admin','owner']),
  validate(updateSchema),
  update
);

r.delete('/media/gallery/assets/:id',
  requireRole(['admin','owner']),
  validate(removeQuerySchema, 'query'),
  remove
);

r.get('/media/gallery/assets/:id',
  requireRole(['editor','admin','owner']),
  validate(idParamSchema, 'params'),
  getById
);

export default r;
