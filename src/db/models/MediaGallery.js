import { DataTypes, Model } from 'sequelize';

export class MediaGallery extends Model {}

export function initMediaGallery(sequelize) {
  MediaGallery.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      tenantId: { type: DataTypes.INTEGER, allowNull: false },

      publicId: { type: DataTypes.STRING(255), allowNull: false },
      resourceType: { type: DataTypes.ENUM('image','video'), allowNull: false, defaultValue: 'image' },

      url: { type: DataTypes.STRING(500), allowNull: false },

      alt: { type: DataTypes.STRING(200) },
      description: { type: DataTypes.STRING(500) },
      album: { type: DataTypes.STRING(120) },

      estado: { type: DataTypes.ENUM('draft','published','archived'), allowNull: false, defaultValue: 'published' }
    },
    {
      sequelize,
      tableName: 'media_gallery',
      modelName: 'MediaGallery',
      indexes: [
        { unique: true, fields: ['tenantId','publicId'] },
        { fields: ['tenantId','album'] },
        { fields: ['tenantId','estado'] }
      ]
    }
  );
}
