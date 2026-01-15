import { Router } from 'express';
import health from './health.routes.js';
import auth from './auth.routes.js';
import content from './content.routes.js';
import forms from './form.routes.js';
import authRecovery from './auth.recovery.routes.js';
import mediaGallery from './media.gallery.routes.js';

const pub = Router();
pub.use(health);
pub.use(auth);
pub.use(content);
pub.use(forms);
pub.use(authRecovery);
pub.use(mediaGallery);

export default pub;
