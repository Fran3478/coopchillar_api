import { DataTypes, Model } from 'sequelize';
export class Session extends Model {}
export function initSession(sequelize) {
  Session.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      tokenHash: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      ua: { type: DataTypes.STRING(300) },
      ip: { type: DataTypes.STRING(100) },
      expiresAt: { type: DataTypes.DATE, allowNull: false }
    },
    { sequelize, tableName: 'sessions', modelName: 'Session' }
  );
}
