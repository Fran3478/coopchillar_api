import { env } from '../config/env.js';
import { signUpload } from '../utils/cloudinary.js';

export function buildCloudinarySignature({ tenantId, resourceType = 'image', folder, publicId, eager, incomingTransform = 'c_limit,w_2560/f_webp,q_auto:good'}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folderPath = `${env.cloudinary.folder}/tenant_${tenantId}${folder ? '/' + folder : ''}`;

  const params = {
    timestamp,
    folder: folderPath,
    ...(publicId ? { public_id: publicId } : {}),
    ...(eager ? { eager } : {}),
    ...(incomingTransform ? { transformation: incomingTransform } : {})
  };

  const signature = signUpload(params);
  return {
    cloudName: env.cloudinary.cloudName,
    apiKey: env.cloudinary.apiKey,
    signature,
    timestamp,
    folder: folderPath,
    resourceType,
    transformation: incomingTransform
  };
}
