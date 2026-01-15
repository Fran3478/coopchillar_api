import { Router } from 'express';
import { getPublicBySlug, listPublic, publicListSchema } from '../../controllers/post.controller.js';
import { publicList as galleryPublicList, publicListSchema as galleryPublicListSchema } from '../../controllers/mediaGallery.controller.js';

import { validate } from '../../middlewares/validate.js';

const r = Router();

r.get('/public/tenants/:tenantId/posts', validate(publicListSchema, 'query'), listPublic);

r.get('/public/tenants/:tenantId/posts/:slug', getPublicBySlug);

r.get('/public/tenants/:tenantId/media/gallery', validate(galleryPublicListSchema, 'query'), galleryPublicList);


export default r;
