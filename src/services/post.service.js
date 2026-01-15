import { slugify } from '../utils/slug.js';
import * as postRepo from '../repositories/post.repo.js';
import { NotFoundError } from '../utils/errors.js';

export async function list({ tenantId, tipo, estado, q, page = 1, pageSize = 10 }) {
  return postRepo.listPosts({ tenantId, tipo, estado, q, page: Number(page), pageSize: Number(pageSize) });
}

export async function listPublic({ tenantId, tipo, destacado, q, page = 1, pageSize = 10 }) {
  return postRepo.listPublicPosts({
    tenantId,
    tipo,
    destacado: typeof destacado === 'undefined' ? undefined : !!destacado,
    q,
    page: Number(page),
    pageSize: Number(pageSize)
  });
}

export async function create({ tenantId, tipo, titulo, excerpt, portadaUrl, linkUrl, destacado, blocksJson }) {
  const base = slugify(titulo);
  let slug = base, i = 1;
  while (await postRepo.existsSlug({ slug, tenantId })) { i++; slug = `${base}-${i}`; }
  const normalizedLink = (typeof linkUrl === 'string' && linkUrl.trim() === '') ? null : linkUrl;
  return postRepo.createPost({ tenantId, tipo, titulo, slug, excerpt, portadaUrl, linkUrl: normalizedLink, destacado: !!destacado, estado: 'draft', blocksJson });
}

export async function update({ id, tenantId, data }) {
  if (data.titulo) {
    const base = slugify(data.titulo);
    let slug = base, i = 1;
    while (await postRepo.existsSlug({ slug, tenantId, excludeId: id })) { i++; slug = `${base}-${i}`; }
    data.slug = slug;
  }
  if(Object.prototype.hasOwnProperty.call(data, 'linkUrl')) {
    if(typeof data.linkUrl === 'string' && data.linkUrl.trim() === '') {
      data.linkUrl = null;
    }
  }
  const updated = await postRepo.updatePost(id, tenantId, data);
  if (!updated) throw new NotFoundError('Post no encontrado');
  return updated;
}

export async function publish({ id, tenantId }) {
  const p = await postRepo.updatePost(id, tenantId, { estado: 'published', publicadoEn: new Date() });
  if (!p) throw new NotFoundError('Post no encontrado');
  return p;
}

export async function unpublish({ id, tenantId }) {
  const p = await postRepo.updatePost(id, tenantId, { estado: 'draft', publicadoEn: null });
  if (!p) throw new NotFoundError('Post no encontrado');
  return p;
}

export async function getPublicBySlug({ tenantId, slug }) {
  return postRepo.getPostBySlug({ tenantId, slug });
}

export async function getById({ tenantId, id }) {
  return postRepo.getPostById({ tenantId, id });
}