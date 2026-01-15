import { Router } from 'express';
import { me } from '../../controllers/me.controller.js';
const r = Router();
r.get('/', me);
export default r;
