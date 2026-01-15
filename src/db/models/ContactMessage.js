import { DataTypes, Model } from 'sequelize';

export class ContactMessage extends Model {}

export function initContactMessage(sequelize) {
  ContactMessage.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      tenantId: { type: DataTypes.INTEGER, allowNull: false },
      socioNumero: { type: DataTypes.STRING(50), allowNull: true },
      dni: { type: DataTypes.STRING(20), allowNull: true },
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      apellido: { type: DataTypes.STRING(120), allowNull: true },
      telefono: { type: DataTypes.STRING(50), allowNull: true },
      email: { type: DataTypes.STRING(180), allowNull: true },
      categoria: {
        type: DataTypes.ENUM('reclamo','consulta','recomendacion','otro'),
        allowNull: false
      },
      detalle: { type: DataTypes.TEXT, allowNull: false },
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
      tableName: 'contact_messages',
      modelName: 'ContactMessage',
      indexes: [
        { fields: ['tenantId','status','createdAt'] },
      ]
    }
  );
}
