import { DataTypes, Model } from 'sequelize';

export class User extends Model {}

export function initUser(sequelize) {
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      tenantId: { type: DataTypes.INTEGER, allowNull: false },
      email: { type: DataTypes.STRING(160), allowNull: false },
      passwordHash: { type: DataTypes.STRING(200), allowNull: false },
      role: { type: DataTypes.ENUM('owner','admin','editor','viewer'), allowNull: false, defaultValue: 'editor' },
      status: { type: DataTypes.ENUM('active','blocked'), allowNull: false, defaultValue: 'active' }
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
      indexes: [{ unique: true, fields: ['tenantId', 'email'] }]
    }
  );
}
