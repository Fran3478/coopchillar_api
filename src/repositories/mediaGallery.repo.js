import { Op } from 'sequelize';
import { sequelize } from '../db/models/index.js';
const { models } = sequelize;

export async function upsertMany({ tenantId, items }) {
  const results = [];
  for (const it of items) {
    const [row] = await models.MediaGallery.upsert(
      { tenantId, ...it },
      { returning: true, conflictFields: ['tenantId','publicId'] }
    );
    results.push(row);
  }
  return results;
}

export async function findById({ tenantId, id }) {
  return models.MediaGallery.findOne({ where: { id, tenantId } });
}

export async function updateOne({ tenantId, id, patch }) {
  const row = await findById({ tenantId, id });
  if (!row) return null;
  const hasChanges = patch && Object.keys(patch).length > 0;
  if(hasChanges) {
    await row.update(patch);
    return { row, changed: true };
  }
  return { row, changed: false };
}

export async function destroyOne({ tenantId, id }) {
  return models.MediaGallery.destroy({ where: { id, tenantId } });
}

export async function listPrivate({ tenantId, q, album, estado, page = 1, pageSize = 20 }) {
  const where = { tenantId };
  if (album) where.album = album;
  if (estado) where.estado = estado;
  if (q) {
    where[Op.or] = [
      { description: { [Op.iLike]: `%${q}%` } },
      { alt: { [Op.iLike]: `%${q}%` } },
      { album: { [Op.iLike]: `%${q}%` } },
      { publicId: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const offset = (page - 1) * pageSize;
  const result = await models.MediaGallery.findAndCountAll({
    where,
    order: [['id','DESC']],
    offset,
    limit: pageSize
  });
  return result;
}

export async function listPublic({ tenantId, album, page = 1, pageSize = 20 }) {
  const where = { tenantId, estado: 'published' };
  if (album) where.album = album;

  const offset = (page - 1) * pageSize;
  const result = await models.MediaGallery.findAndCountAll({
    where,
    attributes: ['id','url','alt','description','album'],
    order: [['id','DESC']],
    offset,
    limit: pageSize
  });
  return result;
}
