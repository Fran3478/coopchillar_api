import { DataTypes } from 'sequelize';

export async function up({ context: qi }) {
  await qi.changeColumn('contact_messages', 'apellido', {
    type: DataTypes.STRING(120),
    allowNull: true
  });
}

export async function down({ context: qi }) {
  await qi.changeColumn('contact_messages', 'apellido', {
    type: DataTypes.STRING(120),
    allowNull: false
  });
}
