import { Op } from 'sequelize';
import { sequelize } from '../db/models/index.js';

export async function findUserByEmailTenant(email, tenantId) {
  return sequelize.models.User.findOne({ where: { email, tenantId } });
}

export async function findUserById(id) {
  return sequelize.models.User.findByPk(id);
}

export async function findById({ id, tenantId }) {
  return sequelize.models.User.findOne({ where: { id, tenantId } });
}

export async function findByEmailTenant({ email, tenantId }) {
  return sequelize.models.User.findOne({ where: { email, tenantId } });
}

export async function updatePassword({ userId, passwordHash }) {
  await sequelize.models.User.update({ passwordHash }, { where: { id: userId } });
}

export async function listUsers({ tenantId, q, role, status, page = 1, pageSize = 20 }) {
  const where = { tenantId };
  if (role)   where.role = role;
  if (status) where.status = status;

  const and = [];
  if (q) and.push({ email: { [Op.iLike]: `%${q}%` } });
  const whereFinal = and.length ? { ...where, [Op.and]: and } : where;

  return sequelize.models.User.findAndCountAll({
    attributes: ['id','email','role','status','createdAt','updatedAt'],
    where: whereFinal,
    order: [['createdAt','DESC'], ['id','DESC']],
    offset: (Number(page) - 1) * Number(pageSize),
    limit: Number(pageSize)
  });
}

export async function countActiveOwnersExcluding({ tenantId, excludeUserId }) {
  const where = { tenantId, role: 'owner', status: 'active' };
  if (excludeUserId != null) where.id = { [Op.ne]: excludeUserId };
  return sequelize.models.User.count({ where });
}

export async function updateEmail({ userId, tenantId, email }) {
  await sequelize.models.User.update({ email }, { where: { id: userId, tenantId } });
}

export async function updateRole({ userId, tenantId, role }) {
  await sequelize.models.User.update({ role }, { where: { id: userId, tenantId } });
}

export async function updateStatus({ userId, tenantId, status }) {
  await sequelize.models.User.update({ status }, { where: { id: userId, tenantId } });
}

export async function createUser({ tenantId, email, passwordHash, role = 'editor', status = 'active' }) {
  const row = await sequelize.models.User.create({ tenantId, email, passwordHash, role, status });
  return row;
}
