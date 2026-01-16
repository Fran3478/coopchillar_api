/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: queryInterface }) => {
  const Sequelize = queryInterface.sequelize.constructor;

  await queryInterface.addColumn('posts', 'linkUrl', {
    type: Sequelize.STRING(500),
    allowNull: true,
  });

};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('posts', 'linkUrl');
};
