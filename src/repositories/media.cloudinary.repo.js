// src/repositories/media.cloudinary.repo.js
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

// Asegurá que estas vars están en env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true
});

// Devuelve el path raíz del tenant en Cloudinary
export function tenantRoot(tenantId) {
  return `${env.cloudinary.folder}/tenant_${tenantId}`;
}

// Lista subcarpetas inmediatas dentro de `parentFolder` (relativo al root del tenant)
export async function listSubfolders({ tenantId, parent = '' }) {
  const root = tenantRoot(tenantId);
  const folderPath = parent ? `${root}/${parent}` : root;
  const { folders } = await cloudinary.api.sub_folders(folderPath);
  // Mapeamos a rutas relativas al root del tenant
  return folders.map(f => ({
    name: f.name,              // nombre de la subcarpeta
    path: f.path.replace(`${root}/`, ''), // relativo al root del tenant
  }));
}

// Lista assets por carpeta (relativa al root del tenant). Soporta paginación con next_cursor.
export async function listAssetsByFolder({ tenantId, folder = '', resourceType = 'image', max = 50, cursor }) {
  const root = tenantRoot(tenantId);
  const folderPath = folder ? `${root}/${folder}` : root;

  // Usamos la Search API (más flexible que resources_by_prefix)
  const expr = `folder:${folderPath}/*`;
  const search = cloudinary.search
    .expression(expr)
    .with_field('context')
    .with_field('tags')
    .max_results(max);

  if (cursor) search.next_cursor(cursor);
  if (resourceType && resourceType !== 'all') {
    // NOTA: la expression puede filtrar por tipo, pero la Search API ya respeta resource_type del cliente
    // Para unificar resultados, delegamos el tipo en client, y aquí no forzamos resource_type en expr.
  }

  const res = await search.execute();
  const items = res.resources
    .filter(r => resourceType === 'all' ? true : r.resource_type === resourceType)
    .map(r => ({
      publicId: r.public_id,
      format: r.format,
      resourceType: r.resource_type,
      secureUrl: r.secure_url,
      folder: r.folder.replace(`${root}/`, ''), // relativo al root del tenant
      bytes: r.bytes,
      width: r.width,
      height: r.height,
      createdAt: r.created_at,
      tags: r.tags || [],
    }));

  return { items, nextCursor: res.next_cursor || null, totalCountApprox: res.total_count || undefined };
}

// Elimina un asset por publicId (completo, incluye subcarpetas). `invalidate` limpia CDN.
export async function deleteAsset({ publicId, resourceType = 'image', invalidate = true }) {
  // Para imágenes y videos:
// cloudinary.uploader.destroy(publicId, { resource_type: 'video'|'image', invalidate: true })
  const out = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate });
  return out; // { result: 'ok' | 'not found' | 'already deleted' ... }
}
