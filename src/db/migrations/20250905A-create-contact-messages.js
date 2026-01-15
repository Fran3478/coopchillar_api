import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }) {
  await queryInterface.createTable('contact_messages', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenantId: { type: DataTypes.INTEGER, allowNull: false },

    socioNumero: { type: DataTypes.STRING(50), allowNull: true },
    dni: { type: DataTypes.STRING(20), allowNull: true },

    nombre: { type: DataTypes.STRING(120), allowNull: false },
    apellido: { type: DataTypes.STRING(120), allowNull: false },

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
    ua: { type: DataTypes.STRING(500), allowNull: true },

    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  await queryInterface.addIndex('contact_messages', ['tenantId','status','createdAt']);
}

export async function down({ context: qi }) {
  await qi.dropTable('contact_messages');

  if (qi.sequelize.getDialect() === 'postgres') {
    await qi.sequelize.query('DROP TYPE IF EXISTS "enum_contact_messages_categoria";');
    await qi.sequelize.query('DROP TYPE IF EXISTS "enum_contact_messages_status";');
  }
}
