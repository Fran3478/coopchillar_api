import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import me from './me.routes.js';
import posts from './posts.routes.js';
import media from './media.routes.js';
import contacts from './contacts.routes.js';
import ebilling from './ebilling.routes.js';
// import adminRecovery from './admin.recovery.routes.js';
import users from './users.routes.js'
import mediaAssets from './media.assets.routes.js'

const priv = Router();
priv.use("/me", requireAuth, me);
priv.use("/posts", requireAuth, posts);
priv.use('/media', requireAuth, media);
priv.use('/', requireAuth, contacts);
priv.use('/', requireAuth, ebilling);
// priv.use('/', requireAuth, adminRecovery);
priv.use('/', requireAuth, users);
priv.use('/',requireAuth, mediaAssets)

export default priv;
