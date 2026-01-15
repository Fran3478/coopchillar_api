import { z } from 'zod';
import * as svc from '../services/mediaGallery.service.js';

export const publicListSchema = z.object({
  album: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export async function publicList(req, res, next) {
  try {
    const q = req.validated.query;
    const tenantId = Number(req.params.tenantId);
    const result = await svc.listPublic({ tenantId, ...q });
    res.json({ total: result.count, items: result.rows });
  } catch (e) { next(e); }
}
