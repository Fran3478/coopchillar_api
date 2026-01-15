// src/controllers/media.assets.controller.js
import { z } from 'zod';
import * as mediaAssetsService from '../services/media.assets.service.js';

// GET /v1/media/folders?parent=opcional
export const foldersQuerySchema = z.object({
  parent: z.string().regex(/^[a-zA-Z0-9/_-]*$/).optional() // relativo al root del tenant
});
export async function listFoldersController(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { parent } = req.validated?.query ?? req.query;
    const folders = await mediaAssetsService.listFolders({ tenantId, parent });
    res.json({ folders });
  } catch (e) { next(e); }
}

// GET /v1/media/assets?folder=&resourceType=image|video|all&pageSize=&cursor=
export const assetsQuerySchema = z.object({
  folder: z.string().regex(/^[a-zA-Z0-9/_-]*$/).optional(),
  resourceType: z.enum(['image','video','all']).default('image'),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional()
});
export async function listAssetsController(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { folder, resourceType, pageSize, cursor } = req.validated?.query ?? req.query;
    const out = await mediaAssetsService.listAssets({ tenantId, folder, resourceType, pageSize, cursor });
    res.json(out);
  } catch (e) { next(e); }
}

// DELETE /v1/media/asset?publicId=...&resourceType=image|video&force=true|false
export const deleteQuerySchema = z.object({
  publicId: z.string().min(3), // OJO: publicId incluye subcarpetas (ej: gestarcoop/tenant_1/portadas/abc123)
  resourceType: z.enum(['image','video']).default('image'),
  force: z.coerce.boolean().default(false)
});
export async function deleteAssetController(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { publicId, resourceType, force } = req.validated?.query ?? req.query;
    const out = await mediaAssetsService.removeAsset({ tenantId, publicId, resourceType, force });
    res.json(out);
  } catch (e) { next(e); }
}
