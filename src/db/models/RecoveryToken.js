import { DataTypes, Model } from 'sequelize';

export class RecoveryToken extends Model {}

export function initRecoveryToken(sequelize) {
  RecoveryToken.init(
    {
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
    },
    { sequelize, tableName: 'recovery_tokens', modelName: 'RecoveryToken' }
  );
}
