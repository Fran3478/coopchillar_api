export const env = {
  node: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    dialect: process.env.DB_DIALECT ?? 'postgres'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES ?? '10m'
  },
  refresh: {
    expiresDays: Number(process.env.REFRESH_EXPIRES_DAYS ?? 30),
    cookieName: process.env.REFRESH_COOKIE_NAME || 'refresh',
    cookieRid: process.env.REFRESH_COOKIE_RID || 'rid',
    cookieSecure: String(process.env.COOKIE_SECURE || 'false') === 'true',
    cookieDomain: process.env.COOKIE_DOMAIN || undefined
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'gestarcoop'
  }
};
