// XXXX-create-media-gallery.js
export async function up({ context: qi }) {
  const S = qi.sequelize.constructor;

  await qi.createTable('media_gallery', {
    id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
    tenantId: { type: S.INTEGER, allowNull: false },

    publicId: { type: S.STRING(255), allowNull: false },
    resourceType: { type: S.ENUM('image','video'), allowNull: false, defaultValue: 'image' },

    url: { type: S.STRING(500), allowNull: false }, // secure_url

    alt: { type: S.STRING(200) },
    description: { type: S.STRING(500) },
    album: { type: S.STRING(120) },

    estado: { type: S.ENUM('draft','published','archived'), allowNull: false, defaultValue: 'published' },

    createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
  });

  await qi.addIndex('media_gallery', ['tenantId','publicId'], { unique: true, name: 'uk_media_gallery_tenant_public' });
  await qi.addIndex('media_gallery', ['tenantId','album'], { name: 'ix_media_gallery_tenant_album' });
  await qi.addIndex('media_gallery', ['tenantId','estado'], { name: 'ix_media_gallery_estado' });
}

export async function down({ context: qi }) {
  await qi.dropTable('media_gallery');
  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_media_gallery_resourceType";');
  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_media_gallery_estado";');
}
