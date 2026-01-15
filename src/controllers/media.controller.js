import { z } from 'zod';
import { buildCloudinarySignature } from '../services/media.service.js';

const incomingTransformSchema = z.string().regex(
  /^(c_limit,)?w_\d{2,5}(,h_\d{2,5})?\/f_webp,(q_auto(?::(eco|good|best))?)$/,
  'Transformación de entrada inválida. Ej: c_limit,w_2560/f_webp,q_auto:good'
).optional();

export const signSchema = z.object({
  resourceType: z.enum(['image','video']).optional(),
  folder: z.string().regex(/^[a-zA-Z0-9/_-]*$/).optional(),
  publicId: z.string().regex(/^[a-zA-Z0-9/_-]*$/).optional(),
  eager: z.string().optional(),
  incomingTransform: incomingTransformSchema
});

export async function signUploadController(req, res, next) {
  try {
    const { resourceType, folder, publicId, eager, incomingTransform } = (req.validated?.body ?? {});
    const { tenantId } = req.user;
    const payload = buildCloudinarySignature({ tenantId, resourceType, folder, publicId, eager, incomingTransform  });
    res.json(payload);
  } catch (e) { next(e); }
}
