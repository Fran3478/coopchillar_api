export async function up({ context: qi }) {
  const S = qi.sequelize.constructor;

  await qi.createTable('posts', {
    id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
    tenantId: { type: S.INTEGER, allowNull: false },

    tipo: { type: S.ENUM('noticia', 'novedad'), allowNull: false },

    titulo: { type: S.STRING(200), allowNull: false },
    slug: { type: S.STRING(220), allowNull: false },
    excerpt: { type: S.STRING(300) },
    portadaUrl: { type: S.STRING(500) },
    destacado: { type: S.BOOLEAN, allowNull: false, defaultValue: false },

    estado: { type: S.ENUM('draft', 'published', 'archived'), allowNull: false, defaultValue: 'draft' },

    publicadoEn: { type: S.DATE },
    blocksJson: { type: S.JSONB, allowNull: false },

    createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
  });

  await qi.addIndex('posts', ['tenantId', 'slug'], { unique: true, name: 'uk_posts_tenant_slug' });
  await qi.addIndex('posts', ['tenantId', 'tipo', 'publicadoEn'], { name: 'ix_posts_tenant_tipo_pub' });
}

export async function down({ context: qi }) {
  await qi.dropTable('posts');

  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_posts_tipo";');
  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_posts_estado";');
}
