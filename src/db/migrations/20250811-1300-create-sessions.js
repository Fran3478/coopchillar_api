export async function up({ context: qi }) {
  const S = qi.sequelize.constructor;
  await qi.createTable('sessions', {
    id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: S.INTEGER, allowNull: false },
    tokenHash: { type: S.STRING(255), allowNull: false },
    ua: { type: S.STRING(300) },
    ip: { type: S.STRING(100) },
    expiresAt: { type: S.DATE, allowNull: false },
    createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
  });
  await qi.addIndex('sessions', ['userId']);
  await qi.addIndex('sessions', ['tokenHash'], { unique: true, name: 'uk_sessions_tokenhash' });
}
export async function down({ context: qi }) {
  await qi.dropTable('sessions');
}
