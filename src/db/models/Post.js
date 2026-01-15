import { DataTypes, Model } from 'sequelize';
export class Post extends Model {}
export function initPost(sequelize) {
  Post.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      tenantId: { type: DataTypes.INTEGER, allowNull: false },
      tipo: { type: DataTypes.ENUM('noticia','novedad'), allowNull: false },
      titulo: { type: DataTypes.STRING(200), allowNull: false },
      slug: { type: DataTypes.STRING(220), allowNull: false },
      excerpt: { type: DataTypes.STRING(300) },
      portadaUrl: { type: DataTypes.STRING(500) },
      linkUrl: { type: DataTypes.STRING(500) },
      destacado: { type: DataTypes.BOOLEAN, defaultValue: false },
      estado: { type: DataTypes.ENUM('draft','published','archived'), defaultValue: 'draft' },
      publicadoEn: { type: DataTypes.DATE },
      blocksJson: { type: DataTypes.JSONB, allowNull: false }
    },
    { sequelize, tableName: 'posts', modelName: 'Post', indexes: [{ unique: true, fields: ['tenantId','slug'] }] }
  );
}
