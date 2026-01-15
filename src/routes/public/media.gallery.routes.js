import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { publicList, publicListSchema } from '../../controllers/mediaGallery.controller.js';

const r = Router();

r.get('/media/gallery', validate(publicListSchema, 'query'), publicList);

export default r;
