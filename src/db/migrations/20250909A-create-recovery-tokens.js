import { DataTypes } from 'sequelize';

export async function up({ context: qi }) {
  await qi.createTable('recovery_tokens', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    tenantId: { type: DataTypes.INTEGER, allowNull: false },
    tokenHash: { type: DataTypes.STRING(128), allowNull: false },
    purpose: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'account_recovery' },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    usedAt: { type: DataTypes.DATE, allowNull: true },
    requestedByUserId: { type: DataTypes.INTEGER, allowNull: false },
    requestedIp: { type: DataTypes.STRING(64), allowNull: true },
    requestedUa: { type: DataTypes.STRING(500), allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await qi.addIndex('recovery_tokens', ['userId', 'expiresAt']);
  await qi.addIndex('recovery_tokens', ['tenantId', 'expiresAt']);
}

export async function down({ context: qi }) {
  await qi.dropTable('recovery_tokens');
}
