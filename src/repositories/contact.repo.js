import { sequelize } from '../db/models/index.js';
const { models, constructor: Sequelize } = sequelize;

export async function create({ tenantId, data, meta }) {
  return models.ContactMessage.create({
    tenantId,
    socioNumero: data.socioNumero ?? null,
    dni: data.dni ?? null,
    nombre: data.nombre,
    apellido: data.apellido ?? null,
    telefono: data.telefono ?? null,
    email: data.email ?? null,
    categoria: data.categoria,
    detalle: data.detalle,
    status: 'pending',
    ip: meta?.ip ?? null,
    ua: meta?.ua ?? null
  });
}

export async function list({ tenantId, status, categoria, q, page, pageSize }) {
  const where = { tenantId };
  if (status) where.status = status;
  if (categoria) where.categoria = categoria;

  const and = [];
  if (q) {
    and.push({
      [Sequelize.Op.or]: [
        { nombre: { [Sequelize.Op.iLike]: `%${q}%` } },
        { apellido: { [Sequelize.Op.iLike]: `%${q}%` } },
        { email: { [Sequelize.Op.iLike]: `%${q}%` } },
        { telefono: { [Sequelize.Op.iLike]: `%${q}%` } },
        { dni: { [Sequelize.Op.iLike]: `%${q}%` } },
        { detalle: { [Sequelize.Op.iLike]: `%${q}%` } }
      ]
    });
  }
  const whereFinal = and.length ? { ...where, [Sequelize.Op.and]: and } : where;

  return models.ContactMessage.findAndCountAll({
    where: whereFinal,
    order: [['createdAt','DESC'], ['id','DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });
}

export async function updateStatus({ tenantId, id, status, handledByUserId }) {
  const row = await models.ContactMessage.findOne({ where: { id, tenantId } });
  if (!row) return null;
  row.status = status;
  row.handledByUserId = handledByUserId ?? row.handledByUserId ?? null;
  row.handledAt = (status === 'resolved') ? new Date() : null;
  await row.save();
  return row;
}
