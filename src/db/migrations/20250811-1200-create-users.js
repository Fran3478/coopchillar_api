export async function up({ context: qi }) {
  const S = qi.sequelize.constructor;
  await qi.createTable('users', {
    id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
    tenantId: { type: S.INTEGER, allowNull: false },
    email: { type: S.STRING(160), allowNull: false },
    passwordHash: { type: S.STRING(200), allowNull: false },
    role: { type: S.ENUM('owner','admin','editor','viewer'), allowNull: false, defaultValue: 'editor' },
    status: { type: S.ENUM('active','blocked'), allowNull: false, defaultValue: 'active' },
    createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
  });
  await qi.addIndex('users', ['tenantId','email'], { unique: true, name: 'uk_users_tenant_email' });
}

export async function down({ context: qi }) {
  await qi.dropTable('users');
  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_users_status";');
}
