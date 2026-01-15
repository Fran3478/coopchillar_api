import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }) {
  await queryInterface.createTable('ebilling_requests', {
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
    ua: { type: DataTypes.STRING(500), allowNull: true },

    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  await queryInterface.addIndex('ebilling_requests', ['tenantId','status','createdAt']);
}

export async function down({ context: qi }) {
  await qi.dropTable('ebilling_requests');

  if (qi.sequelize.getDialect() === 'postgres') {
    await qi.sequelize.query('DROP TYPE IF EXISTS "enum_ebilling_requests_status";');
  }
}
