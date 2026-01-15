import * as repo from '../repositories/mediaGallery.repo.js';
import * as cloudRepo from '../repositories/media.cloudinary.repo.js'; // ya lo tenés
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors.js';

/**
 * items: [{ upload: { public_id, resource_type, secure_url }, meta?: { alt, description, album, estado } }]
 * - resource_type: 'image'|'video'
 */
export async function saveMany({ tenantId, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('items vacío');
  }

  const mapped = items.map(({ upload, meta = {} }) => {
    if (!upload?.public_id || !upload?.secure_url) {
      throw new BadRequestError('Faltan public_id o secure_url');
    }
    return {
      publicId: upload.public_id,
      resourceType: upload.resource_type === 'video' ? 'video' : 'image',
      url: upload.secure_url,
      alt: meta.alt ?? null,
      description: meta.description ?? null,
      album: meta.album ?? null,
      estado: meta.estado ?? 'published', // default
    };
  });

  return repo.upsertMany({ tenantId, items: mapped });
}

export async function listPrivate(params) {
  return repo.listPrivate(params);
}

export async function listPublic(params) {
  return repo.listPublic(params);
}

export async function update({ tenantId, id, data }) {
  const patch = {};
  if('alt' in data) patch.alt = data.alt.trim() === '' ? null : data.alt;
  if('description' in data) patch.description = data.description.trim() === '' ? null : data.description;
  if('album' in data) patch.album = data.album.trim() === '' ? null : data.album;
  if(typeof data.estado !== 'undefined') patch.estado = data.estado;
  
  const row = await repo.updateOne({tenantId, id, patch});
  if(!row) throw new NotFoundError('No encontrado');
  return row; 
}

/** Delete duro: Cloudinary + DB. Requiere estado='draft' salvo force=true */
export async function remove({ tenantId, id, force = false }) {
  const row = await repo.findById({ tenantId, id });
  if (!row) throw new NotFoundError('No encontrado');

  if (row.estado !== 'draft' && !force) {
    throw new ConflictError('Para eliminar, primero marcá el recurso como draft (o usar force=true)');
  }

  // borrar en Cloudinary
  const out = await cloudRepo.deleteAsset({
    publicId: row.publicId,
    resourceType: row.resourceType,
    invalidate: true
  });
  // out.result puede ser 'ok' | 'not found' | 'already deleted'
  // si no fue ok ni not found, considerá lanzar error:
  if (out?.result && !['ok','not found'].includes(out.result)) {
    throw new ConflictError(`Cloudinary: ${out.result}`);
  }

  // borrar en DB
  await repo.destroyOne({ tenantId, id });

  return { ok: true, deleted: true, cloudinary: out?.result ?? 'ok' };
}

export async function getOnePrivate({ tenantId, id }) {
  const row = await repo.findById({ tenantId, id });
  if (!row) throw new NotFoundError('No encontrado');
  return row;
}