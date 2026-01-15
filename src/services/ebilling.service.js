import * as repo from '../repositories/ebilling.repo.js';

export const createPublic = ({ tenantId, data, meta }) => 
    repo.create({ tenantId, data, meta });

export const list = ({ tenantId, status, q, page = 1, pageSize = 10 }) => 
    repo.list({ tenantId, status, q, page: Number(page), pageSize: Number(pageSize) });

export const setStatus = ({ tenantId, id, status, userId }) => 
    repo.updateStatus({ tenantId, id, status, handledByUserId: userId });