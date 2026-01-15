import crypto from 'node:crypto';
import { env } from '../config/env.js';

export function signUpload(params) {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${Array.isArray(params[k]) ? params[k].join(',') : params[k]}`)
    .join('&');

  const toSign = `${sorted}${env.cloudinary.apiSecret}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');
  return signature;
}
