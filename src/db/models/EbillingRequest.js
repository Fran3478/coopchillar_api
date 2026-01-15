import { DataTypes, Model } from 'sequelize';

export class EbillingRequest extends Model {}

export function initEbillingRequest(sequelize) {
  EbillingRequest.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      tenantId: { type: DataTypes.INTEGER, allowNull: false },

      abonadoNumero: { type: DataTypes.STRING(50), allowNull: false },
      dniCuit: { type: DataTypes.STRING(30), allowNull: false },

      nombre: { type: DataTypes.STRING(120), allowNull: false },
      apellido: { type: DataTypes.STRING(120), allowNull: false },

      email: { type: DataTypes.STRING(180), allowNull: false },
      telefono: { type: DataTypes.STRING(50), allowNull: true },

      status: {
        type: DataTypes.ENUM('pending','resolved'),
        allowNull: false,
        defaultValue: 'pending'
      },

      handledByUserId: { type: DataTypes.INTEGER, allowNull: true },
      handledAt: { type: DataTypes.DATE, allowNull: true },

      ip: { type: DataTypes.STRING(64), allowNull: true },
      ua: { type: DataTypes.STRING(500), allowNull: true }
    },
    {
      sequelize,
      tableName: 'ebilling_requests',
      modelName: 'EbillingRequest',
      indexes: [
        { fields: ['tenantId','status','createdAt'] },
        { fields: ['tenantId','abonadoNumero'] },
      ]
    }
  );
}
