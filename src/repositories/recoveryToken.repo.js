import crypto from 'node:crypto';
import { sequelize } from '../db/models/index.js';
import { Op } from 'sequelize';

function hashToken(plain) {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

function generateReadableToken() {
  const buf = crypto.randomBytes(10);
  const base32 = buf.toString('base64').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 16);
  return `${base32.slice(0,4)}-${base32.slice(4,8)}-${base32.slice(8,12)}-${base32.slice(12,16)}`;
}

export async function createForUser({ userId, tenantId, requestedByUserId, ttlMinutes = 15, ip, ua, purpose = 'account_recovery' }) {
  const tokenPlain = generateReadableToken();
  const tokenHash = hashToken(tokenPlain);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await sequelize.models.RecoveryToken.update(
    { usedAt: new Date() },
    { where: { userId, usedAt: null, expiresAt: { [Op.gt]: new Date() } } }
  );

  const row = await sequelize.models.RecoveryToken.create({
    userId,
    tenantId,
    tokenHash,
    expiresAt,
    requestedByUserId,
    requestedIp: ip ?? null,
    requestedUa: ua ?? null,
    purpose
  });

  return { token: tokenPlain, expiresAt, id: row.id };
}

export async function findValidByUserAndToken({ userId, token, purposeList = ['account_recovery'] }) {
  const tokenHash = hashToken(token);
  return sequelize.models.RecoveryToken.findOne({
    where: {
      userId,
      tokenHash,
      usedAt: null,
      expiresAt: { [Op.gt]: new Date() },
      purpose: { [Op.in]: purposeList },
    },
    order: [['id', 'DESC']],
  });
}

export async function markUsed({ id }) {
  await sequelize.models.RecoveryToken.update({ usedAt: new Date() }, { where: { id } });
}

export async function findByIdValid({ id, userId }) {
  return sequelize.models.RecoveryToken.findOne({
    where: {
      id,
      userId,
      usedAt: null,
      expiresAt: { [Op.gt]: new Date() },
      purpose: { [Op.in]: ['account_recovery','onboarding'] }
    }
  });
}