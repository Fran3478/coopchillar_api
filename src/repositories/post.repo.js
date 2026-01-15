import { sequelize } from '../db/models/index.js';
const { models, constructor: Sequelize } = sequelize;
import { Op, fn, col, cast, literal } from 'sequelize';

export async function listPosts({ tenantId, tipo, estado, q, page, pageSize }) {
  const where = { tenantId };
  if (tipo) where.tipo = tipo;
  if (estado) where.estado = estado;
  const and = [];
  if (q) and.push({ titulo: { [Sequelize.Op.iLike]: `%${q}%` } });
  const whereFinal = and.length ? { ...where, [Sequelize.Op.and]: and } : where;

  return models.Post.findAndCountAll({
    where: whereFinal,
    order: [['publicadoEn','DESC'], ['id','DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });
}

export async function listPublicPosts({ tenantId, tipo, destacado, q, page, pageSize }) {
  const where = {
    tenantId,
    estado: 'published',
    publicadoEn: { [Sequelize.Op.lte]: new Date() }
  };
  if (tipo) where.tipo = tipo;
  if (typeof destacado !== 'undefined') where.destacado = destacado;

  const and = [];
  if (q) and.push({ titulo: { [Sequelize.Op.iLike]: `%${q}%` } });
  const whereFinal = and.length ? { ...where, [Sequelize.Op.and]: and } : where;

  return models.Post.findAndCountAll({
    where: whereFinal,
    order: [['publicadoEn', 'DESC'], ['id','DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });
}

export async function getPostById({ id, tenantId }) {
  return models.Post.findOne({ where: { id, tenantId } });
}
export async function getPostBySlug({ slug, tenantId }) {
  return models.Post.findOne({ where: { slug, tenantId, estado: 'published' } });
}
export async function existsSlug({ slug, tenantId, excludeId }) {
  const where = { slug, tenantId };
  if (excludeId) where.id = { [Sequelize.Op.ne]: excludeId };
  const c = await models.Post.count({ where });
  return c > 0;
}
export async function createPost(data) { return models.Post.create(data); }
export async function updatePost(id, tenantId, data) {
  const p = await getPostById({ id, tenantId });
  if (!p) return null;
  return p.update(data);
}

export async function findUsagesForPublicIds({ tenantId, publicIds = [] }) {
  if (!publicIds.length) return {};

  // Buscamos candidatos con un OR grande (portada o blocksJson::text) para cualquiera de los ids
  const orClauses = [];
  for (const pid of publicIds) {
    orClauses.push({ portadaUrl: { [Op.iLike]: `%${pid}%` } });
    // blocksJson::text ILIKE %pid%
    orClauses.push(sequelize.where(cast(col('blocksJson'), 'text'), { [Op.iLike]: `%${pid}%` }));
  }

  const rows = await sequelize.models.Post.findAll({
    attributes: ['id','tenantId','tipo','titulo','slug','portadaUrl','blocksJson'],
    where: { tenantId, [Op.or]: orClauses }
  });

  // Armamos un diccionario publicId -> usos[]
  const map = {};
  for (const r of rows) {
    const raw = r.get ? r.get() : r;
    const textBlocks = JSON.stringify(raw.blocksJson || {});
    for (const pid of publicIds) {
      const usedInPortada = (raw.portadaUrl || '').includes(pid);
      const usedInBlocks  = textBlocks.includes(pid);
      if (usedInPortada || usedInBlocks) {
        map[pid] ??= [];
        if (usedInPortada) map[pid].push({ kind: 'post_portada', postId: raw.id, tipo: raw.tipo, titulo: raw.titulo, slug: raw.slug });
        if (usedInBlocks)  map[pid].push({ kind: 'post_blocks',  postId: raw.id, tipo: raw.tipo, titulo: raw.titulo, slug: raw.slug });
      }
    }
  }
  return map;
}