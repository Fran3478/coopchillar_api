import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true
});

export function tenantRoot(tenantId) {
  return `${env.cloudinary.folder}/tenant_${tenantId}`;
}

export async function listSubfolders({ tenantId, parent = '' }) {
  const root = tenantRoot(tenantId);
  const folderPath = parent ? `${root}/${parent}` : root;
  const { folders } = await cloudinary.api.sub_folders(folderPath);
  return folders.map(f => ({
    name: f.name,
    path: f.path.replace(`${root}/`, ''),
  }));
}

export async function listAssetsByFolder({ tenantId, folder = '', resourceType = 'image', max = 50, cursor }) {
  const root = tenantRoot(tenantId);
  const folderPath = folder ? `${root}/${folder}` : root;

  const expr = `folder:${folderPath}/*`;
  const search = cloudinary.search
    .expression(expr)
    .with_field('context')
    .with_field('tags')
    .max_results(max);

  if (cursor) search.next_cursor(cursor);
  if (resourceType && resourceType !== 'all') {
  }

  const res = await search.execute();
  const items = res.resources
    .filter(r => resourceType === 'all' ? true : r.resource_type === resourceType)
    .map(r => ({
      publicId: r.public_id,
      format: r.format,
      resourceType: r.resource_type,
      secureUrl: r.secure_url,
      folder: r.folder.replace(`${root}/`, ''),
      bytes: r.bytes,
      width: r.width,
      height: r.height,
      createdAt: r.created_at,
      tags: r.tags || [],
    }));

  return { items, nextCursor: res.next_cursor || null, totalCountApprox: res.total_count || undefined };
}

export async function deleteAsset({ publicId, resourceType = 'image', invalidate = true }) {
  const out = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate });
  return out;
}
