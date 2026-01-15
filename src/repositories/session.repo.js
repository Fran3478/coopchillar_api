import { sequelize } from '../db/models/index.js';
const { models } = sequelize;

export async function createSession({ userId, tokenHash, ua, ip, expiresAt }) {
  return models.Session.create({ userId, tokenHash, ua, ip, expiresAt });
}
export async function getSessionById(id) {
  return models.Session.findByPk(id);
}
export async function updateSession(id, data) {
  const s = await models.Session.findByPk(id);
  if (!s) return null;
  return s.update(data);
}
export async function deleteSession(id) {
  const s = await models.Session.findByPk(id);
  if (!s) return 0;
  await s.destroy(); return 1;
}
export async function revokeAllForUser({ userId }) {
  if (sequelize.models.Session.rawAttributes.revokedAt) {
    await sequelize.models.Session.update(
      { revokedAt: new Date(), status: 'revoked' },
      { where: { userId, revokedAt: null } }
    );
  } else {
    await sequelize.models.Session.destroy({ where: { userId } });
  }
}