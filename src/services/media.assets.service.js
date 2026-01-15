// src/services/media.assets.service.js
import * as cloudRepo from '../repositories/media.cloudinary.repo.js';
import * as postRepo from '../repositories/post.repo.js';
import { BadRequestError, ConflictError } from '../utils/errors.js';

// Lista subcarpetas del tenant (relativas al root del tenant)
export async function listFolders({ tenantId, parent }) {
  return cloudRepo.listSubfolders({ tenantId, parent });
}

// Lista assets por carpeta + marca dónde se usan en Posts
export async function listAssets({ tenantId, folder = '', resourceType = 'image', pageSize = 50, cursor }) {
  const { items, nextCursor, totalCountApprox } = await cloudRepo.listAssetsByFolder({
    tenantId, folder, resourceType, max: pageSize, cursor
  });

  // Buscamos usos en bloque (bulk)
  const publicIds = items.map(x => x.publicId);
  const usageMap = await postRepo.findUsagesForPublicIds({ tenantId, publicIds });

  const enriched = items.map(x => ({
    ...x,
    used: Boolean(usageMap[x.publicId]?.length),
    usages: usageMap[x.publicId] || []
  }));

  return { items: enriched, nextCursor, totalCountApprox };
}

// Elimina un asset (chequea uso; requiere force=true si está en uso)
export async function removeAsset({ tenantId, publicId, resourceType = 'image', force = false }) {
  if (!publicId) throw new BadRequestError('Falta publicId');

  // Validamos uso primero
  const usageMap = await postRepo.findUsagesForPublicIds({ tenantId, publicIds: [publicId] });
  const usages = usageMap[publicId] || [];
  if (usages.length && !force) {
    throw new ConflictError('El asset está en uso', usages); // 409 con detalles
  }

  const result = await cloudRepo.deleteAsset({ publicId, resourceType, invalidate: true });
  return { result, usages };
}
