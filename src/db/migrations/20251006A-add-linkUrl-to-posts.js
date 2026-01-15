// src/db/migrations/20251006A-add-linkUrl-to-posts.js

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: queryInterface }) => {
  const Sequelize = queryInterface.sequelize.constructor;

  // Columna nueva para link externo (opcional)
  await queryInterface.addColumn('posts', 'linkUrl', {
    type: Sequelize.STRING(500),
    allowNull: true,
  });

  // (Opcional) índice auxiliar por tenant, si después querés filtrar por linkUrl
  // await queryInterface.addIndex('posts', ['tenantId', 'linkUrl'], { name: 'posts_tenant_linkurl_idx' });
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: queryInterface }) => {
  // try/catch por si no creaste el índice opcional
  // await queryInterface.removeIndex('posts', 'posts_tenant_linkurl_idx').catch(() => {});
  await queryInterface.removeColumn('posts', 'linkUrl');
};
