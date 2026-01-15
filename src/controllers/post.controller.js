import { z } from 'zod';
import * as postService from '../services/post.service.js';

export const createSchema = z.object({
  tipo: z.enum(['noticia','novedad']),
  titulo: z.string().min(3),
  excerpt: z.string().max(300).optional(),
  portadaUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  destacado: z.boolean().optional(),
  blocksJson: z.any()
});
export const updateSchema = createSchema.partial();

export const listSchema = z.object({
  tipo: z.enum(['noticia','novedad']).optional(),
  estado: z.enum(['draft','published','archived']).optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export async function list(req, res, next) {
  try {
    const q = req.validated?.query ?? {};
    const result = await postService.list({ tenantId: req.user.tenantId, ...q });
    res.json({ total: result.count, items: result.rows });
  } catch (e) { next(e); }
}
export async function create(req, res, next) {
  try {
    const input = req.validated.body;
    const post = await postService.create({ tenantId: req.user.tenantId, ...input });
    res.status(201).json(post);
  } catch (e) { console.log(e); 
    //next(e); 
    }
}
export async function update(req, res, next) {
  try {
    const input = req.validated.body;
    const post = await postService.update({ id: Number(req.params.id), tenantId: req.user.tenantId, data: input });
    res.json(post);
  } catch (e) { console.log(e); next(e); }
}
export async function publish(req, res, next) {
  try {
    const post = await postService.publish({ id: Number(req.params.id), tenantId: req.user.tenantId });
    res.json(post);
  } catch (e) { next(e); }
}
export async function unpublish(req, res, next) {
  try {
    const post = await postService.unpublish({ id: Number(req.params.id), tenantId: req.user.tenantId });
    res.json(post);
  } catch (e) { next(e); }
}
export async function getPublicBySlug(req, res, next) {
  try {
    const post = await postService.getPublicBySlug({ tenantId: Number(req.params.tenantId), slug: req.params.slug });
    if (!post) return res.status(404).json({ error: { code: 'not_found', message: 'No encontrado' } });
    res.json(post);
  } catch (e) { next(e); }
}

export const publicListSchema = z.object({
  tipo: z.enum(['noticia','novedad']).optional(),
  destacado: z.coerce.boolean().optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export async function listPublic(req, res, next) {
  try {
    const tenantId = Number(req.params.tenantId);
    const q = req.validated?.query ?? req.query;
    const result = await postService.listPublic({ tenantId, ...q });
    res.json({ total: result.count, items: result.rows });
  } catch (e) { next(e); }
}

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export async function getById(req, res, next) {
  try {
    const { id } = req.validated?.params ?? req.params;
    const tenantId = req.user.tenantId;

    const post = await postService.getById({ tenantId, id: Number(id) });
    if (!post) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Post no encontrado' }
      });
    }

    res.json(post);
  } catch (e) { next(e); }
}