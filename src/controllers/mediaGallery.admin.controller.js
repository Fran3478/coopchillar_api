import { z } from 'zod';
import * as svc from '../services/mediaGallery.service.js';

const metaSchema = z.object({
  alt: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  album: z.string().max(120).optional(),
  estado: z.enum(['draft','published','archived']).optional()
}).optional();

const singleUploadSchema = z.object({
  upload: z.object({
    public_id: z.string(),
    resource_type: z.enum(['image','video']),
    secure_url: z.string().url()
  }),
  meta: metaSchema
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const saveManySchema = z.object({
  items: z.array(singleUploadSchema).min(1).max(50)
});

export async function saveMany(req, res, next) {
  try {
    const { items } = req.validated.body;
    const rows = await svc.saveMany({ tenantId: req.user.tenantId, items });
    res.status(201).json({ items: rows });
  } catch (e) { next(e); }
}

export const listSchema = z.object({
  q: z.string().trim().optional(),
  album: z.string().optional(),
  estado: z.enum(['draft','published','archived']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export async function list(req, res, next) {
  try {
    const q = req.validated.query;
    const result = await svc.listPrivate({ tenantId: req.user.tenantId, ...q });
    res.json({ total: result.count, items: result.rows });
  } catch (e) { next(e); }
}

export const updateSchema = z.object({
  alt: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  album: z.string().max(120).optional(),
  estado: z.enum(['draft','published','archived']).optional()
});

export async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = req.validated.body;
    const row = await svc.update({ tenantId: req.user.tenantId, id, data });
    res.json(row);
  } catch (e) { next(e); }
}

export const removeQuerySchema = z.object({
  force: z.coerce.boolean().optional()
});

export async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { force = false } = req.validated.query || {};
    const out = await svc.remove({ tenantId: req.user.tenantId, id, force });
    res.json(out);
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const id = req.validated.params.id;
    const row = await svc.getOnePrivate({ tenantId: req.user.tenantId, id });
    res.json(row);
  } catch (e) { next(e); }
}
