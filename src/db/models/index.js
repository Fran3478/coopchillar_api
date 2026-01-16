import { sequelize } from '../sequelize.js';
import { initUser } from './User.js';
import { initSession } from './Session.js';
import { initPost } from './Post.js';
import { initContactMessage } from './ContactMessage.js';
import { initEbillingRequest } from './EbillingRequest.js';
import { initRecoveryToken } from './RecoveryToken.js';
import { initMediaGallery } from './MediaGallery.js';

export async function initModels() {
  initUser(sequelize);
  initSession(sequelize);
  initPost(sequelize);
  initContactMessage(sequelize);
  initEbillingRequest(sequelize);
  initRecoveryToken(sequelize);
  initMediaGallery(sequelize)
  // await sequelize.sync(); // en prod: usar migraciones
}

export { sequelize };
